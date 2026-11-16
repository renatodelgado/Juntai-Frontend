/**
 * Utilitários de segurança para o frontend do Juntaí.
 */

/**
 * Valida e sanitiza URLs externas para links <a> ou botões de redirecionamento.
 * Previne ataques de XSS baseados em links (ex: javascript:..., data:..., vbscript:...).
 * Retorna a URL segura ou null caso seja inválida ou use protocolo inseguro.
 */
export function safeExternalUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(
      trimmed.includes(':') ? trimmed : `https://${trimmed}`,
    );
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    return null;
  }

  return null;
}
