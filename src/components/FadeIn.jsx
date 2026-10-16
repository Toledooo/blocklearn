import { motion, useReducedMotion } from 'framer-motion'

// Surge de forma suave (invisível e desfocado -> nítido). Enquanto escondido fica `inert`,
// ou seja, não recebe foco nem cliques, mas continua ocupando espaço para o layout não pular.
export default function FadeIn({ show, className, children }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      inert={!show}
      className={className}
      initial={false}
      animate={{ opacity: show ? 1 : 0, filter: show || reduce ? 'blur(0px)' : 'blur(8px)' }}
      transition={{ duration: reduce ? 0 : 0.8 }}
    >
      {children}
    </motion.div>
  )
}
