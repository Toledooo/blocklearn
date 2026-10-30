import { useEffect } from 'react'
import Typewriter from '../components/Typewriter'

// Imutabilidade (etapa 4 do fluxo). Por enquanto é só um esqueleto: reserva o lugar na trilha e dá destino ao "Próximo" da mineração.
export default function ImmutabilityView({ onSub }) {
  useEffect(() => {
    onSub({ count: 1, index: 0, max: 0 })
  }, [onSub])

  return (
    <main className="flex min-h-dvh flex-col gap-6 bg-black px-5 pt-[4.5rem] pb-8 sm:px-8 lg:px-12 lg:py-6">
      <h1 className="font-rowdies text-4xl leading-tight font-bold text-neon sm:text-6xl">
        <Typewriter text="Imutabilidade" speed={0.04} showCursor />
      </h1>
      <p className="font-mono text-base font-bold text-white">Esta etapa está em construção.</p>
    </main>
  )
}
