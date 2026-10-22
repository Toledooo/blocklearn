import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createTransaction, isValidTransaction } from '../core/Transaction'
import BlockRow from '../components/BlockRow'
import FadeIn from '../components/FadeIn'
import StepIndicator from '../components/StepIndicator'
import TextField from '../components/TextField'
import Typewriter from '../components/Typewriter'

const TITLE = 'Transação e Blocos'
const INSTRUCTION = 'Informe os dados abaixo para iniciar a simulação:'
const INTRO =
  'Para entender a blockchain, é fundamental primeiro compreender como funcionam os seus blocos. Pense em cada bloco como uma página de um livro-razão digital que, uma vez preenchida e selada, fica permanentemente presa e dependente da página anterior. Nesta simulação você vai criar, minerar e validar um bloco de transações.'
const filledText = ({ from, amount, to }) =>
  `Perfeito! Você montou uma transação: ${from.trim()} enviará ${amount} moedas para ${to.trim()}. Ela é como uma linha nova no livro-razão. Observe que o botão de envio apareceu logo abaixo dos campos: ao clicar, essa linha será colocada em um bloco candidato, uma página ainda em branco esperando para ser selada.`
const sentText = () =>
  'Transação enviada! Observe o bloco candidato na parte de baixo da tela: a transação entrou nele. Esse bloco ainda é provisório; só depois da mineração ele será selado e ligado ao bloco anterior.'

