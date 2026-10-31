import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import StepIndicator from './components/StepIndicator'
import ClosingView from './views/ClosingView'
import HashView from './views/HashView'
import ImmutabilityView from './views/ImmutabilityView'
import MiningView from './views/MiningView'
import TransactionView from './views/TransactionView'

// Dono do progresso do tour: a trilha (etapa exibida e etapa mais avançada concluída) e os dados
// da simulação ficam aqui, para sobreviverem à troca de tela. A etapa 5 é a tela final de agradecimento, fora da trilha. As etapas 1 a 4 têm subtelas (textos que se alternam na mesma tela).
export default function App() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(1)
  const [reached, setReached] = useState(1)
  const [transaction, setTransaction] = useState(null)
  const [mining, setMining] = useState(null) // dificuldade escolhida e nonce/hash achados na etapa 4
  const [sub, setSub] = useState({ count: 1, index: 0, max: 0 }) // subtelas da etapa exibida, informadas por cada view
  const [chain, setChain] = useState(null) // corrente de exemplo da etapa 4 (o bloco do aluno + blocos seguintes), minerada uma vez
  const [jump, setJump] = useState(null) // pedido de ir a uma subtela (clique numa bolinha da trilha), atendido pela view

  const fade = { duration: useReducedMotion() ? 0 : 0.3 }

  let view
  if (!started) {
    view = <HomeScreen onStart={() => setStarted(true)} />
  } else if (step === 5) {
    view = (
      <ClosingView
        onRestart={() => {
          setStarted(false)
          setStep(1)
          setReached(1)
          setTransaction(null)
          setMining(null)
          setChain(null)
        }}
      />
    )
  } else if (step === 2) {
    view = (
      <HashView
        onSub={setSub}
        jump={jump}
        transaction={transaction}
        onContinue={() => {
          setReached((r) => Math.max(r, 3))
          setStep(3)
        }}
      />
    )
  } else if (step === 3) {
    view = (
      <MiningView
        onSub={setSub}
        jump={jump}
        transaction={transaction}
        mining={mining}
        onMined={(m) => {
          setMining(m)
          setChain(null)
        }}
        onContinue={() => {
          setReached((r) => Math.max(r, 4))
          setStep(4)
        }}
      />
    )
  } else if (step === 4) {
    view = <ImmutabilityView onSub={setSub} jump={jump} transaction={transaction} mining={mining} chain={chain} onChain={setChain} onFinish={() => setStep(5)} />
  } else {
    view = (
      <TransactionView
        onSub={setSub}
        jump={jump}
        reached={reached}
        transaction={transaction}
        onSend={(t) => {
          setTransaction(t)
          setMining(null)
          setChain(null)
          setReached(2)
        }}
        onContinue={() => {
          setReached((r) => Math.max(r, 2))
          setStep(2)
        }}
        // Mudar o dado da etapa n descarta o que veio depois: só dá para avançar de novo refazendo o caminho
        onInvalidate={(n) => {
          setReached(n)
          setTransaction(null)
          setMining(null)
          setChain(null)
        }}
      />
    )
  }

  return (
    <div className="relative bg-black">
      {/* Trilha única, sempre visível e na mesma posição em todas as telas: no desktop fica na coluna da
          direita, na altura do título (mesmas colunas e tamanho de título das telas); no celular, no topo */}
      {started && step < 5 && (
      <div className="pointer-events-none absolute inset-x-5 top-5 z-10 sm:inset-x-8 lg:inset-x-12 lg:top-6 lg:grid lg:h-[calc(var(--t)*1.25)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-x-12 lg:[--t:clamp(2.25rem,min(5vw,8vh),80px)]">
        <div className="pointer-events-auto w-fit lg:col-start-2 lg:justify-self-center">
          <StepIndicator current={step} reached={reached} onSelect={setStep} sub={sub} onSubSelect={(index) => setJump({ index })} />
        </div>
      </div>
      )}
      {/* fade-out da tela que sai antes de a próxima entrar */}
      <AnimatePresence mode="wait">
        <motion.div key={started ? step : 0} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
          {view}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
