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
- Login e validação de sessão via API. A recuperação de senha ainda não envia código nem permite redefinição.
- Exploração de startups, conexões, matches e mensagens.
- Agendamento de reuniões e painéis administrativos.
- Páginas de termos de uso e política de privacidade.

A exploração, as mensagens, os interesses e as reuniões usam APIs autenticadas. Favoritos e alguns estados da descoberta ficam no navegador e não são sincronizados entre dispositivos. A integração completa com serviços reais deve ser validada em ambiente de teste; os textos legais são provisórios.

O envio de recuperação de senha depende de implementação no backend e de um serviço de e-mail configurado. A rota atual apenas verifica o endereço e ainda expõe se ele está cadastrado; não a considere um mecanismo completo de recuperação.

## Comandos

| Comando                | Finalidade                                                     |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Iniciar o ambiente local                                       |
| `npm run build`        | Validar tipos e gerar `dist/`                                  |
| `npm run preview`      | Conferir o build localmente                                    |
| `npm run check`        | Verificar tipos, lint e formatação                             |
| `npm test`             | Executar testes unitários de recomendações e reuniões          |
| `npm run test:browser` | Executar parte dos testes de navegador com respostas simuladas |

Os testes de navegador usam Playwright e, por padrão, Microsoft Edge. Alguns testes individuais exigem build prévio; consulte os arquivos em `tests/`. Os testes simulados não substituem a validação com o backend real.
| `npm run format` | Aplicar formatação |

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
