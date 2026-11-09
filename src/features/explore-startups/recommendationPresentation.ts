const needLabels: Record<string, string> = {
  parcerias_estrategicas: 'parcerias estratégicas',
  conexoes_mercado: 'conexões de mercado',
  contratacao_talentos: 'contratação de talentos',
  mentoria: 'mentoria',
  outro: 'outras necessidades',
};

export function recommendationNotices(notices: string[] = []) {
  const messages = notices.map((notice) => {
    if (/cobertura incompleta/i.test(notice))
      return 'A comparação está parcial e considera apenas as informações disponíveis nos perfis.';
    if (/^ajuda:|necessidades sem equivalência/i.test(notice)) {
      const unmapped = notice.match(
        /sem equivalência definida:\s*([^.;]+)/i,
      )?.[1];
      const labels = unmapped
        ?.split(',')
        .map(
          (key) => needLabels[key.trim()] ?? key.trim().replaceAll('_', ' '),
        );
      return labels?.length
        ? `Algumas necessidades de apoio ainda não entram nesta comparação: ${labels.join(', ')}.`
        : 'Faltam informações para comparar as necessidades de apoio com suas áreas de atuação.';
    }
    return notice;
  });
  return [...new Set(messages)];
}
