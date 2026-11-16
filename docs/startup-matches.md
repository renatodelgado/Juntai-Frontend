# Interessados na startup

A rota /startup/matches está disponível para startups aprovadas e é acessada pelo item Matches do menu. Consome GET /startups/interessados, sem dados demonstrativos ou porcentagens de compatibilidade.

Exibe três contadores reais, lista de investidores/mentores interessados, apresentação e formas de contribuição, data do interesse, busca, filtros por atuação e situação e ordenação. O perfil público abre em modal. Somente os dados públicos selecionados pelo backend são usados.

Abrir conversa só aparece após a primeira mensagem do investidor/mentor. Ver reunião abre o agendamento vinculado por ?reuniao=:id. Avaliar interação usa reunião realizada ou conversa com mensagens dos dois participantes. Estados sem interesse, sem resultados e erro com nova tentativa têm orientações próprias. A lista é atualizada a cada minuto e ao retornar à janela.

Validação: npm run check; npm run build; node tests/startup-matches.browser.mjs. Capturas em output/startup-matches.
