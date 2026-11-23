export const passwordRequirements =
  'Use pelo menos 8 caracteres, com letras maiúsculas e minúsculas, um número e um caractere especial.';

export function passwordChecks(value: string) {
  return [
    { label: 'Pelo menos 8 caracteres', valid: Array.from(value).length >= 8 },
    { label: 'Uma letra maiúscula', valid: /\p{Lu}/u.test(value) },
    { label: 'Uma letra minúscula', valid: /\p{Ll}/u.test(value) },
    { label: 'Um número', valid: /[0-9]/.test(value) },
    { label: 'Um caractere especial', valid: /[^\p{L}\p{N}\s]/u.test(value) },
    {
      label: 'No máximo 72 bytes',
      valid: new TextEncoder().encode(value).length <= 72,
    },
  ];
}

export function passwordError(value: string): string | undefined {
  if (new TextEncoder().encode(value).length > 72)
    return 'A senha deve ter no máximo 72 bytes.';
  if (passwordChecks(value).some((check) => !check.valid))
    return passwordRequirements;
}
