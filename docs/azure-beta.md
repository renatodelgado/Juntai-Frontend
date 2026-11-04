# Beta na Azure

Os três repositórios publicam automaticamente ao receber pushes em `main`.
Cada workflow pode ser executado manualmente pela aba Actions do GitHub.

- Frontend: Azure Static Web Apps Free, `juntai-beta-front`.
- API: Container Apps, `juntai-beta-api`.
- Matchmaking: Container Apps com autenticação entre serviços, `juntai-beta-matchmaking`.
- Imagens privadas: `juntaibeta60774.azurecr.io`.
- Grupo dos recursos beta: `juntai-beta`.
- Banco separado: `juntai_beta`, no servidor PostgreSQL existente `juntai`, grupo `banco_juntai`.

Os contêineres têm mínimo de zero réplicas e máximo de uma. A primeira chamada
após inatividade pode demorar devido à inicialização. O ambiente não cria um
workspace Log Analytics. O registro Basic e o uso além das franquias gratuitas
consomem os créditos da assinatura. O limite de gastos da assinatura Students
deve permanecer ativado; não converter a assinatura para pagamento por uso.

## Deploy automático

A autenticação do GitHub usa OIDC, com identidade exclusiva por repositório e
credencial federada vinculada à branch `main`. As variáveis de Actions são
`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`,
`AZURE_REGISTRY` e, no frontend, `BETA_API_URL`.

As identidades de publicação têm permissão restrita ao recurso publicado.
Backend e matchmaking também podem enviar imagens ao registro privado.
A identidade de execução dos contêineres tem somente `AcrPull` no registro.
As senhas do banco e a chave JWT ficam nos secrets da API no Container Apps.
O motor exige `X-Matchmaking-Key` nas chamadas de recomendação; a API envia
esse header usando um segredo compartilhado nos dois contêineres. O frontend
nunca recebe essa chave. O endpoint `/health` permite verificações de saúde
sem autenticação. A configuração de entrada interna do Express não bloqueou
chamadas externas no teste, portanto a proteção é validada na aplicação.
O token de publicação do frontend é obtido durante o job e mascarado nos logs.

O workflow do frontend valida, testa, compila e envia `dist`. O arquivo
`public/staticwebapp.config.json` permite abrir e atualizar rotas da SPA.
Os outros workflows validam o serviço, publicam uma imagem identificada pelo
SHA do commit e atualizam a revisão do respectivo contêiner.

## Dados e configuração

A base beta é uma cópia pontual dos dados locais. Deploys de código não repetem
a cópia nem sobrescrevem os dados. O backend usa TLS com verificação do
certificado e `synchronize: false`; mudanças de schema exigem migrations
revisadas. O banco local e os demais bancos Azure são preservados.

O motor usa a estratégia `rules`. Ativar o modelo supervisionado exige
disponibilizar os artefatos validados e as dependências apropriadas antes de
alterar `MATCHMAKING_STRATEGY`.

O firewall do servidor PostgreSQL permite conexões de serviços Azure, conforme
autorizado para este beta. A regra também permite tentativas de outras contas
Azure; a conexão continua exigindo credenciais e TLS. O usuário da aplicação
recebe permissões sobre os objetos do banco beta. A regra evita depender dos
IPs de saída variáveis do ambiente econômico. Para maior isolamento, planejar
uma rede privada e revisar o custo antes de mudar a infraestrutura.

O ambiente atual usa o modo Express do Container Apps, com cobrança por consumo
e escala zero. Nesse modo, atualizações substituem a revisão ativa; não há
divisão de tráfego entre revisões. O histórico de imagens permanece no ACR.

O script `scripts/azure/Set-BetaDatabaseCredential.ps1` recebe a senha do
administrador por entrada oculta e grava uma credencial protegida pelo Windows
em `tmp/azure-auth`, ignorado pelo Git. Não versionar `.env`, dumps ou arquivos
de `tmp`. Após a implantação e validação, a credencial administrativa e os
arquivos temporários com segredos podem ser removidos localmente.
