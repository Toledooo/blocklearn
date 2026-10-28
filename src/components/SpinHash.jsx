import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import HashField from './HashField'

const HEX = '0123456789abcdef'
const LENGTH = 64
const randomHex = () => HEX[Math.floor(Math.random() * HEX.length)]
const randomDelay = () => 40 + Math.random() * 50 // cada posição troca no seu próprio ritmo
const LOCK_MS = 25 // tempo entre uma posição travar e a próxima

// Campo Hash da mineração, com efeito de "roleta": cada um dos 64 caracteres troca de valor sozinho,
// sem sincronia, como as casas de um painel girando. É só efeito visual (os caracteres sorteados não são
// hashes testados): o hash final vem de `mineBlock`. Fases:
//   idle/done: mostra `hash` parado; spinning: todas as posições giram;
//   locking: as posições travam no valor de `hash`, da esquerda para a direita, e `onLocked` avisa o fim.
// Um único laço de quadros atualiza as 64 posições (um componente por caractere travava a página).
export default function SpinHash({ hash, phase, zeros, onLocked }) {
  const reduce = useReducedMotion()
  const [view, setView] = useState({ text: hash, locked: 0 })
  const chars = useRef([])
  const callback = useRef(onLocked)

  useEffect(() => {
    callback.current = onLocked
  })

  useEffect(() => {
    if (phase !== 'spinning' && phase !== 'locking') return
    if (reduce) {
      if (phase === 'locking') callback.current?.()
      return
    }
    if (chars.current.length !== LENGTH) chars.current = Array.from({ length: LENGTH }, randomHex)
    const current = chars.current
    const target = [...hash]
    const start = performance.now()
    const next = current.map(() => start + randomDelay())
    let raf
    const frame = (now) => {
      const locked = phase === 'locking' ? Math.min(LENGTH, Math.floor((now - start) / LOCK_MS)) : 0
      for (let i = 0; i < LENGTH; i++) {
        if (i < locked) current[i] = target[i]
        else if (now >= next[i]) {
          current[i] = randomHex()
          next[i] = now + randomDelay()
        }
      }
      setView({ text: current.join(''), locked })
      if (locked >= LENGTH) return callback.current?.()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [phase, hash, reduce])

  const live = !reduce && (phase === 'spinning' || phase === 'locking')
  const text = live ? view.text : phase === 'spinning' ? 'Minerando…' : hash
  let highlight = 0
  if (phase === 'done') highlight = zeros
  else if (phase === 'locking') highlight = Math.min(zeros, live ? view.locked : LENGTH)

  return <HashField plain value={text} highlight={highlight} state={phase} locked={live ? view.locked : undefined} />
}
