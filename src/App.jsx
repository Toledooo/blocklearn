import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import StepIndicator from './components/StepIndicator'
import HashView from './views/HashView'
import MiningView from './views/MiningView'
import TransactionView from './views/TransactionView'
import ValidationView from './views/ValidationView'

// Dono do progresso do tour: a trilha (etapa exibida e etapa mais avançada concluída) e os dados
// da simulação ficam aqui, para sobreviverem à troca de tela. A TransactionView cobre as etapas 1 e 2.
export default function App() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(1)
  const [reached, setReached] = useState(1)
  const [transaction, setTransaction] = useState(null)
  const [mining, setMining] = useState(null) // dificuldade escolhida e nonce/hash achados na etapa 4

  if (!started) return <HomeScreen onStart={() => setStarted(true)} />

  let view
  if (step === 3) {
    view = (
      <HashView
        transaction={transaction}
        onContinue={() => {
          setReached((r) => Math.max(r, 4))
          setStep(4)
        }}
      />
    )
  } else if (step === 4) {
    view = (
      <MiningView
        transaction={transaction}
        mining={mining}
        onMined={setMining}
        // shortcut: a trilha só tem 4 círculos e a etapa 5 (validação) ainda é um esqueleto; revisar quando ela existir
        onContinue={() => {
          setReached((r) => Math.max(r, 5))
          setStep(5)
        }}
      />
    )
  } else if (step >= 5) {
    view = <ValidationView />
  } else {
    view = (
      <TransactionView
        step={step}
        reached={reached}
        transaction={transaction}
        onSend={(t) => {
          setTransaction(t)
          setMining(null)
          setReached(2)
          setStep(2)
        }}
        onContinue={() => {
          setReached((r) => Math.max(r, 3))
          setStep(3)
        }}
        // Mudar o dado da etapa n descarta o que veio depois: só dá para avançar de novo refazendo o caminho
        onInvalidate={(n) => {
          setReached(n)
          setTransaction(null)
          setMining(null)
        }}
      />
    )
  }

  return (
    <div className="relative bg-black">
      {/* Trilha única, sempre visível e na mesma posição em todas as telas: no desktop fica na coluna da
          direita, na altura do título (mesmas colunas e tamanho de título das telas); no celular, no topo */}
      <div className="pointer-events-none absolute inset-x-5 top-5 z-10 sm:inset-x-8 lg:inset-x-12 lg:top-6 lg:grid lg:h-[calc(var(--t)*1.25)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-x-12 lg:[--t:clamp(2.25rem,min(5vw,8vh),80px)]">
        <div className="pointer-events-auto w-fit lg:col-start-2 lg:justify-self-center">
          <StepIndicator current={step} reached={reached} onSelect={setStep} />
        </div>
      </div>
      {view}
    </div>
  )
}
