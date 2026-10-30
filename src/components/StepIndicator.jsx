import { Fragment } from 'react'
import stepActive from '../assets/step-active.svg'
import stepIdle from '../assets/step-idle.svg'
import stepLine from '../assets/step-line.svg'

const STEPS = [1, 2, 3, 4]

// Trilha das 4 etapas do "Guided Tour". `current` é a etapa exibida (preenchida), `reached` é a
// mais avançada já concluída: dá para voltar a qualquer etapa até `reached`, nunca avançar além dela.
// `sub` ({ count, index, max }) marca as subtelas da etapa exibida: uma bolinha embaixo do círculo, a atual preenchida.
// Dá para clicar nas bolinhas até `max` (a subtela mais avançada já alcançada), como nas etapas.
export default function StepIndicator({ current, reached, onSelect, sub = { count: 1, index: 0, max: 0 }, onSubSelect }) {
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
            <li className="relative">
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
              {n === current && sub.count > 1 && (
                <ol aria-label="Partes da etapa" className="absolute top-full left-1/2 mt-1.5 flex -translate-x-1/2 gap-2">
                  {Array.from({ length: sub.count }, (_, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        disabled={i > sub.max}
                        aria-current={i === sub.index ? 'step' : undefined}
                        aria-label={`Parte ${i + 1} de ${sub.count}`}
                        onClick={() => onSubSelect(i)}
                        // before: aumenta a área de toque sem mudar o tamanho da bolinha
                        className={`relative block size-2 rounded-full border border-neon before:absolute before:-inset-2 ${
                          i === sub.index ? 'cursor-default bg-neon' : i > sub.max ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                        }`}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
