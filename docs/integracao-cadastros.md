# Integração dos cadastros — 13/09/2026

Contratos conferidos no código local de `../Juntai-Backend`: serviços, entidades, enums, controllers e rotas. As alterações desta entrega são somente no frontend.

## O que está ligado

- Startup: `POST /startups`, JSON com nome do responsável, email, senha e dados compatíveis da startup.
- Investidor/mentor: `POST /investidores`. Atuação convertida para `anjo`, `mentor` ou `anjo_mentor`. Mentor não envia tickets nem risco, mesmo que restem valores antigos no rascunho.
- Base padrão: `http://localhost:3333`. Para outro endereço, copie `.env.example` para `.env`, ajuste `VITE_API_URL` e reinicie o Vite. O endereço deve ser acessível pelo navegador do usuário.
- Sucesso aparece somente após resposta HTTP de sucesso. Erros mantêm formulário e rascunho. Não há repetição automática do POST.
- O cadastro não cria mais uma conta de demonstração nem uma sessão local. O backend consultado não oferece login, leitura ou atualização de perfil. A tela de login existente atende somente às contas antigas de demonstração e informa essa limitação.
- Os rascunhos continuam no navegador. Informações extras não são enviadas escondidas dentro do Canvas. Nenhuma senha é gravada pelo novo fluxo de cadastro.

## Correspondência e diferenças

Os formulários e as revisões sinalizam os campos sem envio com **borda tracejada amarela** e um comentário abaixo. **Borda azul** indica envio parcial. A marcação acompanha as escolhas: por exemplo, uma pessoa na equipe e faturamento zero são enviados, enquanto as faixas não são. Campos de confirmação que não são armazenados têm uma explicação específica. As cores não substituem os textos.

| Frontend                           | Backend / decisão aplicada                                                                                                                                                                                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nome da startup e nome público     | `nomeFantasia`: nome público, ou nome da startup quando vazio. Nome oficial separado permanece local.                                                                                                                                                                       |
| Responsável pela startup           | Novo campo na conclusão → `nome`. Não é inferido do nome da empresa ou dos integrantes.                                                                                                                                                                                     |
| Segmentos                          | Apenas opções compatíveis para novos cadastros; Economia Criativa → `economia_criativa`. Adicionados SaaS B2B e E-commerce. SaaS genérico não é convertido automaticamente em SaaS B2B.                                                                                     |
| Estágios                           | `ideation` → `ideacao`, `validation` → `validacao`, `early_traction` → `tracao`, `growth` → `crescimento`, `scale` → `escala`; MVP permanece `mvp`.                                                                                                                         |
| Vários modelos da startup          | Escolha explícita de um principal na conclusão. Backend aceita apenas `modeloNegocio`, singular.                                                                                                                                                                            |
| SaaS / Assinatura como modelo      | `assinatura_saas`; valores duplicados são removidos no array do investidor. Outros modelos sem equivalente não são convertidos.                                                                                                                                             |
| Localização da startup             | Cidade/UF continuam locais. Uma escolha separada define `regiao`: Recife, Porto Digital, Nordeste ou Nacional.                                                                                                                                                              |
| Regiões de interesse do investidor | Nordeste → `nordeste`; todas as cinco regiões brasileiras → `nacional`. Sul, Norte etc. isoladamente e Exterior não têm equivalente. A UI oferece Nordeste/Nacional; Recife/Porto Digital também existem no backend, mas ainda não têm seleção específica nesse formulário. |
| Clientes                           | `numeroClientes`; zero é preservado; não divulgação omite o campo.                                                                                                                                                                                                          |
| Faixa de faturamento               | Não é convertida em valor estimado. Campo opcional de valor exato na conclusão → `faturamentoMensal`; sem faturamento → zero; não divulgação omite.                                                                                                                         |
| Faixa de equipe                    | Campo opcional de quantidade exata → `tamanhoEquipe`; uma pessoa → 1. Demais faixas sem quantidade exata são omitidas.                                                                                                                                                      |
| Crescimento + período + métrica    | `taxaCrescimentoPct` não é enviado por enquanto: backend não define período nem se a taxa mede receita ou clientes. Enviar o percentual isolado perderia o significado.                                                                                                     |
| Procura investimento               | Quando sim, `capitalProcurado` recebe o capital; quando não/avaliando, recebe zero, pois a coluna é obrigatória. O backend não distingue esses dois estados.                                                                                                                |
| Finalidades                        | Rótulos concatenados em `finalidadeInvestimento`.                                                                                                                                                                                                                           |
| Mercado-alvo                       | `mercadoAlvo`, limitado a 200 caracteres conforme a coluna real.                                                                                                                                                                                                            |
| Pitch e Canvas                     | `descricaoPitch`; os nove blocos do Canvas, problema e solução em `canvasJson`. Vídeo e arquivo não são enviados.                                                                                                                                                           |
| Risco                              | Conservador/moderado/arrojado convertidos. Alto risco/estágio inicial não tem equivalente e foi retirado das novas escolhas.                                                                                                                                                |
| Experiência do investidor          | Novo campo opcional numérico → `anosExperiencia`. Texto livre e faixas de quantidade de investimentos não viram anos.                                                                                                                                                       |

