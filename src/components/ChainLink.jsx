import { motion, useReducedMotion } from 'framer-motion'

const SPARKS = [
  { x: -14, y: -16 },
  { x: 12, y: -20 },
  { x: -8, y: 18 },
  { x: 16, y: 14 },
  { x: 2, y: -24 },
]
const dashes = 'bg-[repeating-linear-gradient(180deg,currentColor_0_6px,transparent_6px_12px)] lg:bg-[repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_12px)]'

// Ligação entre dois blocos da corrente (linha tracejada). Íntegra, é a linha neon de sempre; quebrada, fica vermelha,
// vibra, parte-se ao meio (as metades se afastam) e solta faíscas. `delay` escalona a quebra ao longo da corrente.
// No celular a corrente é uma coluna e a linha é vertical; no desktop, horizontal.
export default function ChainLink({ broken, delay = 0 }) {
  const reduce = useReducedMotion()
  const timing = { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : delay }
  return (
    <motion.div
      data-testid="chain-link"
      data-broken={broken}
      aria-hidden="true"
      animate={broken && !reduce ? { x: [0, -3, 3, -2, 0] } : { x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`relative flex h-12 w-[3px] shrink-0 flex-col transition-colors duration-500 lg:h-[3px] lg:w-[calc(var(--w)*0.216)] lg:flex-row ${
        broken ? 'text-danger' : 'text-neon'
      }`}
      style={{ transitionDelay: reduce ? undefined : `${delay}s` }}
    >
      <div className={`flex-1 ${dashes}`} />
      {/* o vão: abre quando a ligação quebra e fecha quando ela é refeita */}
      <motion.div className="shrink-0" initial={false} animate={{ flexBasis: broken ? '40%' : '0%' }} transition={timing} />
      <div className={`flex-1 ${dashes}`} />
      {broken &&
        !reduce &&
        SPARKS.map((s, i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 size-1.5 bg-danger"
            initial={{ opacity: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, x: s.x, y: s.y }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
          />
        ))}
    </motion.div>
  )
}
