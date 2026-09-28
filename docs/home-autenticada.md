# Home autenticada

- Login, `/` e `/login` encaminham sessões válidas para `/startup/inicio` ou `/investidor/inicio`.
- Sessão persistida em `localStorage`, com migração do armazenamento por aba anterior. Logout remove a sessão e é sincronizado entre abas abertas.
- A expiração usa o `exp` do token emitido pelo backend; o frontend não renova nem estende esse prazo. `/auth/me` continua responsável por validar a sessão no servidor, na entrada, no foco e a cada minuto. Falhas temporárias não apagam a sessão.
- Os painéis leem `/auth/profile` para o resumo e o status real de moderação. A completude da startup usa as mesmas seções do perfil, incluindo o rascunho de edição salvo neste navegador; cada pendência abre sua seção de edição. Isso não altera o status de moderação nem simula o envio das alterações locais ao servidor.
- A aprovação é necessária para recomendações, mas não simula a ativação de um serviço ainda ausente. Perfis pendentes, rejeitados, suspensos e estados desconhecidos ficam bloqueados.
- Recomendações, exploração de startups, interesses, notificações, mensagens e reuniões aguardam serviços próprios. Não são criados matches, contagens ou eventos fictícios. O componente de recomendações distingue indisponibilidade (`null`) de lista vazia e recebe fatores estruturados de compatibilidade.
- Os links de revisão abrem o perfil existente. A edição de perfil continua com o comportamento atual de rascunho local; esta entrega não adiciona persistência remota de alterações.

Validação: testes de sessão, completude, estados de moderação, navegação por perfil, persistência entre abas, logout sincronizado e expiração com a página aberta.
