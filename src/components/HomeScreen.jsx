import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import arrow from '../assets/arrow1.svg'
import Typewriter from './Typewriter'

const TITLE = 'BlockLearn'
const SUBTITLE = 'Um ambiente de simulação e explicação dos principais pilares de uma Blockchain.'
const SPEED = 0.04 // segundos por caractere
// O subtítulo só começa a ser digitado depois que o título terminou.
const SUBTITLE_DELAY = TITLE.length * SPEED + 0.3
const BUTTON_DELAY = SUBTITLE_DELAY + SUBTITLE.length * SPEED

// Tela inicial: é a porta de entrada do simulador. Apresenta o projeto ao aluno
// e convida a iniciar o "Guided Tour". Contém apenas UI — nenhuma lógica de blockchain (core/).
export default function HomeScreen({ onStart }) {
  // Só o texto digitado mais recente mantém o cursor: o do título some quando o subtítulo começa.
  const [subtitleStarted, setSubtitleStarted] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setSubtitleStarted(true), SUBTITLE_DELAY * 1000)
    return () => clearTimeout(id)
  }, [])

  return (
    <main className="flex min-h-dvh flex-col overflow-x-clip bg-black px-6 py-10 sm:px-12 lg:px-24">
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-rowdies text-[clamp(2.75rem,min(10vw,16vh),128px)] leading-normal font-bold text-neon">
          <Typewriter text={TITLE} speed={SPEED} showCursor={!subtitleStarted} />
        </h1>
        <p className="mt-4 max-w-[609px] font-mono text-base leading-normal font-bold text-white sm:text-xl lg:text-2xl">
          <Typewriter text={SUBTITLE} delay={SUBTITLE_DELAY} speed={SPEED} />
        </p>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18, delay: BUTTON_DELAY }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="mt-10 flex min-h-20 w-full cursor-pointer items-center justify-center gap-[15px] rounded-[10px] border-3 border-neon bg-neon font-mono text-2xl font-bold text-black sm:h-[114px] sm:w-[348px] sm:items-center sm:justify-start sm:self-end sm:pl-[46px] sm:text-[32px] lg:mb-[6vh]"
      >
        Começar
        <img src={arrow} alt="" width={66} height={22.09} />
      </motion.button>
    </main>
  )
}
