import { Fragment, useEffect, useRef, useState } from 'react'
import { GENESIS_HASH } from '../core/Block'
import { buildChain, editBlock, validateChain } from '../core/Chain'
import ChainBlock from '../components/ChainBlock'
import ChainLink from '../components/ChainLink'
import FadeIn from '../components/FadeIn'
import Typewriter from '../components/Typewriter'

const TITLE = 'Imutabilidade'
const INTRO =
  'Nessa sessão vamos realizar um teste de imutabilidade nos blocos já alocados. É essa estrutura que garante a imutabilidade da tecnologia: como tudo está interligado, se alguém tentar alterar os dados de uma transação no passado, o hash daquele bloco mudará completamente. Isso invalidará automaticamente a "impressão digital" que foi repassada para o bloco seguinte, quebrando toda a corrente. Para conseguir fraudar o sistema, um invasor precisaria controlar mais de 50% de todo o poder computacional da rede para recalcular todos os blocos subsequentes, o que torna a blockchain extremamente segura.\n\nExperimente: altere o nome ou o valor de uma transação em qualquer bloco e observe a corrente.'
const RESTORED =
  'Os dados voltaram aos originais, o hash é o mesmo de antes e a corrente se religou: todos os blocos estão verdes de novo! Os mesmos dados sempre geram o mesmo hash, e é essa regra que torna qualquer adulteração do passado visível para toda a rede.'
const brokenText = (n, last) =>
  `Você alterou os dados do Bloco ${n} e o hash dele mudou completamente: o hash novo (em vermelho) nem começa com os zeros que a rede exige. ${
    last
      ? 'Como este é o último bloco, não há bloco seguinte para quebrar, mas o hash dele já não vale e a rede o recusaria.'
      : `Só que o Bloco ${n + 1} ainda guarda o hash antigo no campo "Hash anterior", então a ligação não bate mais e a corrente se partiu: repare nas linhas e nos blocos seguintes, todos vermelhos, pois deixaram de estar ligados a uma corrente válida.`
  } Para consertar, o invasor teria de minerar de novo o Bloco ${n} e todos os seguintes, e ainda ser mais rápido que o resto da rede. Devolva os dados originais para religar a corrente.`
// blocos de exemplo depois do bloco do aluno
const EXAMPLES = [
  { from: 'Bob', amount: 30, to: 'Carla' },
  { from: 'Carla', amount: 15, to: 'Davi' },
]
const FIELDS = ['from', 'to', 'amount']
const STEP = 0.15 // atraso entre uma ligação e a próxima na cascata de quebra

