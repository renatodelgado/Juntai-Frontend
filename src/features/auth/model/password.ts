export const passwordRequirements =
  'Use pelo menos 8 caracteres, com letras maiúsculas e minúsculas, um número e um caractere especial.';

export function passwordError(value: string): string | undefined {
  if (new TextEncoder().encode(value).length > 72)
    return 'A senha deve ter no máximo 72 bytes.';
  if (
    Array.from(value).length < 8 ||
    !/\p{Lu}/u.test(value) ||
    !/\p{Ll}/u.test(value) ||
    !/[0-9]/.test(value) ||
    !/[^\p{L}\p{N}\s]/u.test(value)
  )
    return passwordRequirements;
}
