# Reuniões agendadas

As rotas `/startup/reunioes` e `/investidor/reunioes` reutilizam a navegação horizontal, o tema e o cabeçalho compartilhados. A agenda oferece lista agrupada por dia, calendário mensal/semanal, filtros e detalhes com histórico.

## Demonstração e integração

`src/features/meetings/repository.ts` centraliza os convites em um repositório demonstrativo persistido em `localStorage` (`juntai:meetings:v1`). Explorar, Matches e Mensagens utilizam esse mesmo repositório. Convites antigos da descoberta são importados uma única vez.

Os participantes demonstrativos são SolNexo Energia, AgroPonte Digital, Camila Torres e Bruno Almeida. A identificação combina o e-mail cadastrado e o tipo de perfil; cada conta visualiza apenas suas reuniões. Contas desconhecidas começam sem conexões autorizadas. Nenhuma senha é armazenada pela funcionalidade.

A interface `MeetingsRepository` permite substituir a implementação local por uma API. Na integração real, o servidor deve validar a sessão, a participação, as conexões permitidas, conflitos e transições de estado. O armazenamento local serve à demonstração, não substitui autorização no backend ou sincronização entre dispositivos.

## Regras

- Um convite novo fica pendente até a resposta do destinatário. Somente ele pode aceitar ou recusar.
- Reagendamento solicita uma nova confirmação e preserva o histórico. Cancelamento exige confirmação e permite informar um motivo.
- Reuniões concluídas ou canceladas ficam disponíveis para consulta, sem ações de edição.
- Datas e horários seguem o fuso de Fortaleza (UTC−3). São rejeitadas datas inválidas, horários passados e sobreposições com reuniões ativas dos participantes.
- Links são opcionais e precisam usar HTTP ou HTTPS. O acesso à reunião online aparece somente quando confirmada, a partir de 15 minutos antes do início até o fim previsto. Nenhuma URL de sala é inventada.
- Dados indisponíveis, como endereço ou link, recebem uma indicação discreta. Reuniões confirmadas encerradas passam a ser apresentadas como concluídas.

## Validação

Os testes unitários cobrem datas, conflitos, permissões, filtros, migração e disponibilidade do link. Os testes Playwright cobrem agenda, calendário, aceitação, reagendamento, cancelamento, persistência, isolamento dos participantes e adaptação ao celular.
