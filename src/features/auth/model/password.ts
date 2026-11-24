export const passwordRequirements =
  'Use pelo menos 8 caracteres, com letras maiúsculas e minúsculas, um número e um caractere especial.';

export function passwordChecks(value: string) {
  return [
    { label: 'Pelo menos 8 caracteres', valid: Array.from(value).length >= 8 },
    { label: 'Uma letra maiúscula', valid: /\p{Lu}/u.test(value) },
    { label: 'Uma letra minúscula', valid: /\p{Ll}/u.test(value) },
    { label: 'Um número', valid: /[0-9]/.test(value) },
    { label: 'Um caractere especial', valid: /[^\p{L}\p{N}\s]/u.test(value) },
  ];
}

export function passwordError(value: string): string | undefined {
  if (new TextEncoder().encode(value).length > 72) {
    let prefix = '';
    for (const character of value) {
      if (new TextEncoder().encode(prefix + character).length > 72) break;
      prefix += character;
    }
    const limit = Array.from(prefix).length;
    return `Senha muito longa. Reduza para até ${limit} caracteres; alguns caracteres ocupam mais espaço.`;
  }
  if (passwordChecks(value).some((check) => !check.valid))
    return passwordRequirements;
}
