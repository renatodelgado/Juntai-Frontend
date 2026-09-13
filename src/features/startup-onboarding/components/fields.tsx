import type { ComponentProps } from 'react';
import {
  Input,
  Textarea,
  Select,
  MultiSelect,
  RadioGroup,
} from '@/shared/components/forms/Fields';
import type { StartupDraft } from '../model/types';
import type { OnboardingController } from '../hooks/useOnboarding';
import type { Option } from '../data/catalogs';

type KeysOfType<T> = {
  [K in keyof StartupDraft]: StartupDraft[K] extends T ? K : never;
}[keyof StartupDraft];
type TextKey = KeysOfType<string>;
type ListKey = KeysOfType<string[]>;
type InputOptions = Omit<
  ComponentProps<typeof Input>,
  'id' | 'label' | 'value' | 'onChange' | 'error'
>;
type TextOptions = Omit<
  ComponentProps<typeof Textarea>,
  'id' | 'label' | 'value' | 'onChange' | 'error'
>;

export function bindFields({ data, errors, update }: OnboardingController) {
  return {
    input: (key: TextKey, label: string, props?: InputOptions) => (
      <Input
        {...props}
        id={key}
        label={label}
        value={data[key]}
        error={errors[key]}
        onChange={(event) => update(key, event.target.value)}
      />
    ),
    textarea: (key: TextKey, label: string, props?: TextOptions) => (
      <Textarea
        {...props}
        id={key}
        label={label}
        value={data[key]}
        error={errors[key]}
        onChange={(event) => update(key, event.target.value)}
      />
    ),
    select: (
      key: TextKey,
      label: string,
      options: readonly Option[],
      required = true,
    ) => (
      <Select
        id={key}
        label={label}
        options={options}
        required={required}
        value={data[key]}
        error={errors[key]}
        onChange={(event) => update(key, event.target.value)}
      />
    ),
    multi: (
      key: ListKey,
      label: string,
      options: readonly Option[],
      required = true,
      hint?: string,
    ) => (
      <MultiSelect
        id={key}
        label={label}
        options={options}
        required={required}
        hint={hint}
        value={data[key]}
        error={errors[key]}
        onChange={(value) => update(key, value)}
      />
    ),
    radio: (
      key: TextKey,
      label: string,
      options: readonly Option[],
      required = true,
    ) => (
      <RadioGroup
        id={key}
        label={label}
        options={options}
        required={required}
        value={data[key]}
        error={errors[key]}
        onChange={(value) => update(key, value)}
      />
    ),
  };
}
