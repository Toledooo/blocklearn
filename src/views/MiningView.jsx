import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import arrow from '../assets/arrow1.svg'
import { GENESIS_HASH, hashBlock, mineBlock } from '../core/Block'
import BlockRow from '../components/BlockRow'
import { formatTimestamp } from '../utils/formatTimestamp'
import BottomBar from '../components/BottomBar'
import FadeIn from '../components/FadeIn'
import SpinHash from '../components/SpinHash'
import Typewriter from '../components/Typewriter'

const TITLE = 'Proof of Work'
const INTRO =
  'Para que essa nova página seja aceita e registrada definitivamente, o minerador precisa iniciar um processo de validação conhecido como "Prova de Trabalho" (Proof of Work), que consiste no esforço computacional de encontrar um hash válido que identifique esse bloco recém-formado.\n\nO primeiro passo é decidir o quão difícil será esse quebra-cabeça: escolha uma dificuldade nos botões da tela.\n\nNa vida real, um bloco reúne dezenas ou centenas de transações; aqui, para simplificar, ele leva apenas a sua.'
const NONCE_TEXT =
  'O grande desafio da mineração é que a rede exige que o hash gerado comece com uma quantidade específica de zeros. Como as transações e o hash anterior não podem ser alterados, o computador do minerador fica mudando o valor do nonce (incrementando um de cada vez) e gerando novos hashes repetidamente, num processo de tentativa e erro ultrarrápido. Quando o computador finalmente "dá sorte" e encontra um nonce que produz o hash com os zeros exigidos, o quebra-cabeça é resolvido e o bloco é adicionado com segurança à corrente.\n\nObserve o nonce subindo no bloco da direita enquanto o campo Hash gira: é a busca acontecendo.'
const AVERAGE = { 1: '16', 2: '256', 3: '4.096' }
const zerosOf = (n) => `${n} ${n === 1 ? 'zero' : 'zeros'}`
const diffText = (n) =>
  `Você escolheu a dificuldade ${n}: agora a rede exige que o hash comece com ${zerosOf(n)}. O hash é escrito em hexadecimal (dígitos de 0 a 9 e letras de a a f), então cada posição tem 16 valores possíveis e a chance de sair um zero é de 1 em 16. Cada zero a mais deixa o quebra-cabeça 16 vezes mais difícil: com ${zerosOf(n)}, o computador precisa de cerca de ${AVERAGE[n]} tentativas em média. A rede ajusta essa exigência para controlar o ritmo em que blocos novos surgem e para que forjar um bloco custe caro. Repare no bloco da direita: ele já mostra a dificuldade escolhida.`
const SPIN_MS = 2500 // a roleta gira por pelo menos isso, mesmo se o laço real achar o hash em milissegundos
const HOLD_MS = 2000 // tempo para ler o texto da dificuldade antes de ele dar lugar ao texto da mineração
const short = (hash) => `${hash.slice(0, 8)}…`

// Lista de pares rótulo/valor do bloco (uma grade de duas colunas)
const Rows = ({ label, rows }) => (
  <dl aria-label={label} className="grid min-w-0 grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs leading-snug text-white sm:text-sm lg:text-[clamp(0.65rem,1.8vh,0.9rem)]">
    {rows.map(([name, value]) => (
      <div key={name} className="col-span-2 grid grid-cols-subgrid">
        <dt className="font-bold text-neon">{name}</dt>
        <dd className="break-words">{value}</dd>
      </div>
    ))}
  </dl>
)

