import StepIndicator from '../components/StepIndicator'
import Typewriter from '../components/Typewriter'

// Etapa 3 do tour (Hashing). Por enquanto é só um esqueleto: existe para a trilha poder voltar às etapas anteriores.
export default function HashView({ step, reached, onSelect }) {
  return (
    <main className="flex min-h-dvh flex-col gap-6 bg-black px-5 py-8 sm:px-8 lg:px-12 lg:py-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="font-rowdies text-4xl leading-tight font-bold text-neon sm:text-6xl">
          <Typewriter text="Hashing" speed={0.04} showCursor />
        </h1>
        <StepIndicator current={step} reached={reached} onSelect={onSelect} />
      </div>
      <p className="font-mono text-base font-bold text-white">Esta etapa está em construção.</p>
    </main>
  )
}
