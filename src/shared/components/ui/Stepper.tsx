import { useId, useState } from 'react';
import { CheckIcon, ListBulletsIcon, XIcon } from '@phosphor-icons/react';
import styled from 'styled-components';
import { Button } from './Button';

const Navigation = styled.nav<{ $expanded: boolean }>`
  padding: 1.25rem 0;
  border-block: 1px solid ${({ theme }) => theme.colors.accentBorder};
  ol {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0.25rem;
    gap: 0.25rem;
  }
  li {
    flex: 1;
    min-width: 0;
  }
  progress {
    width: 100%;
    height: 0.3rem;
    display: block;
    margin-top: 1rem;
    border: 0;
    border-radius: 1rem;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.accentBorder};
    accent-color: ${({ theme }) => theme.colors.accent};
  }
  progress::-webkit-progress-bar {
    background: ${({ theme }) => theme.colors.accentBorder};
  }
  progress::-webkit-progress-value {
    background: ${({ theme }) => theme.colors.accent};
  }
  progress::-moz-progress-bar {
    background: ${({ theme }) => theme.colors.accent};
  }
  > div {
    display: none;
  }
  @media (max-width: 68rem) {
    position: sticky;
    top: 0;
    z-index: 5;
    background: ${({ theme }) => theme.colors.white};
    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    > div span {
      display: block;
      color: ${({ theme }) => theme.colors.muted};
      font-size: 0.75rem;
    }
    > div strong {
      color: ${({ theme }) => theme.colors.accentStrong};
      font-size: 0.95rem;
    }
    ol {
      display: ${({ $expanded }) => ($expanded ? 'grid' : 'none')};
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
      margin-top: 1rem;
    }
  }
`;
const StepButton = styled.button<{ $active: boolean; $complete: boolean }>`
  width: 100%;
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.2rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.input};
  background: ${({ $active, theme }) => ($active ? theme.colors.accentSoft : 'transparent')};
  color: ${({ $active, $complete, theme }) => ($active || $complete ? theme.colors.accentStrong : theme.colors.muted)};
  font-size: 0.72rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  &:disabled {
    cursor: default;
  }
  > span:first-child {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 1px solid currentColor;
    background: ${({ $active, theme }) => ($active ? theme.colors.accentStrong : theme.colors.white)};
    color: ${({ $active, theme }) => ($active ? theme.colors.white : 'inherit')};
  }
  @media (max-width: 68rem) {
    display: flex;
    text-align: left;
    padding: 0.6rem;
    font-size: 0.8rem;
  }
`;

export function Stepper({
  steps,
  current,
  completed,
  onSelect,
}: {
  steps: readonly { id: string; label: string }[];
  current: string;
  completed: readonly string[];
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const index = steps.findIndex((step) => step.id === current);
  return (
    <Navigation aria-label="Etapas do cadastro" $expanded={expanded}>
      <div>
        <section>
          <span>
            Etapa {index + 1} de {steps.length}
          </span>
          <strong>{steps[index]?.label}</strong>
        </section>
        <Button
          type="button"
          $variant="quiet"
          aria-controls={id}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <XIcon size={20} aria-hidden="true" />
          ) : (
            <ListBulletsIcon size={20} aria-hidden="true" />
          )}
          {expanded ? 'Ocultar etapas' : 'Mostrar etapas'}
        </Button>
      </div>
      <ol id={id}>
        {steps.map((step, stepIndex) => (
          <li key={step.id}>
            <StepButton
              type="button"
              $active={step.id === current}
              $complete={completed.includes(step.id)}
              aria-current={step.id === current ? 'step' : undefined}
              aria-label={`${stepIndex + 1}. ${step.label}${completed.includes(step.id) ? ', concluída' : ''}`}
              disabled={stepIndex > index && !completed.includes(step.id)}
              onClick={() => {
                onSelect(step.id);
                setExpanded(false);
              }}
            >
              <span>
                {completed.includes(step.id) && step.id !== current ? (
                  <CheckIcon size={18} weight="bold" aria-hidden="true" />
                ) : (
                  stepIndex + 1
                )}
              </span>
              <span>{step.label}</span>
            </StepButton>
          </li>
        ))}
      </ol>
      <progress
        aria-label="Progresso do cadastro"
        value={completed.length}
        max={steps.length}
      />
    </Navigation>
  );
}
