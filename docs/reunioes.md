# Reunioes agendadas

A agenda utiliza a API autenticada do backend: GET /reunioes, POST /reunioes e PATCH /reunioes/:id/status.

Somente investidores iniciam agendamentos, pelo perfil da startup em Explorar ou Matches. O formulario envia startupId, dataHoraAgendada (ISO 8601), linkReuniao e notas. Os horarios sao apresentados em America/Fortaleza (UTC-3).

Startups e investidores consultam suas reunioes e podem mudar uma reuniao agendada para realizada, cancelada ou no_show. Esses estados sao finais. O status exibido e sempre o retornado pelo servidor; nao ha conclusao automatica.

Duracao, formato, assunto personalizado, endereco, historico, motivo de cancelamento, confirmacao de convite e reagendamento nao sao oferecidos porque nao fazem parte do contrato atual. O link HTTP/HTTPS informado pode ser aberto nos detalhes.

Nao ha persistencia local ou importacao dos antigos convites demonstrativos. Registros anteriores do localStorage nao sao enviados ao banco.
