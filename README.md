# Juntaí! Frontend

> **Cadastro integrado (13/09/2026):** startup e investidor/mentor enviam dados para a API na porta 3333. Login e edição online ainda dependem do backend; descrições de contas locais abaixo se referem à demonstração anterior. Consulte [contratos, campos pendentes e opções de simplificação](docs/integracao-cadastros.md).

**Juntaí!**, uma solução de matchmaking desenvolvida para conectar startups, investidores anjo e mentores do ecossistema de inovação do Nordeste.

O projeto faz parte do Projeto Integrador do 5º período de Análise e Desenvolvimento de Sistemas (ADS), com foco no ecossistema de startups e economia criativa, tendo como contexto o Porto Digital, no Bairro do Recife.

---

## 📌 Sobre o projeto

O Juntaí! é uma plataforma SaaS voltada à conexão entre startups em estágio inicial, investidores anjo e mentores. Busca facilitar a descoberta de oportunidades, a apresentação de startups, o matchmaking e a comunicação após uma conexão.

Este repositório contém a interface web em React e TypeScript. O frontend é responsável pela apresentação das informações, navegação e interação com o usuário, consumindo a API do [Juntai Backend](https://github.com/ClaraMelo72/Juntai-Backend).

---

## 🎯 Objetivo

Desenvolver uma interface organizada, acessível e escalável capaz de:

- Apresentar startups, investidores e mentores;
- Permitir cadastro, autenticação e gerenciamento de perfis;
- Facilitar a descoberta de perfis compatíveis;
- Apoiar a comunicação e o agendamento de reuniões;
- Exibir pitches, avaliações e métricas;
- Disponibilizar interfaces administrativas e de consentimento.

Esses recursos representam o escopo do produto. A base atual inclui a infraestrutura do frontend, uma página inicial e o onboarding de startup com rascunho local. A integração de cadastros com a API ainda não está disponível.

---

## 👥 Atores

### Startup / Empreendedor

Responsável por apresentar sua startup, informar necessidades e buscar investidores ou mentores compatíveis.

### Investidor Anjo / Mentor

Responsável por cadastrar seus interesses, avaliar startups e interagir com oportunidades.

### Administrador

Responsável pela moderação de cadastros e conteúdos, acompanhamento de métricas e ações administrativas.

---

## 🚀 Funcionalidades

### Disponíveis nesta base

- Aplicação React com TypeScript em modo estrito;
- Desenvolvimento e build com Vite;
- Navegação com React Router, página inicial e página não encontrada;
- Estilos globais e tema tipado com styled-components;
- Configuração pública da URL da API e função compartilhada de requisições;
- ESLint, Prettier e EditorConfig.

### Previstas

- Cadastro, autenticação e gerenciamento de perfis;
- Cadastro de startups, investidores e mentores;
- Interesses, critérios de compatibilidade e matchmaking;
- Comunicação, agendamento, pitch e modelo de negócio;
- Moderação, métricas, feedback e avaliações;
- Política de uso e consentimento.

---

## 🏗️ Arquitetura

O frontend separa a composição da aplicação, os módulos de funcionalidades e os recursos compartilhados. Essa organização preserva a separação de responsabilidades do backend, adaptada ao React.

```text
app (rotas e providers)
    ↓
features (páginas, componentes e lógica de cada funcionalidade)
    ↓
shared (componentes, estilos, configurações e comunicação HTTP)
    ↓
API do backend
```

### Camadas

| Diretório               | Responsabilidade                                                       |
| ----------------------- | ---------------------------------------------------------------------- |
| `src/app`               | Composição da aplicação, providers e rotas                             |
| `src/features`          | Código agrupado por funcionalidade, como home, autenticação e startups |
| `src/shared/components` | Componentes reutilizáveis entre funcionalidades                        |
| `src/shared/config`     | Configurações públicas e variáveis de ambiente                         |
| `src/shared/pages`      | Páginas genéricas, como a página não encontrada                        |
| `src/shared/services`   | Comunicação HTTP compartilhada                                         |
| `src/shared/styles`     | Tema e estilos globais                                                 |
| `src/shared/types`      | Declarações de tipos compartilhadas                                    |

### Convenções de desenvolvimento

- Usar componentes funcionais e hooks; manter cada componente com uma responsabilidade clara.
- Criar módulos em `features/<funcionalidade>`. Adicionar `components`, `hooks`, `services` e `types` dentro do módulo somente quando houver código que justifique essas pastas.
- Manter serviços de endpoints dentro da funcionalidade e usar `shared/services/api.ts` para o transporte HTTP. A função retorna `Response`; cada serviço deve tratar e validar o formato real recebido.
- Evitar chamadas HTTP diretamente na renderização e dependências entre detalhes internos de funcionalidades diferentes.
- Promover código para `shared` quando ele for reutilizável por diferentes módulos.
- Usar PascalCase para componentes e camelCase para funções e variáveis; preferir nomes descritivos e exportações nomeadas.
- Usar `import type` para tipos, evitar `any` e importar a partir de `@/` quando isso facilitar a leitura.
- Manter estilos específicos junto ao componente em arquivos `.styles.ts`. Usar tokens do tema e prefixo `$` para props usadas apenas na estilização.
- Priorizar HTML semântico, navegação por teclado, labels em formulários e layouts responsivos.
- Manter estado local por padrão; introduzir novas bibliotecas quando houver uma necessidade concreta.

---

## 📂 Estrutura do projeto

```text
Juntai-Frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── router.tsx
│   ├── features/
│   │   └── home/pages/
│   │       ├── HomePage.tsx
│   │       └── HomePage.styles.ts
│   ├── shared/
│   │   ├── components/PageContainer.ts
│   │   ├── config/env.ts
│   │   ├── pages/NotFoundPage.tsx
│   │   ├── services/api.ts
│   │   ├── styles/
│   │   │   ├── global.ts
│   │   │   └── theme.ts
│   │   └── types/styled.d.ts
│   ├── main.tsx
│   └── vite-env.d.ts
├── .editorconfig
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 🛠️ Stack

| Categoria                           | Tecnologia                          |
| ----------------------------------- | ----------------------------------- |
| Linguagem                           | TypeScript 5.9                      |
| Interface                           | React 19                            |
| Build e servidor de desenvolvimento | Vite 7                              |
| Estilização                         | styled-components 6                 |
| Navegação                           | React Router 7                      |
| Comunicação HTTP                    | Fetch API nativa                    |
| Qualidade de código                 | ESLint 9, Prettier 3 e EditorConfig |
| Ambiente de ferramentas             | Node.js e npm                       |

As versões resolvidas das dependências estão registradas no `package-lock.json`.

Referências: [Vite](https://vite.dev/guide/), [React](https://react.dev/learn), [styled-components](https://styled-components.com/docs) e [React Router](https://reactrouter.com/).

---

## 🔐 Autenticação e autorização

O backend prevê autenticação com JWT e perfis de startup, investidor/mentor e administrador. O frontend ainda não implementa login, armazenamento de tokens ou proteção de rotas.

A integração deverá seguir o contrato definido pela API. Restrições visuais no frontend não substituem a validação de permissões no backend.

---

## ☁️ Armazenamento de mídia

O backend prevê o uso de Cloudinary para imagens de perfil, logos e materiais de apresentação. O frontend deverá enviar e exibir mídias conforme os endpoints definidos. Credenciais privadas de Cloudinary não pertencem a este repositório nem às variáveis `VITE_*`.

---

## 🗄️ Integração com o backend

O navegador consome a API HTTP; PostgreSQL e TypeORM são responsabilidades exclusivas do backend.

```text
React → Fetch API → Backend Express → TypeORM → PostgreSQL
```

Configure `VITE_API_URL` com a URL base da API, sem necessidade de barra final. A configuração padrão é `http://localhost:3333`. No backend consultado, `GET /` retorna uma mensagem textual de disponibilidade e os cadastros usam `POST /startups` e `POST /investidores`. A página inicial funciona independentemente da API e não faz requisições automáticas.

---

## ⚙️ Instalação

### Pré-requisitos

- Node.js 22.12 ou superior (usar uma versão LTS compatível);
- npm;
- Git;
- Backend em execução somente para desenvolver ou validar integrações com a API.

Não é necessário instalar PostgreSQL para executar apenas este frontend.

### Acessar o projeto

Após obter este repositório, entre na pasta:

```bash
cd Juntai-Frontend
```

O endereço remoto do frontend será incluído quando o repositório for publicado.

### Instalar dependências

```bash
npm ci
```

Use `npm install` ao adicionar ou atualizar dependências e versione o `package-lock.json` resultante.

### Configurar variáveis de ambiente

Copie `.env.example` para `.env`. No PowerShell:

```powershell
Copy-Item .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

Conteúdo inicial:

```dotenv
VITE_API_URL=http://localhost:3333
```

Variáveis `VITE_*` são públicas e incorporadas ao bundle. Nunca inclua senhas, chaves privadas ou segredos. Reinicie o servidor após alterar `.env`.

---

## ▶️ Executando em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`. A porta é fixa: se estiver ocupada, encerre o processo que a utiliza ou ajuste `vite.config.ts`.

O backend deve ser iniciado separadamente, seguindo seu próprio README. Para requisições diretas entre origens, a API precisa permitir a origem do frontend via CORS.

Se o PowerShell bloquear `npm.ps1`, use `npm.cmd` no lugar de `npm`, por exemplo `npm.cmd run dev`.

---

## 🏗️ Build

```bash
npm run build
```

O comando verifica os tipos e gera o site estático em `dist/`. Essa pasta não deve ser versionada.

---

## ▶️ Prévia da versão de produção

```bash
npm run preview
```

Após o build, acesse o endereço exibido no terminal (por padrão, `http://localhost:4173`). Esse comando serve apenas para verificação local, não é um servidor de produção.

---

## 🧪 Testes e validação

```bash
npm run check
npm run build
```

| Comando                | Finalidade                                          |
| ---------------------- | --------------------------------------------------- |
| `npm run typecheck`    | Verificar tipos da aplicação e configuração do Vite |
| `npm run lint`         | Verificar regras de código e de hooks               |
| `npm run format:check` | Conferir a formatação                               |
| `npm run format`       | Aplicar a formatação                                |
| `npm run check`        | Executar tipos, lint e conferência de formatação    |

Execute `npm test` para validar regras e contratos do onboarding com Vitest e `npm run test:e2e` para testar a jornada no navegador com Playwright. No Windows, os testes usam Microsoft Edge; em outros sistemas, instale Chromium com `npx playwright install chromium`. O servidor de testes utiliza a porta 5174. As cidades são simuladas nos testes para evitar dependência de rede. A integração com a API e testes com usuários beta continuam previstos.

---

## 🔒 Segurança e LGPD

O desenvolvimento das funcionalidades deverá contemplar consentimento, tratamento adequado de dados pessoais, controle de acesso e comunicação segura em produção. A interface deverá refletir as políticas e permissões definidas pelo backend.

Esta base não implementa esses fluxos e não representa uma declaração de conformidade. Segredos ficam no backend; arquivos `.env` locais são ignorados pelo Git.

---

## 📊 Métricas

Está prevista a apresentação de indicadores fornecidos pela API: startups e investidores cadastrados, matches, conversas, reuniões, interações e avaliações. Os painéis ainda serão desenvolvidos.

---

## ☁️ Deploy

O frontend gera arquivos estáticos que podem ser publicados em um serviço de hospedagem compatível. O backend prevê implantação na Microsoft Azure; o destino do frontend será definido na etapa de implantação.

- Configurar `VITE_API_URL` com a URL pública da API antes do build;
- Publicar o conteúdo de `dist/`;
- Configurar fallback de rotas da SPA para `index.html`, permitindo abrir ou recarregar rotas diretamente;
- Habilitar HTTPS e configurar a origem permitida no CORS do backend.

Alterações de variáveis de ambiente exigem um novo build e publicação.

---

## 📋 Requisitos do Sistema

Os requisitos abaixo representam o escopo do Projeto Integrador, ainda a implementar na interface e integrar à API.

### Requisitos funcionais

- **RF01:** Cadastro de startups;
- **RF02:** Cadastro de investidores e mentores;
- **RF03:** Matchmaking por critérios de afinidade;
- **RF04:** Visualização de perfis compatíveis;
- **RF05:** Comunicação e agendamento;
- **RF06:** Apresentação de pitch e modelo de negócio;
- **RF07:** Autenticação e controle de acesso;
- **RF08:** Moderação administrativa;
- **RF09:** Geração de métricas;
- **RF10:** Feedback e avaliação;
- **RF11:** Política de uso e consentimento conforme a LGPD.

### Requisitos não funcionais

- Disponibilidade, segurança e privacidade;
- Usabilidade, acessibilidade e responsividade;
- Escalabilidade e manutenibilidade;
- Governança e auditabilidade;
- Confiabilidade e portabilidade.

---

## 🎓 Projeto Integrador

**Curso:** Análise e Desenvolvimento de Sistemas – ADS  
**Período:** 5º período  
**Projeto:** Startups e Economia Criativa  
**Contexto:** Porto Digital – Recife/PE  
**Produto:** Juntaí!

### Integrantes

- João Victor Rodrigues Basante;
- João Vitor Malveira da Silva;
- Maria Clara de Melo;
- Renato Trancoso Branco Delgado;
- Thayana Anália dos Santos Lira;
- Vinicius Henrique Silva Nascimento.

### Disciplinas norteadoras

| Disciplina                             | Professor(a)               |
| -------------------------------------- | -------------------------- |
| Unidade de Extensão: Full Stack        | Filipe Carvalho            |
| Governança em Tecnologia da Informação | Angela Regina Souza Santos |

### Demais disciplinas integrantes

| Disciplina                            | Professor                               |
| ------------------------------------- | --------------------------------------- |
| Eletiva III: Inteligência Artificial  | Victor Henrique dos Santos Oliveira     |
| Eletiva IV: Gestão da Informação      | Guibson Barros de Almeida Santana       |
| Empreendedorismo e Planos de Negócios | Guibson Barros de Almeida Santana       |
| High Tech Aplicada ao Mercado         | Arnott Ramos Caiado                     |
| Verificação e Validação de Software   | Pedro Henrique de Oliveira Barreto Lins |
| Tech English V                        | Pedro Paulo Procópio de Oliveira Santos |

---

## 📌 Status

🚧 **Em desenvolvimento**

Ambiente inicial e cadastro de startup implementados no frontend. Autenticação, persistência no backend, publicação e moderação serão integradas nas próximas etapas.

### Cadastro de startup

Acesse `/cadastro/startup` ou use o botão da página inicial. A jornada contém 11 etapas: sobre, negócio, mercado, atuação, tração, investimento, parcerias, pitch e Canvas, equipe, revisão e consentimento.

- As respostas permanecem em memória ao trocar de etapa. “Salvar e continuar depois” grava os dados e a apresentação no IndexedDB deste navegador. Fechar um editor do Canvas também salva o bloco e o rascunho. Não há sincronização entre dispositivos.
- O rascunho tem versão, validação de estrutura ao carregar, opção de remoção e recuperação de anexos (PDF/PPT/PPTX até 10 MB). Erros de armazenamento são exibidos sem descartar os dados da tela.
- Estado e cidade usam identificadores padronizados. As cidades são consultadas na [API de localidades do IBGE](https://servicodados.ibge.gov.br/api/docs/localidades), com estado de carregamento, erro e nova tentativa.
- Os catálogos editáveis ficam em `src/features/startup-onboarding/data/catalogs.ts`; a ordem, os títulos e identificadores de etapas ficam em `data/steps.ts`. Uma etapa nova precisa de componente e regras de validação próprios.
- Os componentes reutilizáveis de formulário ficam em `src/shared/components/forms`, e botão, modal e stepper ficam em `src/shared/components/ui`.
- Em telas menores, o indicador de progresso fica compacto e permite mostrar/ocultar a lista de etapas. Os erros de campo aparecem em balões sem alterar a posição dos campos. A jornada usa fundo terracotta suave; a página inicial mantém seu próprio fundo.
- Atuação, crescimento e busca de parceiros usam cinco regiões brasileiras e Exterior. “Selecionar todo o Brasil” é um atalho para as cinco regiões, sem persistir uma categoria redundante. Rascunhos antigos com Pernambuco ou Outra precisam revisar essas seleções; as demais informações são preservadas.
- Os textos do Canvas são editados em modais com indicador de preenchimento. Os termos e a política também abrem em modais dentro do cadastro, mantendo as rotas diretas disponíveis.
- As cores de startup usam terracotta e os tokens `startup`, `startupStrong` (contraste para texto/botões) e `startupSoft`. O token `investor` corresponde a dark slate blue. Todos derivam do tema compartilhado. Os ícones são do [Phosphor](https://github.com/phosphor-icons/react).
- `model/types.ts` define o rascunho, Canvas, integrantes, estados de moderação e contrato de eventos futuros. `model/validation.ts` valida cada etapa. `model/submission.ts` prepara o contrato de integração com números, listas de códigos, Canvas, pitch e integrantes separados.
- Os estados previstos são `draft` (rascunho), `in_review` (em revisão), `approved` (aprovado), `changes_requested` (pendente de ajustes) e `rejected` (rejeitado). Nesta versão, todos os perfis continuam como rascunho local. O backend deverá controlar as transições de moderação.
- `/termos-de-uso` e `/politica-de-privacidade` contêm minutas temporárias versionadas. Ao concluir a prévia, as escolhas são salvas junto da versão e da data/hora local. Não há usuário autenticado: a integração deverá associar os registros ao usuário e gerar o horário oficial no servidor. As minutas e as bases legais precisam ser revisadas antes da publicação.
- Não há envio de cadastro, upload remoto, scoring, ranking, matchmaking ou emissão de eventos. O contrato `StartupRegistrationGateway` deverá ser implementado quando a API e a autenticação estiverem disponíveis. Nunca converter a conclusão local em status “em revisão” sem confirmação do servidor.

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte do Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas. A licença de distribuição do frontend ainda será definida pelo grupo.

### Perfil provisório da startup

Ao concluir a prévia local do cadastro, o usuário é direcionado para `/startup/perfil`.
A tela usa os dados e a apresentação salvos no navegador, mantém o fundo terracotta
e reúne negócio, mercado, tração, investimento, parceiros, equipe, pitch e Canvas.
Cada seção pode ser editada em modal na própria página, sem retornar ao cadastro. O menu se recolhe
em telas pequenas, e a apresentação pública pode ser conferida em um modal local.

O estado “Em avaliação” é ilustrativo: nenhum cadastro é enviado para moderação.
A completude representa seções preenchidas, não compatibilidade. Matches, mensagens
e reuniões dependem da futura integração. Sem sessão ativa, a página direciona
ao login. O código fica em `src/features/startup-profile`.

### Conta e login locais

Ao concluir o cadastro, informe e-mail e senha de teste. A conta armazena uma cópia
independente do perfil no IndexedDB, incluindo logo (PNG, JPG ou WebP, até 2 MB)
e apresentação. A senha fica como hash PBKDF2-SHA-256 com salt aleatório, não em
texto puro. A sessão utiliza sessionStorage; “Sair da conta” encerra o acesso.
`/login` autentica a conta criada no mesmo navegador e abre `/startup/perfil`
ou `/investidor/perfil`, conforme o tipo de conta.
Esta simulação não substitui autenticação ou autorização no backend.

A home oferece as entradas “Tenho uma startup” e “Sou um investidor ou mentor”.
`/cadastro/investidor` oferece o onboarding de investidores e mentores.

### Cadastro de investidores e mentores

O fluxo tem 13 etapas: apresentação, atuação, segmentos, estágios, ticket,
modelos e regiões, experiência, histórico, disponibilidade, contribuições,
preferências, revisão e consentimentos. A conta local é criada ao finalizar.
O fundo é dark slate blue, com cartões claros e os mesmos componentes do
cadastro de startups. Os campos financeiros são dispensados para mentores.

O rascunho é salvo automaticamente no IndexedDB, com botão de salvamento manual.
O perfil permite edição em modais, inclusive da disponibilidade. Os catálogos
de segmentos, estágios, modelos e regiões são compartilhados entre os públicos.
`investorSubmission` organiza os dados em grupos para uma futura API; tickets
permanecem números, escolhas são identificadores e consentimentos incluem versão,
usuário e data. O contrato de eventos futuros não emite eventos nesta versão.

O código está em `src/features/investor-onboarding`. Moderação, matchmaking e
envio de dados ao servidor continuam fora desta prévia local.

### Painel do investidor e mentor

`/investidor/perfil` apresenta o ambiente privado com a mesma estrutura visual
do perfil da startup: sidebar responsiva, cabeçalho com foto, status, completude,
cartões de interesses, investimento, experiência, contribuições e disponibilidade.
Os estilos de perfil são compartilhados em `src/shared/components/profile`,
mantendo terracotta para startups e dark slate blue para investidores e mentores.

“Ver como startup” abre uma prévia local sem controles de edição. As alterações
continuam em modais, sem retornar ao onboarding. Mentores não recebem métricas de
investimento. O percentual usa informações reais do perfil, e a atividade fica
vazia até existirem eventos. O modelo aceita comentários de moderação e eventos
futuros, preservados durante a edição. Não há recomendações ou contato ativos.
