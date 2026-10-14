import { useState } from 'react'
import { motion } from 'framer-motion'

// Texto "digitado" caractere a caractere, com cursor "|" piscando ao final.
// Reforça a analogia de entrada de dados: cada letra é um registro que entra um a um.
// `showCursor` permite que a tela deixe só o texto mais recente com cursor.
export default function Typewriter({ text, delay = 0, speed = 0.04, showCursor = true }) {
  const [done, setDone] = useState(false)

  return (
    <motion.span
      aria-label={text}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { delayChildren: delay, staggerChildren: speed } } }}
      onAnimationComplete={() => setDone(true)}
    >
      {[...text].map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0 } } }}
        >
          {char}
        </motion.span>
      ))}
      {done && showCursor && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          |
        </motion.span>
      )}
    </motion.span>
  )
}