// Etapa 4 do Guided Tour: o aluno tenta alterar um bloco já selado e vê a corrente se quebrar.
// A alteração é só um teste: a corrente original, guardada no App, continua intacta.
// Tem duas subtelas (textos): a introdução e o resultado da última alteração.
export default function ImmutabilityView({ transaction, mining, chain, onChain, onSub, jump }) {
  const [stage, setStage] = useState(0) // 0 título, 1 texto, 2 tudo digitado
  const [topic, setTopic] = useState('intro') // texto exibido: intro | broken:N | restored
  const [shown, setShown] = useState(INTRO)
  const [pending, setPending] = useState(null) // próximo texto: o atual é apagado antes
  const [edited, setEdited] = useState(null) // corrente com as alterações do aluno (null = intacta)
  const [results, setResults] = useState(null) // [{ status, currentHash }] da corrente exibida
  const [touched, setTouched] = useState(false) // o aluno já alterou algo ao menos uma vez
  const [lastResult, setLastResult] = useState(null) // último texto de resultado, para a bolinha 2 da trilha
  const rowRef = useRef(null)

  const difficulty = mining.difficulty
  const current = edited ?? chain
  const typed = stage >= 2

  // a corrente de exemplo é minerada em core/ uma vez e guardada no App
  useEffect(() => {
    if (chain) return
    const controller = new AbortController()
    const first = { index: 1, from: transaction.from, amount: transaction.amount, to: transaction.to, previousHash: GENESIS_HASH, nonce: mining.nonce, hash: mining.hash }
    buildChain(first, EXAMPLES, difficulty, { signal: controller.signal }).then(onChain, () => {}) // abortar não é erro
    return () => controller.abort()
  }, [chain, transaction, mining, difficulty, onChain])

  // revalida a cada alteração (com uma pausa curta, para não refazer os hashes a cada tecla)
  useEffect(() => {
    if (!current) return
    let cancelled = false
    const timer = setTimeout(() => {
      validateChain(current, difficulty).then((r) => !cancelled && setResults(r))
    }, 80)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [current, difficulty])

  // mostra o início da corrente cortado pela borda, como no Figma; o resto se alcança rolando dentro da faixa
  useEffect(() => {
    const row = rowRef.current
    if (chain && row?.firstElementChild) row.scrollLeft = row.firstElementChild.offsetWidth * 0.66
  }, [chain])

  const status = (i) => results?.[i]?.status ?? 'ok'
  const firstBad = results ? results.findIndex((r) => r.status !== 'ok') : -1
  const anyBad = firstBad >= 0
  const dirty = edited !== null && current.some((b, i) => FIELDS.some((f) => String(b[f]) !== String(chain[i][f])))
  if (anyBad && !touched) setTouched(true)

  // texto de resultado conforme o estado da corrente: troca sozinho quando a situação muda
  const desired = anyBad ? `broken:${current[firstBad].index}` : touched ? 'restored' : null
  const [seenDesired, setSeenDesired] = useState(null)
  if (desired !== seenDesired) {
    setSeenDesired(desired)
    if (desired !== null) {
      setLastResult(desired)
      setPending(desired)
    }
  }
  const textFor = (key) => {
    if (key === 'intro') return INTRO
    if (key === 'restored') return RESTORED
    const n = Number(key.split(':')[1])
    return brokenText(n, n === current[current.length - 1].index)
  }

  // subtelas da trilha: a introdução e o texto do resultado (só existe depois da primeira alteração)
  const subIndex = (pending ?? topic) === 'intro' ? 0 : 1
  const subMax = touched ? 1 : 0
  useEffect(() => {
    onSub({ count: 2, index: subIndex, max: subMax })
  }, [subIndex, subMax, onSub])

  // clique numa bolinha da trilha: o texto atual é apagado e dá lugar ao da subtela pedida
  const [seenJump, setSeenJump] = useState(jump)
  if (jump !== seenJump) {
    setSeenJump(jump)
    const target = jump.index === 0 ? 'intro' : lastResult
    if (jump.index <= subMax && target !== (pending ?? topic)) setPending(target)
  }

  // cascata: a quebra (ou a reconexão) corre da esquerda para a direita
  const linkDelay = (i) => (anyBad ? Math.max(0, i - firstBad) * STEP : Math.max(0, i) * 0.1)

  return (
    <main className="relative flex min-h-dvh flex-col gap-4 overflow-x-clip bg-black px-5 pt-[4.5rem] pb-8 sm:px-8 lg:gap-[clamp(0.5rem,1.6vh,1rem)] lg:px-12 lg:pt-6 lg:pb-0">
      <h1 className="font-rowdies text-4xl leading-tight font-bold text-neon sm:text-6xl lg:text-[clamp(2.25rem,min(5vw,8vh),80px)]">
        <Typewriter text={TITLE} speed={0.04} showCursor={stage === 1} onDone={() => setStage((s) => Math.max(s, 1))} />
      </h1>

      {stage >= 1 && (
        <p className="font-mono text-base leading-normal font-bold whitespace-pre-line text-white lg:text-[clamp(0.8rem,min(1.5vw,2.2vh),1.5rem)]">
          <Typewriter
            key={shown}
            text={shown}
            speed={0.012}
            erase={pending !== null}
            onErased={() => {
              setShown(textFor(pending))
              setTopic(pending)
              setPending(null)
            }}
            onDone={() => setStage((s) => Math.max(s, 2))}
          />
        </p>
      )}

      {/* Corrente: no desktop é uma fileira que rola só dentro da faixa (os blocos das pontas ficam cortados, como no Figma);
          no celular vira uma coluna */}
      <FadeIn show={typed} className="-mx-5 sm:-mx-8 lg:-mx-12 lg:mt-auto lg:mb-[clamp(1.5rem,5vh,3rem)]">
        {/* botão numa faixa de altura fixa acima da corrente: não muda de lugar quando o texto cresce ou encolhe */}
        <div className="mb-6 flex min-h-11 justify-end px-5 sm:px-8 lg:px-12">
          <FadeIn show={dirty} className="flex justify-end">
            <button
              type="button"
              onClick={() => setEdited(null)}
              className="min-h-11 cursor-pointer rounded-[10px] border-3 border-neon bg-neon px-6 py-2 font-mono text-[clamp(1rem,2.6vh,1.5rem)] font-bold text-black"
            >
              Restaurar dados
            </button>
          </FadeIn>
        </div>
        <div
          ref={rowRef}
          data-testid="chain"
          style={{ '--w': 'clamp(15rem,min(29.7vw,50vh),560px)' }}
          className="flex flex-col items-center px-5 sm:px-8 lg:-my-8 lg:flex-row lg:overflow-x-auto lg:px-0 lg:py-8 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
        >
          {!chain ? (
            <p className="font-mono text-base font-bold text-white">Montando a corrente…</p>
          ) : (
            <>
              <ChainBlock genesis status="ok" block={{ hash: GENESIS_HASH }} />
              {current.map((block, i) => (
                <Fragment key={block.index}>
                  <ChainLink broken={i > 0 && status(i - 1) !== 'ok'} delay={linkDelay(i - 1)} />
                  <ChainBlock
                    block={block}
                    status={status(i)}
                    currentHash={results?.[i]?.currentHash}
                    previousStale={status(i) === 'broken' && i > 0 && results?.[i - 1]?.currentHash !== block.previousHash}
                    delay={status(i) === 'altered' ? 0 : linkDelay(i - 1) + 0.1}
                    onEdit={(patch) => setEdited(editBlock(current, block.index, patch))}
                  />
                </Fragment>
              ))}
            </>
          )}
        </div>
      </FadeIn>
    </main>
  )
}
