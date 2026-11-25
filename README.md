# Juntaí! Frontend

O Juntaí! aproxima startups, investidores anjo e mentores. A interface permite apresentar perfis, explorar oportunidades e iniciar conversas; a decisão de conexão ou investimento continua com as pessoas participantes. É um projeto acadêmico em fase beta.

**Demonstração na Azure:** https://delightful-beach-0c45f1a10.4.azurestaticapps.net/

Repositórios: [frontend](https://github.com/renatodelgado/Juntai-Frontend), [backend](https://github.com/renatodelgado/Juntai-Backend) e [motor de matchmaking](https://github.com/renatodelgado/Juntai-matchmaking-IA).

## Arquitetura

O navegador acessa o frontend React e a API Node.js. A API autentica e autoriza as operações, consulta o PostgreSQL e solicita recomendações ao serviço FastAPI. O frontend não acessa diretamente o banco ou o motor. IBGE, Cloudinary e Azure são serviços externos usados por funcionalidades e infraestrutura. O desenho e o fluxo de dados estão em [docs/arquitetura.md](docs/arquitetura.md).

## Tecnologias

React 19, TypeScript, Vite, React Router, styled-components e Zod. As versões e dependências estão em `package.json` e `package-lock.json`; Node.js 22.12 ou superior é exigido. O backend usa Node/Express/PostgreSQL e o motor usa Python/FastAPI.

## Executar localmente

1. Instale [Node.js](https://nodejs.org/) 22.12 ou superior, npm e Git. Clone o repositório e entre na pasta:

   ```sh
   git clone https://github.com/renatodelgado/Juntai-Frontend.git
   cd Juntai-Frontend
   npm ci
   ```

2. Copie `.env.example` para `.env.local`. Em PowerShell: `Copy-Item .env.example .env.local`; em macOS/Linux: `cp .env.example .env.local`. O padrão `VITE_API_URL=http://localhost:3333` aponta para a API local. Ajuste-o se a API usar outra porta. Variáveis `VITE_*` são públicas no navegador: não inclua senhas ou chaves.
3. Inicie a interface:

   ```sh
   npm run dev
   ```

4. Abra o endereço informado pelo Vite, normalmente http://localhost:5173. A interface pode ser aberta sem a API, mas cadastro, login e dados reais da aplicação precisam do [backend](https://github.com/renatodelgado/Juntai-Backend) e de um PostgreSQL com o esquema necessário. O backend, por sua vez, precisa do [motor](https://github.com/renatodelgado/Juntai-matchmaking-IA) para recomendações. Consulte os READMEs de cada serviço; o repositório do backend ainda não possui um esquema inicial completo para criar um banco vazio.

O rascunho de cadastro fica no navegador quando salvo. Alterações de perfil, contas, mensagens e reuniões utilizam a API; favoritos e parte do estado de descoberta ficam locais. Uploads e recuperação de senha exigem serviços externos configurados no backend.

## Funcionalidades e limites

- Cadastro e edição de perfis de startups, investidores e mentores; análise administrativa de perfis.
- Login, recuperação de senha, descoberta, recomendações, interesses, mensagens e reuniões.
- Painel administrativo e moderação. A aprovação não garante investimento.
- O beta usa recomendações por regras; a opção supervisionada é experimental e não representa probabilidade validada com usuários reais.
- A política de privacidade e os termos são provisórios. O registro dos aceites no servidor, o canal para titulares e a exclusão integral da conta continuam pendentes; veja [privacidade no cadastro](docs/privacidade-cadastro.md).

## Comandos e validação

| Comando                         | Finalidade                                               |
| ------------------------------- | -------------------------------------------------------- |
| `npm run dev`                   | Servidor de desenvolvimento                              |
| `npm run build`                 | Verifica tipos e gera `dist/`                            |
| `npm test`                      | Testes de recomendações e reuniões com dados controlados |
| `npm run check`                 | Tipos, ESLint e Prettier de todo o repositório           |
| `npm run test:browser`          | Parte dos testes em navegador, com respostas simuladas   |
| `npm run test:recovery:browser` | Fluxo de recuperação de senha simulado; exige build      |

Os testes de navegador usam Playwright e, por padrão, Microsoft Edge; consulte `tests/`. Os testes simulados não substituem a homologação com a API real. O `npm run check` pode identificar divergências de formatação em arquivos antigos; não se deve apresentá-lo como aprovado sem executá-lo.

## Regra ECA e evidência

Quando um investidor confirma interesse, o backend verifica se investidor e startup estão ativos e aprovados e registra o interesse apenas se ainda não existir. O executor é o backend, em `src/modules/startups/services/StartupInterestService.ts`; o teste `tests/matchmaking.test.cjs` cobre a idempotência. Para executá-lo no repositório backend, após instalar as dependências: `node --test tests/matchmaking.test.cjs`. Outra regra é a ordenação de perfis pelo motor; `tests/test_rules.py` verifica os critérios e dados insuficientes.

## Organização e publicação

`src/app` reúne rotas; `src/features` organiza funcionalidades; `src/shared` contém componentes e serviços comuns; `tests` e `docs` registram validações e decisões. A implantação beta usa Azure Static Web Apps; as instruções de infraestrutura estão em [docs/azure-beta.md](docs/azure-beta.md). O build incorpora `VITE_API_URL`, e a hospedagem deve encaminhar rotas da SPA para `index.html`.

## Equipe e uso de IA

Os nomes e o contexto acadêmico estão em [docs/projeto-integrador.md](docs/projeto-integrador.md). O histórico Git registra contribuições técnicas identificáveis, mas não comprova sozinho a participação de quem trabalhou fora dos commits. O Codex foi usado para auxiliar na revisão dos textos de privacidade e desta documentação; os comandos e limitações verificados devem ser apresentados pela equipe. Outras ferramentas e usos anteriores precisam ser completados pela equipe. A licença de distribuição ainda não foi definida.
