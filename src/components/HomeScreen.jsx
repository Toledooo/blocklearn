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
export default function HomeScreen() {
  // Só o texto digitado mais recente mantém o cursor: o do título some quando o subtítulo começa.
  const [subtitleStarted, setSubtitleStarted] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setSubtitleStarted(true), SUBTITLE_DELAY * 1000)
    return () => clearTimeout(id)
  }, [])

  return (
    <main className="bg-black relative h-screen min-h-[1080px] min-w-[1280px] overflow-hidden">
      <h1 className="absolute left-[96px] top-[243px] font-rowdies font-bold text-[128px] leading-normal text-neon whitespace-nowrap">
        <Typewriter text={TITLE} speed={SPEED} showCursor={!subtitleStarted} />
      </h1>

      <p className="absolute left-[96px] top-[420px] w-[609px] font-mono font-bold text-[24px] leading-normal text-white">
        <Typewriter text={SUBTITLE} delay={SUBTITLE_DELAY} speed={SPEED} />
      </p>

      {/* Âncora por enquanto: no futuro aponta para o primeiro passo da simulação */}
      <motion.a
        href="#comecar"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18, delay: BUTTON_DELAY }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="absolute right-[161px] top-[701px] w-[348px] h-[114px] flex items-center gap-[15px] pl-[46px] box-border bg-neon border-3 border-neon rounded-[10px] cursor-pointer font-mono font-bold text-[32px] text-black"
      >
        Começar
        <img src={arrow} alt="" width={66} height={22.09} />
      </motion.a>
    </main>
  )
}
