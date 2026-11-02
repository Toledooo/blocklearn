import { motion, useReducedMotion } from 'framer-motion'
import lineDashed from '../assets/line-dashed.svg'
import { formatTimestamp } from '../utils/formatTimestamp'

const DATA = [
  ['Data', (t) => formatTimestamp(t.timestamp), true], // 3º item: ocupa a linha de cima, é longo demais para dividir a linha com os outros
  ['De', (t) => t.from],
  ['Para', (t) => t.to],
  ['Valor', (t) => `${t.amount} moedas`],
]

// Bloco anterior (cortado na borda da tela) ligado ao bloco candidato, que começa vazio.
// Quando há uma transação, ela "voa" até o bloco candidato: é o agrupamento dos dados em um bloco.
// Na mineração, `previous` e `children` preenchem os dois blocos e `solved` destaca o bloco resolvido.
// --w2 (largura do bloco candidato, `size`) é limitada também pela altura da janela (vh): blocos grandes sem rolagem
export default function BlockRow({ transaction, previous, children, solved = false, size = 'clamp(10rem,min(36vw,46vh),560px)' }) {
  const reduce = useReducedMotion()
  return (
    <div className="-ml-[calc(var(--w2)*0.4)] flex items-center" style={{ '--w2': size }}>
      <div className="flex aspect-[380/340] w-[calc(var(--w2)*0.795)] shrink-0 items-center justify-end rounded-[30px] border-3 border-neon bg-black py-4 pr-[clamp(1.25rem,3vw,2.5rem)] pl-4">
        {previous}
      </div>
      <img src={lineDashed} alt="" className="shrink-0" />
      <motion.div
        data-testid="candidate-block"
        data-solved={solved}
        animate={solved && !reduce ? { scale: [1, 1.06, 1] } : undefined}
        transition={{ duration: 0.6 }}
        className={`flex aspect-[365/340] w-(--w2) shrink-0 items-center justify-center rounded-[30px] border-3 border-neon p-3 transition-shadow duration-700 ${
          solved ? 'shadow-[0_0_28px_var(--color-neon)]' : ''
        }`}
      >
        {children}
        {!children && transaction && (
          <motion.div
            initial={{ x: '60vw', opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.5 }}
            className="relative min-w-0 px-5 py-4"
          >
            {/* Contorno pontilhado "andando": sugere um registro ainda provisório, em formação */}
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible">
              <motion.rect
                width="100%"
                height="100%"
                rx="10"
                fill="none"
                className="stroke-neon"
                strokeWidth="2"
                strokeDasharray="8 8"
                animate={reduce ? undefined : { strokeDashoffset: [0, -16] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
            <dl aria-label="Transação no bloco candidato" className="relative flex flex-wrap justify-center gap-x-6 gap-y-3 font-mono text-sm text-white sm:text-base">
              {DATA.map(([label, get, wide]) => (
                <div key={label} className={`min-w-0 text-center ${wide ? 'basis-full' : ''}`}>
                  <dt className="font-bold text-neon">{label}</dt>
                  <dd className="break-words">{get(transaction)}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
