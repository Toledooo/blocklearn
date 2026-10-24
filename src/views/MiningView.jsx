import Typewriter from '../components/Typewriter'

// Etapa 4 do tour (Mineração). Por enquanto é só um esqueleto: existe para a trilha ter um destino.
export default function MiningView() {
  return (
    <main className="flex min-h-dvh flex-col gap-6 bg-black px-5 pt-[4.5rem] pb-8 sm:px-8 lg:px-12 lg:py-6">
      <h1 className="font-rowdies text-4xl leading-tight font-bold text-neon sm:text-6xl">
        <Typewriter text="Mineração" speed={0.04} showCursor />
      </h1>
      <p className="font-mono text-base font-bold text-white">Esta etapa está em construção.</p>
    </main>
  )
}