// Etapa 3 do Guided Tour: o aluno escolhe a dificuldade e vê o minerador testando nonces até o hash valer.
// Tem três subtelas (textos): introdução, dificuldade escolhida e explicação da busca pelo nonce.
const TOPICS = ['intro', 'diff', 'nonce']
export default function MiningView({ transaction, mining, onMined, onContinue, onSub, jump }) {
  const reduce = useReducedMotion()
  const [restored] = useState(mining !== null) // voltou pela trilha com a mineração já feita
  const [stage, setStage] = useState(restored ? 2 : 0) // 0 título, 1 texto, 2 tudo digitado
  const [topic, setTopic] = useState(restored ? 'nonce' : 'intro') // texto exibido: intro | diff | nonce
  const [pending, setPending] = useState(null) // próximo texto: o atual é apagado antes
  const [maxSub, setMaxSub] = useState(restored ? 2 : 0) // subtela mais avançada já alcançada
  const [difficulty, setDifficulty] = useState(mining?.difficulty ?? null)
  const [phase, setPhase] = useState(restored ? 'done' : 'idle') // idle | spinning | locking | done
  const [result, setResult] = useState(mining)
  const [nonce, setNonce] = useState(mining?.nonce ?? 0)
  const [baseHash, setBaseHash] = useState('')
  const [diffRead, setDiffRead] = useState(false)
  const [explained, setExplained] = useState(false)

  const data = { index: 1, timestamp: transaction.timestamp, from: transaction.from, amount: transaction.amount, to: transaction.to, previousHash: GENESIS_HASH }
  const typed = stage >= 2
  const chosen = difficulty !== null
  const text = topic === 'intro' ? INTRO : topic === 'diff' ? diffText(difficulty) : NONCE_TEXT

  // subtelas da trilha: introdução, texto da dificuldade e texto da mineração (a bolinha já avança quando o texto novo é pedido)
  const subIndex = TOPICS.indexOf(pending ?? topic)
  useEffect(() => {
    onSub({ count: 3, index: subIndex, max: maxSub })
  }, [subIndex, maxSub, onSub])

  // clique numa bolinha da trilha: o texto atual é apagado e dá lugar ao da subtela pedida
  const [seenJump, setSeenJump] = useState(jump)
  if (jump !== seenJump) {
    setSeenJump(jump)
    if (jump.index <= maxSub && TOPICS[jump.index] !== (pending ?? topic)) setPending(TOPICS[jump.index])
  }

  // hash de partida (nonce 0): o mesmo que o aluno viu na etapa anterior
  useEffect(() => {
    if (restored) return
    let cancelled = false
    hashBlock(data).then((h) => !cancelled && setBaseHash(h))
    return () => {
      cancelled = true
    }
    // depende só da transação com que a tela foi aberta
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // a busca real roda em core/; a tela só guarda o resultado
  useEffect(() => {
    if (phase !== 'spinning') return
    const controller = new AbortController()
    mineBlock(data, difficulty, { signal: controller.signal }).then(setResult, () => {}) // abortar não é erro
    return () => controller.abort()
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // shortcut: o nonce exibido sobe até o valor real em SPIN_MS; o laço real termina antes, mas o número final é o dele
  useEffect(() => {
    if (phase !== 'spinning' || !result) return
    if (reduce) {
      setNonce(result.nonce)
      setPhase('locking')
      return
    }
    const counter = animate(0, result.nonce, {
      duration: SPIN_MS / 1000,
      ease: 'linear',
      onUpdate: (v) => setNonce(Math.round(v)),
      onComplete: () => {
        setNonce(result.nonce)
        setPhase('locking')
      },
    })
    // clique duplo pula a contagem do nonce e passa direto para o travamento do hash
    const skip = () => counter.complete()
    window.addEventListener('dblclick', skip)
    return () => {
      window.removeEventListener('dblclick', skip)
      counter.stop()
    }
  }, [phase, result, reduce])

  useEffect(() => {
    if (!diffRead) return
    const timer = setTimeout(() => {
      setPending('nonce')
      setMaxSub(2)
    }, HOLD_MS)
    return () => clearTimeout(timer)
  }, [diffRead])

  const choose = (n) => {
    if (chosen) return
    setDifficulty(n)
    setMaxSub(1)
    setPending('diff')
  }

  const handleLocked = () => {
    setPhase('done')
    onMined({ difficulty, ...result })
  }

  const stateHash = restored || result ? result?.hash : baseHash
  const blockRows = [
    ['Bloco', String(data.index)],
    ['Hash anterior', short(GENESIS_HASH)],
    ['Dificuldade', chosen ? zerosOf(difficulty) : '—'],
    ['Nonce', <span key="n" data-testid="nonce">{nonce}</span>],
  ]
  const txRows = [
    ['Data', formatTimestamp(data.timestamp)],
    ['De', data.from],
    ['Para', data.to],
    ['Valor', `${data.amount} moedas`],
  ]

  return (
    <main className="relative flex min-h-dvh flex-col gap-4 overflow-x-clip bg-black px-5 pt-[4.5rem] pb-8 sm:px-8 lg:gap-[clamp(0.5rem,1.6vh,1rem)] lg:px-12 lg:pt-6 lg:pb-0">
      {/* --t é o tamanho do título; o subtítulo usa as mesmas proporções da etapa 2 */}
      <div className="[--t:2.25rem] sm:[--t:3.75rem] lg:[--t:clamp(2.25rem,min(5vw,8vh),80px)]">
        <h1 className="font-rowdies text-[length:var(--t)] leading-[normal] font-bold text-neon">
          <Typewriter text={TITLE} speed={0.04} showCursor={stage === 1} onDone={() => setStage((s) => Math.max(s, 1))} />
        </h1>
        <FadeIn
          show={stage >= 1}
          className="mt-[calc(var(--t)*-0.089)] pl-[calc(var(--t)*3.12)] font-mono text-[length:max(1rem,calc(var(--t)*0.267))] leading-[normal] font-bold text-neon"
        >
          ou Mineração
        </FadeIn>
      </div>

      {stage >= 1 && (
        <p className="font-mono text-base leading-normal font-bold whitespace-pre-line text-white lg:text-[clamp(0.8rem,min(1.5vw,2.2vh),1.5rem)]">
          <Typewriter
            key={topic}
            text={text}
            speed={0.012}
            erase={pending !== null}
            onErased={() => {
              setTopic(pending)
              setPending(null)
            }}
            onDone={() => {
              setStage((s) => Math.max(s, 2))
              if (topic === 'diff') {
                setDiffRead(true)
                setPhase((p) => (p === 'idle' ? 'spinning' : p)) // reler o texto não minera de novo
              }
              if (topic === 'nonce') setExplained(true)
            }}
          />
        </p>
      )}

      {/* Desktop: dificuldade e hash ficam na coluna da direita, centradas entre os blocos e a borda direita, com folga em relação à parte de baixo */}
      <div className="pointer-events-none lg:absolute lg:z-10 lg:inset-x-12 lg:bottom-[24vh] lg:grid lg:grid-cols-2 lg:gap-x-12">
        <div className="pointer-events-auto flex flex-col gap-4 lg:col-start-2 lg:w-full lg:max-w-[44rem] lg:px-6 lg:justify-self-center lg:gap-[clamp(0.75rem,2.4vh,1.5rem)]">
          <FadeIn show={typed} className="flex flex-wrap items-center justify-center gap-3">
            <span id="difficulty-label" className="font-mono text-[clamp(0.9rem,2.2vh,1.25rem)] font-bold text-white">
              Dificuldade:
            </span>
            <div role="group" aria-labelledby="difficulty-label" className="flex gap-3">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={chosen}
                  aria-pressed={difficulty === n}
                  aria-label={`Dificuldade ${n}: o hash começa com ${zerosOf(n)}`}
                  onClick={() => choose(n)}
                  className={`size-11 rounded-[10px] border-3 border-neon font-mono text-lg font-bold ${
                    difficulty === n ? 'bg-neon text-black' : 'bg-black text-neon'
                  } ${chosen ? (difficulty === n ? 'cursor-default' : 'cursor-not-allowed opacity-40') : 'cursor-pointer'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </FadeIn>

          <FadeIn show={typed}>
            <SpinHash hash={stateHash ?? ''} phase={phase} zeros={difficulty ?? 0} onLocked={handleLocked} />
          </FadeIn>
        </div>
      </div>

      <FadeIn show={typed} className="mt-4 lg:mt-auto lg:mb-[clamp(1.5rem,5vh,3rem)]">
        <BlockRow
          solved={phase === 'done'}
          size="clamp(16rem,min(34vw,52vh),560px)"
          previous={
            <div className="text-right font-mono text-[clamp(0.65rem,1.8vh,0.9rem)] leading-snug text-white">
              <p className="font-bold text-neon">Bloco anterior</p>
              <p>Hash {short(GENESIS_HASH)}</p>
            </div>
          }
        >
          {/* dados do bloco e da transação ficam em grupos separados: o bloco é o envelope, a transação é o conteúdo */}
          <div className="flex min-w-0 flex-col gap-[clamp(0.35rem,1.2vh,0.75rem)]">
            <Rows label="Dados do bloco" rows={blockRows} />
            <section aria-label="Transações do bloco" className="border-t border-neon/50 pt-[clamp(0.35rem,1.2vh,0.75rem)]">
              <p className="mb-1 font-mono text-xs font-bold text-neon sm:text-sm lg:text-[clamp(0.65rem,1.8vh,0.9rem)]">Transação</p>
              <Rows label="Transação no bloco" rows={txRows} />
              <p className="mt-1.5 font-mono text-[clamp(0.6rem,1.6vh,0.8rem)] leading-snug text-white/60">+ outras transações do bloco…</p>
            </section>
          </div>
        </BlockRow>
      </FadeIn>

      <BottomBar
        floating
        right={
          <FadeIn show={phase === 'done' && (explained || restored)}>
            <button
              type="button"
              onClick={onContinue}
              className="flex min-h-11 cursor-pointer items-center gap-4 rounded-[10px] border-3 border-neon bg-neon px-6 py-2 font-mono text-[clamp(1rem,2.6vh,1.5rem)] font-bold text-black"
            >
              Próximo
              <img src={arrow} alt="" className="w-8 sm:w-10" />
            </button>
          </FadeIn>
        }
      />
    </main>
  )
}
