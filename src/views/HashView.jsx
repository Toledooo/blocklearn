import { useEffect, useState } from 'react'
import arrow from '../assets/arrow1.svg'
import { hashBlock } from '../core/Block'
import BottomBar from '../components/BottomBar'
import FadeIn from '../components/FadeIn'
import HashField from '../components/HashField'
import TextField from '../components/TextField'
import Typewriter from '../components/Typewriter'
import { formatTimestamp } from '../utils/formatTimestamp'

const TITLE = 'Geração de Hash'
const INTRO =
  'O hash funciona como uma "impressão digital" única e inviolável de um bloco. A geração do hash começa logo depois que os computadores da rede, conhecidos como mineradores, recebem novas transações e as agrupam para formar esse novo bloco.\n\nPara criar esse hash na prática, são necessárias algumas informações do bloco: a sua posição numérica (índice), o momento em que a transação foi registrada (timestamp), os dados contidos nas transações, o hash do bloco imediatamente anterior e um número especial e ajustável chamado nonce. Tudo isso é misturado por meio de uma fórmula matemática complexa, como o algoritmo SHA-256, que transforma esses dados de entrada em um código de tamanho fixo.\n\nExperimente: altere um dos dados ao lado e clique em "Alterar" para ver o que acontece com o hash.'
const DIFFERENT =
  'Você mudou os dados e o hash ficou completamente diferente, repare no campo Hash! É assim que a rede percebe qualquer adulteração: se alguém mexer em um bloco já selado, o selo antigo não bate mais com o novo. Para ver outra propriedade, devolva os dados originais e clique em "Alterar" de novo.'
const SAME =
  'Os dados voltaram a ser os originais e o hash é exatamente o mesmo de antes! Os mesmos dados sempre geram o mesmo hash, e é por isso que a rede consegue conferir um bloco: basta refazer o cálculo e comparar com o selo.'
const KEYS = ['from', 'amount', 'to']

