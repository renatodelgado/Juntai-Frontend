# Reunioes agendadas

A agenda utiliza a API autenticada do backend: GET /reunioes, POST /reunioes e PATCH /reunioes/:id/status.

Somente investidores iniciam agendamentos, pela propria agenda, pelo perfil da startup em Explorar, em Matches ou no cabecalho da conversa. Todos utilizam o mesmo formulario. Na agenda, o investidor seleciona uma startup; nos demais acessos, a startup vem preenchida. O formulario envia startupId, dataHoraAgendada (ISO 8601), linkReuniao e notas. Os horarios sao apresentados em America/Fortaleza (UTC-3).

Startups e investidores consultam suas reunioes e podem mudar uma reuniao agendada para realizada, cancelada ou no_show. Esses estados sao finais. O status exibido e sempre o retornado pelo servidor; nao ha conclusao automatica.

Duracao, formato, assunto personalizado, endereco, historico, motivo de cancelamento, confirmacao de convite e reagendamento nao sao oferecidos porque nao fazem parte do contrato atual. O link HTTP/HTTPS informado pode ser aberto nos detalhes.

Nao ha persistencia local ou importacao dos antigos convites demonstrativos. Registros anteriores do localStorage nao sao enviados ao banco.

Para testar os fluxos com API simulada: `npm run build` e `node tests/meetings.browser.mjs`. O teste cobre erros e novas tentativas, criacao, recarga, calendario, cancelamento, busca, celular, acessos por Matches e conversa e restricao de criacao para startups. Capturas ficam em `output/meetings`.
