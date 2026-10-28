# Juntaí! Frontend

Plataforma para conectar startups, investidores e mentores, desenvolvida no Projeto Integrador de Análise e Desenvolvimento de Sistemas do Senac, com foco no ecossistema de inovação do Nordeste.

Interface em React, TypeScript e Vite, com React Router, styled-components e validação com Zod. Consome a API do [Juntaí! Backend](https://github.com/ClaraMelo72/Juntai-Backend).

## Executar

Requer Node.js 22.12 ou superior e npm.

```sh
npm ci
```

Copie `.env.example` para `.env.local` e ajuste `VITE_API_URL` para a URL do backend. As variáveis `VITE_*` são públicas e não devem conter segredos.

```sh
npm run dev
```

Acesse `http://localhost:5173`. Os recursos integrados dependem do backend em execução.

## Funcionalidades

- Cadastro e edição de perfis de startups, investidores e mentores, com rascunhos locais.
- Login, validação de sessão e solicitação de recuperação de senha via API.
- Exploração de startups, conexões, matches e mensagens.
- Agendamento de reuniões e painéis administrativos.
- Páginas de termos de uso e política de privacidade.

Parte dos fluxos de compatibilidade e reuniões ainda utiliza dados demonstrativos e armazenamento no navegador. A existência de uma tela não implica integração completa com o backend. Os textos legais são provisórios.

## Comandos

| Comando           | Finalidade                         |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Iniciar o ambiente local           |
| `npm run build`   | Validar tipos e gerar `dist/`      |
| `npm run preview` | Conferir o build localmente        |
| `npm run check`   | Verificar tipos, lint e formatação |
| `npm run format`  | Aplicar formatação                 |

## Estrutura

- `src/app`: aplicação e rotas.
- `src/features`: funcionalidades organizadas por domínio.
- `src/shared`: componentes, estilos, configurações e serviços compartilhados.
- `docs`: documentação funcional e de integração.

## Publicação

Configure `VITE_API_URL` antes de executar `npm run build` e publique o conteúdo de `dist/`. A hospedagem precisa redirecionar as rotas da SPA para `index.html`. Configure HTTPS e a origem permitida no CORS do backend. Alterações nas variáveis de ambiente exigem um novo build.

Arquivos locais de ambiente, dependências, builds e artefatos em `output/` e `tmp/` ficam fora do versionamento. Mantenha `package-lock.json` para instalações reproduzíveis.

## Projeto acadêmico

Integrantes, disciplinas e contexto estão em [Projeto Integrador](docs/projeto-integrador.md). A licença de distribuição ainda será definida pelo grupo.