// Orquestra a Etapa 1 do Guided Tour: coleta a transação e, ao enviar, avança para a Etapa 2.
export default function TransactionView({ step, reached, transaction, onSelect, onSend, onInvalidate, onContinue }) {
  // Ao voltar de outra tela a view remonta: recupera os dados e o texto da etapa em vez de recomeçar do zero
  const [values, setValues] = useState(
    transaction ? { from: transaction.from, amount: String(transaction.amount), to: transaction.to } : { from: '', amount: '', to: '' },
  )
  const [stage, setStage] = useState(reached > 1 ? 3 : 0) // 0 título, 1 explicação, 2 instrução, 3 tudo digitado
  const [shown, setShown] = useState(() => (step === 2 ? sentText() : reached > 1 ? filledText(values) : INTRO)) // texto de explicação atual
  const [pending, setPending] = useState(null) // 'filled' | 'sent': o texto atual é apagado antes
  const [explained, setExplained] = useState(false) // a explicação pós-preenchimento terminou

  const typed = stage === 3
  const allFilled = isValidTransaction(values)
  const erasing = pending !== null
  const introActive = shown === INTRO && !erasing

  const changeText = (key) => {
    setExplained(false)
    setPending(key)
  }

  const handleChange = (e) => {
    const next = { ...values, [e.target.name]: e.target.value }
    setValues(next)
    // Mudar os dados invalida a transação já enviada: só dá para avançar de novo reenviando
    if (reached > 1) onInvalidate(1)
    // Ao preencher o último campo, a explicação atual é apagada e dá lugar a outra
    if (introActive && isValidTransaction(next)) changeText('filled')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!allFilled || !explained) return
    onSend(createTransaction(values))
    changeText('sent')
  }

  // Volta (ou reavança) só até etapas já concluídas; a explicação acompanha a etapa exibida
  const goTo = (n) => {
    if (n === step || n > reached) return
    onSelect(n)
    changeText(n === 1 ? 'filled' : 'sent')
  }

  return (
    <main className="grid min-h-dvh gap-x-12 gap-y-4 lg:gap-y-3 overflow-x-clip bg-black px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr_auto] lg:px-12 lg:pb-0 lg:pt-6">
      <h1 className="font-rowdies text-4xl leading-tight font-bold text-neon sm:text-6xl lg:col-start-1 lg:row-start-1 lg:self-center lg:text-[clamp(2.25rem,min(5vw,8vh),80px)]">
        <Typewriter text={TITLE} speed={0.04} showCursor={stage === 1} onDone={() => setStage((s) => Math.max(s, 1))} />
      </h1>

      {/* Trilha na altura do título e centralizada na coluna da direita */}
      <FadeIn show={typed} className="self-start lg:col-start-2 lg:row-start-1 lg:self-center lg:justify-self-center">
        <StepIndicator current={step} reached={reached} onSelect={goTo} />
      </FadeIn>

      {stage >= 1 && (
        <p className="font-mono text-base leading-normal font-bold text-white lg:col-start-1 lg:row-start-2 lg:text-[clamp(0.875rem,min(1.6vw,2.4vh),1.5rem)]">
          <Typewriter
            key={shown}
            text={shown}
            speed={0.012}
            showCursor={stage === 2 || !introActive}
            erase={erasing}
            onErased={() => {
              // o texto é montado só agora, com os valores já completos que o aluno terminou de digitar
              setShown(pending === 'filled' ? filledText(values) : sentText())
              setPending(null)
            }}
            onDone={() => {
              setStage((s) => Math.max(s, 2))
              setExplained(shown !== INTRO)
            }}
          />
        </p>
      )}

      {/* Linha de baixo (metade inferior da tela): blocos à esquerda; instrução e campos
          centralizados no espaço que sobra à direita e na vertical entre o meio da tela e o rodapé */}
      <div className="flex flex-col-reverse gap-8 lg:col-span-2 lg:row-start-3 lg:min-h-[50dvh] lg:flex-row lg:gap-0">
        <FadeIn show={typed} className="lg:mb-[7vh] lg:self-end">
          <BlockRow transaction={step >= 2 ? transaction : null} />
        </FadeIn>

        <div className="flex flex-1 items-center justify-center lg:-mr-12">
          <AnimatePresence>
            {step === 1 && (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                // na 1ª vez o formulário já nasce aberto; ao voltar da etapa 2 ele se expande
                initial={reached > 1 ? { height: 0, opacity: 0 } : false}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0, filter: 'blur(8px)' }}
                transition={{ duration: 0.5 }}
                className="flex w-full max-w-[30rem] flex-col gap-[clamp(0.75rem,2.2vh,1.5rem)] overflow-hidden pt-2.5"
              >
                <p className="font-mono text-[clamp(0.85rem,2vh,1.5rem)] font-bold text-white">
                  {stage >= 2 && (
                    <Typewriter
                      text={INSTRUCTION}
                      speed={0.03}
                      showCursor={stage === 3 && introActive}
                      onDone={() => setStage(3)}
                    />
                  )}
                </p>
                <FadeIn show={typed} className="flex flex-col gap-[clamp(0.75rem,2.4vh,1.75rem)]">
                  <TextField label="Nome do remetente" name="from" placeholder="Ex: João" maxLength={30} value={values.from} onChange={handleChange} />
                  <TextField label="Valor" name="amount" type="number" inputMode="decimal" min="0" step="any" placeholder="Ex: 2500" value={values.amount} onChange={handleChange} />
                  <TextField label="Nome do Recebedor" name="to" placeholder="Ex: Maria" maxLength={30} value={values.to} onChange={handleChange} />
                </FadeIn>
                <FadeIn show={allFilled && explained} className="self-end">
                  <button
                    type="submit"
                    className="min-h-11 cursor-pointer rounded-[10px] border-3 border-neon bg-neon px-6 py-2 font-mono text-[clamp(1rem,2.6vh,1.5rem)] font-bold text-black"
                  >
                    Enviar e Iniciar Simulação
                  </button>
                </FadeIn>
              </motion.form>
            )}
          </AnimatePresence>
          {step === 2 && (
            <FadeIn show={explained}>
              <button
                type="button"
                onClick={onContinue}
                className="min-h-11 cursor-pointer rounded-[10px] border-3 border-neon bg-neon px-6 py-2 font-mono text-[clamp(1rem,2.6vh,1.5rem)] font-bold text-black"
              >
                Continuar
              </button>
            </FadeIn>
          )}
        </div>
      </div>
    </main>
  )
}
