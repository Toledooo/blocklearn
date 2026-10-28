import { useEffect, useRef, useState } from 'react'
import { animate, motion, useReducedMotion } from 'framer-motion'

// Texto "digitado" caractere a caractere, com cursor "|" piscando ao final.
// Reforça a analogia de entrada de dados: cada letra é um registro que entra um a um.
// `showCursor` permite que a tela deixe só o texto mais recente com cursor.
// `erase` apaga o texto de trás para frente (cursor acompanhando) e avisa por `onErased`.
// Em vez de um componente por letra (textos longos travavam a página ao montar), o Framer Motion
// anima um único contador de caracteres e o React só recorta o texto até esse número.
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
  const reduce = useReducedMotion() // quem prefere menos movimento vê o texto de uma vez
  const chars = [...text]
  const [shown, setShown] = useState(0)
  const [done, setDone] = useState(false)
  const count = useRef(0)
  const callbacks = useRef({})

  useEffect(() => {
    callbacks.current = { onDone, onErased }
  })

  useEffect(() => {
    const target = erase ? 0 : [...text].length
    const controls = animate(count.current, target, {
      delay: erase || reduce ? 0 : delay,
      duration: reduce ? 0 : Math.abs(target - count.current) * (erase ? eraseSpeed : speed),
      ease: 'linear',
      onUpdate: (v) => {
        count.current = v
        setShown(Math.floor(v))
      },
      onComplete: () => {
        count.current = target
        setShown(target)
        if (erase) return callbacks.current.onErased?.()
        setDone(true)
        callbacks.current.onDone?.()
      },
    })
    return () => controls.stop()
  }, [text, erase, delay, speed, eraseSpeed, reduce])

  return (
    <span aria-label={text}>
      <span aria-hidden="true">{chars.slice(0, shown).join('')}</span>
      {(done || erase) && showCursor ? (
        <motion.span
          aria-hidden="true"
          animate={reduce ? { opacity: 1 } : { opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          |
        </motion.span>
      ) : (
        // o resto, invisível, reserva o espaço para o texto não "pular" de linha enquanto é digitado
        !erase && <span aria-hidden="true" className="invisible">{chars.slice(shown).join('')}</span>
      )}
    </span>
  )
}
