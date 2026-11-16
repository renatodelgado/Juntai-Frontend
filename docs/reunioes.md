# Reunioes agendadas

A agenda utiliza a API autenticada do backend: GET /reunioes, POST /reunioes e PATCH /reunioes/:id/status.

Somente investidores iniciam agendamentos, pela propria agenda, pelo perfil da startup em Explorar, em Matches ou no cabecalho da conversa. Todos utilizam o mesmo formulario. Na agenda, o investidor seleciona somente startups em que ja demonstrou interesse, consultadas em GET /startups/interesses; nos demais acessos, a startup vem preenchida. O formulario envia startupId, dataHoraAgendada (ISO 8601), linkReuniao e notas. Os horarios sao apresentados em America/Fortaleza (UTC-3).

Startups e investidores consultam suas reunioes e podem mudar uma reuniao agendada para realizada, cancelada ou no_show. Esses estados sao finais. O status exibido e sempre o retornado pelo servidor; a conclusao manual fica disponivel a partir do inicio agendado. Um processo no backend conclui automaticamente as reunioes ainda agendadas apos 24 horas do inicio, com verificacao a cada minuto e na inicializacao do servidor. Canceladas e no_show sao preservadas.

Duracao, formato, assunto personalizado, endereco, historico, motivo de cancelamento, confirmacao de convite e reagendamento nao sao oferecidos porque nao fazem parte do contrato atual. O link HTTP/HTTPS informado pode ser aberto nos detalhes.

Nao ha persistencia local ou importacao dos antigos convites demonstrativos. Registros anteriores do localStorage nao sao enviados ao banco.

Para testar os fluxos com API simulada: `npm run build` e `node tests/meetings.browser.mjs`. O teste cobre erros e novas tentativas, criacao, recarga, calendario, cancelamento, busca, celular, acessos por Matches e conversa e restricao de criacao para startups. Capturas ficam em `output/meetings`.

Ao concluir uma reuniao, o participante pode avaliar a interacao. Avaliacoes sao privadas, individuais e editaveis, com nota de 1 a 5 e comentario opcional de ate 2000 caracteres. O outro participante recebe sua propria pendencia. Agora nao adia o lembrete por 24 horas no servidor.

O formulario compartilhado valida o interesse tambem nos acessos com startup preenchida (perfil, Matches e conversa). Sem interesses, explica como demonstrar interesse em Explorar e mantem o envio desabilitado. Falhas ao consultar interesses permitem nova tentativa, sem usar o catalogo geral como alternativa.

O feedback inclui estrelas, resultado da interação e perspectiva de investimento, com comentário opcional recolhido. Investimento realizado só aparece como confirmado quando os dois participantes o informam na mesma interação; intenção e negociação não confirmam investimento. Avaliações antigas recebem valores neutros, mantendo nota e comentário.
