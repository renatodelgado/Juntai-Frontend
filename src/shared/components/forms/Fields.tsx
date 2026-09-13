import { FieldSync } from './RegistrationSync';
import { useId, type ComponentProps, type ReactNode } from 'react';
import {
  FieldRoot,
  Label,
  Hint,
  ErrorBalloon,
  InputControl,
  TextareaControl,
  SelectControl,
  Fieldset,
  ChoiceGrid,
  ChoiceLabel,
  RangeControl,
} from './styles';

type Option = { value: string; label: string; description?: string };
type Common = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  icon?: ReactNode;
};

function FieldDescription({
  id,
  hint,
  error,
}: Pick<Common, 'id' | 'hint' | 'error'>) {
  return (
    <>
      {hint && <Hint id={`${id}-hint`}>{hint}</Hint>}
      {error && <ErrorBalloon id={`${id}-error`}>{error}</ErrorBalloon>}
    </>
  );
}
function describedBy(id: string, hint?: string, error?: string) {
  return (
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') ||
    undefined
  );
}

export function Input({
  label,
  hint,
  error,
  icon,
  required,
  id,
  ...props
}: Common & Omit<ComponentProps<'input'>, 'id'>) {
  return (
    <FieldSync field={id}>
      <FieldRoot>
        <Label htmlFor={id}>
          {icon}
          {label}
          {!required && <span>Opcional</span>}
        </Label>
        <InputControl
          {...props}
          maxLength={props.maxLength ?? 2048}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, hint, error)}
        />
        <FieldDescription id={id} hint={hint} error={error} />
      </FieldRoot>
    </FieldSync>
  );
}
export function Textarea({
  label,
  hint,
  error,
  required,
  id,
  ...props
}: Common & Omit<ComponentProps<'textarea'>, 'id'>) {
  const count = typeof props.value === 'string' ? props.value.length : 0;
  return (
    <FieldSync field={id}>
      <FieldRoot>
        <Label htmlFor={id}>
          {label}
          {!required && <span>Opcional</span>}
        </Label>
        <TextareaControl
          {...props}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, hint, error)}
        />
        <FieldDescription id={id} hint={hint} error={error} />
        {props.maxLength && (
          <Hint>
            {count}/{props.maxLength} caracteres
          </Hint>
        )}
      </FieldRoot>
    </FieldSync>
  );
}
export function Select({
  label,
  hint,
  error,
  required,
  id,
  options,
  placeholder = 'Selecione uma opção',
  ...props
}: Common & { options: readonly Option[]; placeholder?: string } & Omit<
    ComponentProps<'select'>,
    'id'
  >) {
  return (
    <FieldSync field={id}>
      <FieldRoot>
        <Label htmlFor={id}>
          {label}
          {!required && <span>Opcional</span>}
        </Label>
        <SelectControl
          {...props}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, hint, error)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectControl>
        <FieldDescription id={id} hint={hint} error={error} />
      </FieldRoot>
    </FieldSync>
  );
}
export function MultiSelect({
  id,
  label,
  hint,
  error,
  options,
  value,
  onChange,
  required,
}: Common & {
  options: readonly Option[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <FieldSync field={id}>
      <Fieldset id={id} aria-describedby={describedBy(id, hint, error)}>
        <legend>
          {label}
          {!required && ' (opcional)'}
        </legend>
        <ChoiceGrid>
          {options.map((option) => (
            <ChoiceLabel
              key={option.value}
              $checked={value.includes(option.value)}
            >
              <input
                type="checkbox"
                name={id}
                value={option.value}
                checked={value.includes(option.value)}
                aria-invalid={!!error}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...value, option.value]
                      : value.filter((item) => item !== option.value),
                  )
                }
              />
              <span>{option.label}</span>
            </ChoiceLabel>
          ))}
        </ChoiceGrid>
        <FieldDescription id={id} hint={hint} error={error} />
      </Fieldset>
    </FieldSync>
  );
}
export function RadioGroup({
  id,
  label,
  hint,
  error,
  options,
  value,
  onChange,
  required,
}: Common & {
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FieldSync field={id}>
      <Fieldset id={id} aria-describedby={describedBy(id, hint, error)}>
        <legend>
          {label}
          {!required && ' (opcional)'}
        </legend>
        <ChoiceGrid $cards>
          {options.map((option) => (
            <ChoiceLabel key={option.value} $checked={value === option.value}>
              <input
                type="radio"
                name={id}
                value={option.value}
                checked={value === option.value}
                required={required}
                aria-invalid={!!error}
                onChange={() => onChange(option.value)}
              />
              <span>
                {option.label}
                {option.description && <small>{option.description}</small>}
              </span>
            </ChoiceLabel>
          ))}
        </ChoiceGrid>
        <FieldDescription id={id} hint={hint} error={error} />
      </Fieldset>
    </FieldSync>
  );
}
export function Checkbox({
  label,
  checked,
  onChange,
  error,
  id,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldSync field={inputId}>
      <FieldRoot>
        <ChoiceLabel $checked={checked}>
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          <span>{label}</span>
        </ChoiceLabel>
        {error && <ErrorBalloon id={`${inputId}-error`}>{error}</ErrorBalloon>}
      </FieldRoot>
    </FieldSync>
  );
}
export function NumberInput({
  value,
  onValueChange,
  ...props
}: Common &
  Omit<ComponentProps<'input'>, 'value' | 'onChange'> & {
    value: number | null;
    onValueChange: (value: number | null) => void;
  }) {
  return (
    <Input
      {...props}
      type="number"
      value={value ?? ''}
      onChange={(event) =>
        onValueChange(
          Number.isFinite(event.target.valueAsNumber)
            ? event.target.valueAsNumber
            : null,
        )
      }
    />
  );
}
export function MoneyInput(
  props: Common & {
    value: number | null;
    onValueChange: (value: number | null) => void;
  },
) {
  return (
    <NumberInput
      {...props}
      inputMode="decimal"
      min={0}
      max={1e12}
      step="0.01"
      placeholder="500000"
      hint={
        props.value === null
          ? 'Valor em reais. Exemplo: 500000 para R$ 500.000.'
          : new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(props.value)
      }
    />
  );
}
export function Slider({
  id,
  label,
  options,
  value,
  onChange,
  error,
}: Common & {
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  return (
    <FieldSync field={id}>
      <FieldRoot>
        <Label htmlFor={`${id}-select`}>{label}</Label>
        <SelectControl
          id={`${id}-select`}
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Escolha uma faixa mensal</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectControl>
        <RangeControl
          id={id}
          type="range"
          aria-label="Ajustar faixa de faturamento"
          min={0}
          max={options.length - 1}
          step={1}
          value={index}
          aria-valuetext={options[index]?.label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            const option = options[Number(event.target.value)];
            if (option) onChange(option.value);
          }}
        />
        <Hint>Valores mensais. Você também pode ajustar pelo controle.</Hint>
        {error && <ErrorBalloon id={`${id}-error`}>{error}</ErrorBalloon>}
      </FieldRoot>
    </FieldSync>
  );
}
