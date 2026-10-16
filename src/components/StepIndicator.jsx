import { Fragment } from 'react'
import stepActive from '../assets/step-active.svg'
import stepIdle from '../assets/step-idle.svg'
import stepLine from '../assets/step-line.svg'

const STEPS = [1, 2, 3, 4]

// Trilha das 4 etapas do "Guided Tour". `current` é a etapa exibida (preenchida), `reached` é a
// mais avançada já concluída: dá para voltar a qualquer etapa até `reached`, nunca avançar além dela.
export default function StepIndicator({ current, reached, onSelect }) {
  return (
    <ol aria-label="Etapas da simulação" className="flex items-center">
      {STEPS.map((n, i) => {
        const locked = n > reached
        return (
          <Fragment key={n}>
            {i > 0 && (
              <li aria-hidden="true">
                <img src={stepLine} alt="" />
              </li>
            )}
            <li>
              <button
                type="button"
                disabled={locked}
                aria-current={n === current ? 'step' : undefined}
                aria-label={locked ? `Etapa ${n} (bloqueada)` : `Etapa ${n}`}
                onClick={() => onSelect(n)}
                // before: amplia a área de toque para 44px sem mudar o tamanho visual do círculo
                className={`relative grid size-8 place-items-center font-mono text-[15px] font-normal before:absolute before:-inset-1.5 ${
                  locked ? 'cursor-not-allowed' : n === current ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <img src={n === current ? stepActive : stepIdle} alt="" className="absolute inset-0" />
                <span className={`relative ${n === current ? 'text-black' : 'text-white'}`}>{n}</span>
              </button>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