Campos de conclusão (responsável, região, modelo principal, valores exatos e anos) ficam em memória durante o preenchimento; os campos originais continuam no rascunho. É preciso preencher novamente esses complementos após recarregar antes do envio.

## O que pedir ao backend

Prioridade para tornar o fluxo completo:

1. **Autenticação e perfil:** login com sessão/token, logout e recuperação de senha; leitura e atualização do perfil autenticado. Sem isso, cadastro funciona, mas o usuário não consegue acessar ou editar a conta criada no servidor.
2. **Resposta pública e erros:** retornar DTO com ID/status e dados públicos, sem `usuario.senhaHash`. Hoje os controllers devolvem a entidade criada com a relação de usuário. Validar o corpo no servidor e devolver erros por campo; diferenciar email duplicado (409) de falhas internas. Não devolver mensagens brutas do banco ao cliente.
3. **Consentimentos:** persistir finalidades, versão dos documentos, aceite, usuário e data oficial do servidor. Existe entidade de consentimento, mas os serviços de cadastro consultados não a utilizam. A aceitação atual fica local; não considerar isso como consentimento registrado no backend.
4. **Catálogos acordados:** ampliar segmentos, modelos e regiões ou expor um catálogo consumível pelo front. Decidir se a startup pode ter vários modelos, segmentos secundários e regiões de atuação/interesse.
5. **Métricas:** definir período e métrica do crescimento; decidir entre números exatos e faixas para receita/equipe; distinguir desconhecido, não informado e zero. Adicionar situação da busca de capital para diferenciar não procura de ainda avaliando.
6. **Arquivos e apresentação:** upload e leitura de foto/logo, pitch deck e vídeo/links. Definir limites, tipos aceitos e referência do arquivo no perfil.

Para preservar a experiência atual do front, também faltam:

- Startup: descrição curta, nome oficial separado, site/redes, UF/cidade IBGE, regiões de atuação e expansão, necessidades, preferências de parceiro, integrantes (nome, cargo, bio, LinkedIn), observações de crescimento.
- Investidor/mentor: foto, título profissional, LinkedIn, UF/cidade, especialidades, histórico e quantidade de investimentos, setores anteriores, disponibilidade, formatos de interação, aceite de mentorias, abertura para investir, contribuições e preferências livres.
- Consulta de status de moderação e motivos de ajuste; nenhuma etapa de aprovação pode ser simulada como resultado real.
- Idempotência no cadastro: uma interrupção de rede depois da gravação pode deixar o usuário sem confirmação. Repetir com o mesmo email poderá retornar duplicidade; o front não repete automaticamente.

## O que podemos simplificar no front

Para um MVP limitado ao contrato atual, recomendo ocultar dos novos cadastros os campos de foto/logo, links, anexos, equipe detalhada, disponibilidade, histórico e preferências que ainda não são persistidos. Mantive os campos e avisei sobre o armazenamento local para não remover informações já preenchidas sem uma decisão de produto.

Também podemos substituir as faixas por valores exatos diretamente na etapa de tração, usar apenas um nome público e um modelo principal para a startup e retirar temporariamente a coleta de crescimento. Isso elimina as perguntas complementares na conclusão. Se a escolha for manter o formulário completo, ampliar o backend é a alternativa.

## Validação

Há testes de conversão, omissão de dados não divulgados, mentor sem tickets, enums incompatíveis, falha de rede e erro HTTP, além de fluxos de navegador com POST interceptado para conferir o JSON e a recuperação após email duplicado. Os testes não criam registros no banco.

O servidor em `http://localhost:3333` não respondeu durante a verificação inicial desta entrega. A gravação real no PostgreSQL ainda deve ser confirmada com o backend em execução; o JSON e a integração HTTP podem ser verificados pelos testes simulados e pela aba Network do navegador.