// Etapa 2 do Guided Tour: o aluno altera os dados da transação e vê o hash do bloco ser refeito.
// A alteração é só um teste: a transação enviada na etapa 1 continua intacta.
// Tem duas subtelas (textos): a introdução e a explicação do resultado da alteração.
const TEXTS = { intro: INTRO, different: DIFFERENT, same: SAME }
export default function HashView({ transaction, onContinue, onSub, jump }) {
  const initial = { timestamp: transaction.timestamp, from: transaction.from, amount: String(transaction.amount), to: transaction.to }
  const [values, setValues] = useState(initial)
  const [applied, setApplied] = useState(initial) // dados que geraram o hash exibido
  const [hash, setHash] = useState('')
  const [originalHash, setOriginalHash] = useState('')
  const [stage, setStage] = useState(0) // 0 título, 1 explicação, 2 tudo digitado
  const [shown, setShown] = useState(INTRO)
  const [topic, setTopic] = useState('intro') // texto exibido: intro | different | same
  const [result, setResult] = useState(null) // resultado da última alteração: different | same
  const [pending, setPending] = useState(null) // próximo texto: o atual é apagado antes
  const [explained, setExplained] = useState(false)
  const [altered, setAltered] = useState(false) // o aluno já clicou em "Alterar" ao menos uma vez

  useEffect(() => {
    let cancelled = false
    hashBlock(initial).then((h) => {
      if (cancelled) return
      setHash(h)
      setOriginalHash(h)
    })
    return () => {
      cancelled = true
    }
    // o hash inicial depende só da transação com que a tela foi aberta
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const typed = stage >= 2
  const erasing = pending !== null

  // subtelas da trilha: a introdução e o texto do resultado da alteração (só existe depois de "Alterar")
  const subIndex = (pending ?? topic) === 'intro' ? 0 : 1
  const subMax = altered ? 1 : 0
  useEffect(() => {
    onSub({ count: 2, index: subIndex, max: subMax })
  }, [subIndex, subMax, onSub])

  // clique numa bolinha da trilha: o texto atual é apagado e dá lugar ao da subtela pedida
  const [seenJump, setSeenJump] = useState(jump)
  if (jump !== seenJump) {
    setSeenJump(jump)
    const target = jump.index === 0 ? 'intro' : result
    if (jump.index <= subMax && target !== (pending ?? topic)) setPending(target)
  }
  const dirty = KEYS.some((k) => values[k].trim() !== applied[k].trim())

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value })

  const handleAlter = async () => {
    const snapshot = values
    const next = await hashBlock(snapshot)
    setApplied(snapshot)
    setHash(next)
    setAltered(true)
    setExplained(false)
    const key = next === originalHash ? 'same' : 'different'
    setResult(key)
    setPending(key)
  }

  return (
    <main className="grid min-h-dvh gap-x-12 gap-y-4 overflow-x-clip bg-black px-5 pt-[4.5rem] pb-8 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr_auto] lg:gap-y-3 lg:px-12 lg:pt-6 lg:pb-[clamp(1.5rem,5vh,3rem)]">
      {/* --t é o tamanho do título; o subtítulo usa as proporções do Figma (90px de título: recuo de 280px, 8px sobrepostos) */}
      <div className="[--t:2.25rem] sm:[--t:3.75rem] lg:col-start-1 lg:row-start-1 lg:self-center lg:[--t:clamp(2.25rem,min(5vw,8vh),80px)]">
        <h1 className="font-rowdies text-[length:var(--t)] leading-[normal] font-bold text-neon">
          <Typewriter text={TITLE} speed={0.04} showCursor={stage === 1} onDone={() => setStage((s) => Math.max(s, 1))} />
        </h1>
      </div>

      {stage >= 1 && (
        <p className="font-mono text-base leading-normal font-bold whitespace-pre-line text-white lg:col-start-1 lg:row-start-2 lg:text-[clamp(0.8rem,min(1.5vw,2.2vh),1.5rem)]">
          <Typewriter
            key={shown}
            text={shown}
            speed={0.012}
            erase={erasing}
            onErased={() => {
              setShown(TEXTS[pending])
              setTopic(pending)
              setPending(null)
            }}
            onDone={() => {
              setStage((s) => Math.max(s, 2))
              if (shown !== INTRO) setExplained(true)
            }}
          />
        </p>
      )}

      <FadeIn
        show={typed}
        className="flex flex-col justify-center gap-[clamp(0.75rem,2.2vh,1.5rem)] lg:col-start-2 lg:row-start-2 lg:w-full lg:max-w-[30rem] lg:justify-self-center"
      >
        <p className="text-center font-mono text-[clamp(0.9rem,2.2vh,1.5rem)] font-bold text-white">Teste alterar os dados:</p>
        <p className="text-center font-mono text-[clamp(0.75rem,1.8vh,1.1rem)] text-white/70">Registrado em {formatTimestamp(transaction.timestamp)}</p>
        <TextField label="Nome do remetente" name="from" placeholder="Ex: João" maxLength={30} value={values.from} onChange={handleChange} />
        <TextField label="Valor" name="amount" type="number" inputMode="decimal" min="0" step="any" placeholder="Ex: 2000" value={values.amount} onChange={handleChange} />
        <TextField label="Nome do recebedor" name="to" placeholder="Ex: Maria" maxLength={30} value={values.to} onChange={handleChange} />
        <FadeIn show={dirty} className="self-end">
          <button
            type="button"
            onClick={handleAlter}
            className="min-h-11 cursor-pointer rounded-[10px] border-3 border-neon bg-neon px-6 py-2 font-mono text-[clamp(1rem,2.6vh,1.5rem)] font-bold text-black"
          >
            Alterar
          </button>
        </FadeIn>
      </FadeIn>

      <BottomBar
        left={
          <FadeIn show={typed}>
            <HashField value={hash} />
          </FadeIn>
        }
        right={
          <FadeIn show={altered && explained}>
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
