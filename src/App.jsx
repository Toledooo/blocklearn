import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import TransactionView from './views/TransactionView'

// Dono do progresso do tour: a trilha (etapa exibida e etapa mais avançada concluída) e os dados
// da simulação ficam aqui, para sobreviverem à troca de tela. Hoje só a TransactionView (etapas 1 e 2) existe.
export default function App() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(1)
  const [reached, setReached] = useState(1)
  const [transaction, setTransaction] = useState(null)

  if (!started) return <HomeScreen onStart={() => setStarted(true)} />
  return (
    <TransactionView
      step={step}
      reached={reached}
      transaction={transaction}
      onSelect={setStep}
      onSend={(t) => {
        setTransaction(t)
        setReached(2)
        setStep(2)
      }}
      // Mudar o dado da etapa n descarta o que veio depois: só dá para avançar de novo refazendo o caminho
      onInvalidate={(n) => {
        setReached(n)
        setTransaction(null)
      }}
    />
  )
}
