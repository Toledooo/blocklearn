import { motion, useReducedMotion } from 'framer-motion'
import { formatTimestamp } from '../utils/formatTimestamp'

const FIELDS = [
  ['from', 'De', 'text'],
  ['to', 'Para', 'text'],
  ['amount', 'Valor', 'number'],
]
const BADGE = { altered: 'Alterado', broken: 'Corrente quebrada' }
const short = (hash) => `${hash.slice(0, 10)}…`

// Um bloco da corrente. Os dados da transação são campos editáveis (é a "tentativa de fraude"); o resto são os
// dados do bloco, separados deles. `status` vem de validateChain: ok (verde), altered (dados mudaram) ou broken
// (não está mais ligado a uma corrente válida), e nunca depende só da cor: há um selo com texto.
// `currentHash` é o hash refeito com os dados de agora; `previousStale` marca o "Hash anterior" que ficou para trás.
export default function ChainBlock({ block, status, currentHash, previousStale, delay = 0, onEdit, genesis = false }) {
  const reduce = useReducedMotion()
  const bad = status !== 'ok'
  const wait = reduce ? 0 : delay
  return (
    <motion.article
      data-testid="chain-block"
      data-status={status}
      aria-label={genesis ? 'Bloco anterior' : `Bloco ${block.index}`}
      initial={false}
      animate={{ boxShadow: bad ? '0 0 22px rgba(255,59,59,0.7)' : '0 0 0px rgba(255,59,59,0)' }}
      transition={{ duration: reduce ? 0 : 0.5, delay: wait }}
      style={{ transitionDelay: reduce ? undefined : `${delay}s` }}
      className={`flex w-full max-w-[22rem] flex-col gap-[clamp(0.35rem,1.2vh,0.75rem)] rounded-[30px] border-3 p-4 font-mono text-xs transition-colors duration-500 sm:text-sm lg:aspect-[380/340] lg:w-(--w) lg:max-w-none lg:shrink-0 lg:justify-center lg:text-[clamp(0.6rem,1.5vh,1rem)] ${
        bad ? 'border-danger text-danger' : 'border-neon text-neon'
      }`}
    >
        {genesis ? (
        <p className="m-auto break-all text-center" title={block.hash}><span className="font-bold">Hash</span> <span className="text-white">{short(block.hash)}</span></p>
      ) : (
        <>
        <header className="flex flex-wrap items-center justify-between gap-1">
            <h3 className="font-bold">Bloco {block.index}</h3>
            {bad && <span className="rounded border border-danger px-1.5 text-[0.85em] font-bold">{BADGE[status]}</span>}
          </header>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-[clamp(0.15rem,0.6vh,0.35rem)]">
            {FIELDS.map(([key, label, type]) => (
              <label key={key} className="contents">
                <span className="font-bold">{label}</span>
                <input
                  type={type}
                  name={`${key}-${block.index}`}
                  aria-label={`${label} do Bloco ${block.index}`}
                  aria-invalid={status === 'altered'}
                  autoComplete="off"
                  maxLength={type === 'text' ? 30 : undefined}
                  min={type === 'number' ? '0' : undefined}
                  step={type === 'number' ? 'any' : undefined}
                  inputMode={type === 'number' ? 'decimal' : undefined}
                  value={block[key]}
                  readOnly={genesis}
                  tabIndex={genesis ? -1 : undefined}
                  onChange={(e) => onEdit?.({ [key]: e.target.value })}
                  className="min-h-11 w-full min-w-0 rounded-md border border-[#888] bg-transparent px-2 font-mono text-white focus:border-neon focus:outline-none aria-invalid:border-danger lg:min-h-[clamp(1.4rem,3.6vh,2.4rem)]"
                />
              </label>
            ))}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 border-t border-white/25 pt-[clamp(0.25rem,1vh,0.5rem)] leading-snug">
            <dt className="font-bold">Data</dt>
            <dd className="text-white">{formatTimestamp(block.timestamp)}</dd>
            <dt className="font-bold">Hash anterior</dt>
            <dd title={block.previousHash} className={previousStale ? 'text-danger line-through' : 'text-white'}>
              {short(block.previousHash)}
            </dd>
            <dt className="font-bold">Nonce</dt>
            <dd className="text-white">{block.nonce}</dd>
            <dt className="font-bold">Hash</dt>
            <dd title={status === 'altered' ? currentHash : block.hash} className="text-white">
              {status === 'altered' ? (
                <>
                  <s className="text-white/50">{short(block.hash)}</s> <span className="text-danger">{short(currentHash)}</span>
                </>
              ) : (
                short(block.hash)
              )}
            </dd>
          </dl>
        </>
      )}
    </motion.article>
  )
}
