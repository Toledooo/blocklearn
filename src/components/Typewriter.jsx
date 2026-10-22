import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Texto "digitado" caractere a caractere, com cursor "|" piscando ao final.
// Reforça a analogia de entrada de dados: cada letra é um registro que entra um a um.
// `showCursor` permite que a tela deixe só o texto mais recente com cursor.
// `erase` apaga o texto de trás para frente (cursor acompanhando) e avisa por `onErased`.
export default function Typewriter({
  text,
  delay = 0,
  speed = 0.04,
  eraseSpeed = 0.005,
  showCursor = true,
  erase = false,
  onDone,
  onErased,
}) {
  const [done, setDone] = useState(false)
  const reduce = useReducedMotion() // quem prefere menos movimento vê o texto de uma vez

  const variants = {
    show: { transition: { delayChildren: reduce ? 0 : delay, staggerChildren: reduce ? 0 : speed } },
    gone: { transition: { staggerChildren: reduce ? 0 : eraseSpeed, staggerDirection: -1 } },
  }

  const handleComplete = () => {
    if (erase) return onErased?.()
    setDone(true)
    onDone?.()
  }

  return (
    <motion.span
      aria-label={text}
      initial="hidden"
      animate={erase ? 'gone' : 'show'}
      variants={variants}
      onAnimationComplete={handleComplete}
    >
      {[...text].map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { duration: 0 } },
            // display:none faz o cursor "recuar" junto com as letras apagadas
            gone: { opacity: 0, display: 'none', transition: { duration: 0 } },
          }}
        >
          {char}
        </motion.span>
      ))}
      {(done || erase) && showCursor && (
        <motion.span
          aria-hidden="true"
          animate={reduce ? { opacity: 1 } : { opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          |
        </motion.span>
      )}
    </motion.span>
  )
}
