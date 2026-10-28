import { motion, useReducedMotion } from 'framer-motion'

// Caixa somente leitura com o hash. Quando o valor muda, os caracteres reaparecem um a um,
// para o aluno perceber que o selo foi refeito.
export default function HashField({ value }) {
  const reduce = useReducedMotion()
  return (
    <div className="relative">
      <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-black px-1 font-mono text-lg font-bold text-neon">Hash</span>
      <p
        data-testid="hash"
        data-hash={value}
        className="flex min-h-14 items-center justify-center rounded-[10px] border-2 border-[#888] px-3 py-2 text-center font-mono text-[clamp(0.8rem,min(2.2vw,3vh),1.5rem)] break-all text-white"
      >
        <span className="sr-only">{value}</span>
        <motion.span key={value} aria-hidden="true">
          {[...value].map((char, i) => (
            <motion.span
              key={i}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0, delay: i * 0.012 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </p>
    </div>
  )
}
