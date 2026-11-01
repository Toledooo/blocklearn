import { useState } from 'react'
import arrow from '../assets/arrow1.svg'
import FadeIn from '../components/FadeIn'
import Typewriter from '../components/Typewriter'

const TITLE = 'Obrigado!'
const TEXT =
  'Você chegou ao fim da simulação! Viu como uma transação vira um bloco, como o hash sela os dados, como a mineração (Proof of Work) dá trabalho de propósito e como os blocos ficam ligados em uma corrente: por isso, alterar um dado do passado quebra tudo que veio depois.\n\nO BlockLearn é um trabalho de conclusão de curso (TCC), feito para ensinar Blockchain a iniciantes de forma visual e prática. É um projeto educacional e de código aberto: tudo o que você viu são simulações que rodam no seu navegador, nada é enviado a uma rede real e nenhum dado seu é guardado.\n\nEsperamos que agora a ideia por trás da tecnologia esteja mais clara. Obrigado por participar!'

// Tela final do tour (depois da etapa 4): agradece, explica o que é o sistema e deixa recomeçar.
// Fica fora da trilha de etapas, pois não é uma etapa da simulação.
export default function ClosingView({ onRestart }) {
  const [stage, setStage] = useState(0) // 0 título, 1 texto, 2 tudo digitado

  return (
    <main className="flex min-h-dvh flex-col overflow-x-clip bg-black px-6 py-10 sm:px-12 lg:px-24">
      <div className="flex flex-1 flex-col justify-center gap-4">
        <h1 className="font-rowdies text-[clamp(2.75rem,min(10vw,16vh),128px)] leading-normal font-bold text-neon">
          <Typewriter text={TITLE} speed={0.04} showCursor={stage === 1} onDone={() => setStage((s) => Math.max(s, 1))} />
        </h1>
        {stage >= 1 && (
          <p className="max-w-[60rem] font-mono text-base leading-normal font-bold whitespace-pre-line text-white lg:text-[clamp(0.9rem,min(1.5vw,2.2vh),1.5rem)]">
            <Typewriter text={TEXT} speed={0.012} onDone={() => setStage((s) => Math.max(s, 2))} />
          </p>
        )}
      </div>
      <FadeIn show={stage >= 2} className="mt-10 sm:self-end lg:mb-[4vh]">
        <button
          type="button"
          onClick={onRestart}
          className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-4 rounded-[10px] border-3 border-neon bg-neon px-6 py-2 font-mono text-[clamp(1rem,2.6vh,1.5rem)] font-bold text-black sm:w-auto"
        >
          Voltar ao início
          <img src={arrow} alt="" className="w-8 sm:w-10" />
        </button>
      </FadeIn>
    </main>
  )
}
