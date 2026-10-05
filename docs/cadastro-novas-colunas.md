# Cadastro — adaptação às novas colunas (03/10/2026)

## Uploads Cloudinary — 05/10/2026

Esta atualização substitui os trechos históricos abaixo sobre retirada do upload.
Logo PNG/JPG/WebP (2 MB) e apresentação PDF/PPT/PPTX (10 MB) voltaram ao formulário.
Após criar a conta, o frontend autentica o envio sem guardar o token na sessão.
`POST /uploads/startup/logo` e `/uploads/startup/apresentacao` exigem JWT de startup
e verificam a propriedade da conta ativa. A rota grava a URL HTTPS retornada pelo
Cloudinary em `logo_url` ou `apresentacao_url`; apenas as URLs vão para o banco.
Uma falha permite repetir nesta tela sem recriar a conta ou reenviar o logo já enviado.
Se a gravação falha, o arquivo recém-enviado é removido do Cloudinary.

As credenciais foram configuradas somente no `.env` ignorado pelo Git do backend.
Nenhuma documentação foi adicionada ao backend. Há migration para as duas colunas
de upload, que foram verificadas no banco configurado.

**Pendências verificadas:** o banco configurado tem o schema antigo e faltam outras
colunas usadas pelos serviços atuais. O usuário escolheu manter somente as duas
colunas de upload; a atualização restante e o cadastro real completo ficam pendentes.
O teste real do Cloudinary passou para imagem (HTTP 200), mas a entrega do PDF
retornou HTTP 401. Habilitar “PDF and ZIP files delivery” em Security no ambiente
Cloudinary é necessário para liberar o download. Os arquivos de teste foram removidos.

**Reverificação após ajuste da conta:** em 05/10/2026, novo upload de PDF e leitura
da URL retornaram HTTP 200. O arquivo de teste foi removido; a pendência de PDF
descrita acima está resolvida.

Consulta atual do `information_schema` confirmou as seguintes colunas ausentes
no banco apontado pelo `.env`, embora já existam nas entidades do backend:

| Tabela | Colunas ausentes |
| --- | --- |
| `startups` | `descricao_curta`, `site_url`, `links_sociais`, `video_apresentacao_url`, `segmentos_secundarios`, `estado`, `cidade`, `regioes_atuacao`, `regioes_crescimento`, `metrica_crescimento`, `periodo_comparacao_crescimento`, `descricao_evolucao`, `busca_investimento`, `necessidades_adicionais` |
| `investidores` | `titulo_profissional`, `linkedin_url`, `estado`, `cidade`, `areas_ajuda`, `disponibilidade`, `ja_atuou_com_startups`, `numero_aproximado_investimentos`, `descricao_experiencia`, `setores_atuacao` |
| `usuarios` | `avatar_url` |

`logo_url` e `apresentacao_url` existem. Esta consulta não alterou o banco.

Validação desta atualização: 63 testes unitários do frontend, fluxo de cadastro
no navegador (incluindo falha e repetição da apresentação sem duplicar a conta
ou o logo), checagens TypeScript dos dois projetos e testes da rota no backend.
Os testes da rota simulam banco/Cloudinary; não comprovam cadastro completo no
schema antigo. O teste externo usa Cloudinary real e arquivos descartáveis.

Comparação feita com as entidades, enums, serviços e rotas do backend local em
`../Juntai-Backend`. Nenhum arquivo do backend foi alterado. Não foi consultado
o schema de uma instância PostgreSQL; as conclusões abaixo são sobre o código local.

## Serviços atualizados — verificação posterior

`StartupService.create` e `InvestidorService.create` agora incluem os novos campos
nos DTOs e no `manager.create`. Os controllers repassam o corpo do POST diretamente
a esses serviços. Os avisos de campos ignorados foram removidos do frontend.

A atribuição obsoleta de `regiao` foi removida do serviço de startup.
O enum `Regiao` agora aceita apenas `norte`, `nordeste`, `centro_oeste`, `sudeste`
e `sul`; valores antigos `recife`, `porto_digital` e `nacional` não são válidos.
Isso também afeta as regiões de interesse do investidor, já gravadas pelo serviço:
o frontend passou a enviar os cinco valores atuais, sem condensá-los em `nacional`.

Os nomes, enums e limites enviados pelo frontend conferem com as entidades locais.
Isso confirma o mapeamento no código, não a gravação PostgreSQL nem a versão
publicada da API. Nenhum arquivo do backend foi alterado nesta verificação.

A checagem TypeScript do backend falhou em `src/test-entities.ts`: o script ainda
usa a propriedade removida `regiao` e `Regiao.RECIFE`. O backend não oferece uma
suíte automatizada no comando `test`. Os controllers também não validam o corpo
em tempo de execução; interfaces TypeScript não substituem essa validação.

## Campos preparados no frontend

### Ajuste do formulário de startup

- Removidos: ocultar número de clientes, faixa de faturamento, busca de
  investimento, tipo de parceiro, experiência desejada e preferências adicionais.
- Faturamento usa apenas o número exato em `faturamentoMensal`; clientes usam
  `numeroClientes`, sem um indicador separado de ocultação.
- Necessidades têm exatamente cinco escolhas: Mentoria, Conexões de mercado,
  Contratação de talentos, Parcerias estratégicas e Outro. Correspondem a
  `mentoria`, `conexoes_mercado`, `contratacao_talentos`,
  `parcerias_estrategicas` e `outro`.
- Há apenas um nome da startup (`nomeFantasia`) e um modelo de negócio
  (`modeloNegocio`). O POST ignora o nome público legado e monta a seleção única.
- O upload local de logo foi substituído por um link enviado em `logoUrl`.
  Não há upload de arquivo no backend. A apresentação PDF/PPT foi retirada;
  pitch em texto, link do vídeo e Canvas continuam enviados.
- Avisos com borda tracejada e sua legenda foram retirados do cadastro de startup.
  As confirmações de senha/termos são controles da interface; o texto dos termos
  continua informando que seus aceites não são registrados pelo backend.
  A autorização opcional de sugestões foi removida por não ter persistência.

Os campos antigos permanecem na estrutura de rascunhos para compatibilidade,
mas não reaparecem no formulário nem controlam clientes/faturamento enviados.
Necessidades antigas sem equivalente são removidas ao ler o rascunho;
Networking é convertido para Conexões de mercado.

| Cadastro   | Dados enviados com os nomes das novas propriedades                                                                                                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startup    | `descricaoCurta`, `siteUrl`, `linksSociais`, `videoApresentacaoUrl`, `segmentosSecundarios`, `estado`, `cidade`, `regioesAtuacao`, `regioesCrescimento`, `metricaCrescimento`, `periodoComparacaoCrescimento`, `descricaoEvolucao`, `buscaInvestimento`, `necessidadesAdicionais` |
| Investidor | `tituloProfissional`, `linkedinUrl`, `estado`, `cidade`, `areasAjuda`, `disponibilidade`, `jaAtuouComStartups`, `numeroAproximadoInvestimentos`, `descricaoExperiencia`, `setoresAtuacao`                                                                                         |

`taxaCrescimentoPct` já era uma propriedade do serviço; agora só é enviada com
métrica e período compatíveis. O serviço atualizado inclui esse contexto na gravação.
O limite foi reduzido para 9.999,99%, conforme `numeric(6,2)`.

O formulário de localização usa regiões de atuação e crescimento e deixou de
pedir a região antiga singular. Nacional seleciona as cinco regiões brasileiras.
Exterior continua sem equivalente e impede envio, sem ser removido silenciosamente.
Segmentos secundários e setores históricos novos usam o catálogo suportado.

Períodos de crescimento: últimos três meses, últimos seis meses, último ano ou
desde a fundação. Rascunhos com período mensal permanecem legíveis, mas precisam
de nova seleção antes do envio. Métrica aceita receita, clientes ou ambos.
A revisão e o perfil mostram o período escolhido, sem rotular tudo como anual.

A pergunta de busca de investimento foi removida. O fluxo de cadastro envia
`buscaInvestimento: true`, seguindo o padrão do backend, e solicita capital/finalidade.

Foram acrescentados campos opcionais para tempo dedicado e quantidade numérica
de investimentos. Frequência semanal não é convertida em horas disponíveis;
faixas como 2–5 investimentos não são convertidas em um número estimado. A escolha
“1” pode ser enviada como um, se não houver quantidade exata.

O leitor de perfil também aceita os novos campos e não exige mais `regiao`.
Respostas antigas continuam aceitas. Rascunhos locais de edição mantêm sua
precedência atual, para não sobrescrever alterações ainda não enviadas.

## Diferenças que permanecem

- Arquivo de apresentação não tem coluna equivalente. Upload de imagem não tem
  rota; startup aceita `logoUrl` e usuário aceita `avatarUrl`, ambos links.
  O cadastro de investidor ainda não envia sua imagem local como `avatarUrl`.
- Nome oficial separado, múltiplos modelos, faixas de receita/equipe e preferências
  de parceiro não têm colunas equivalentes na startup; não são mais solicitados
  neste formulário. Equipe detalhada não faz parte do POST de cadastro.
- Algumas especialidades do investidor não têm equivalente no enum de ajuda;
  somente as opções compatíveis são enviadas. Categorias equivalentes são deduplicadas.
- “Prefiro não informar” histórico do investidor é omitido; o padrão da
  entidade é `false`. O backend precisa distinguir omissão de uma resposta real
  antes de considerar esses padrões como escolhas do usuário.
- O banco armazena cidade/UF, mas não o ID IBGE; o frontend não inventa esse ID.
- Edição de perfil continua local: não foi criada uma API de atualização.

## Verificação

Validação concluída: 60 testes unitários, TypeScript e lint aprovados. Os oito
cenários de navegador de startup e investidor passaram; após os ajustes finais,
também passaram as repetições dos dois cenários de investidor e do cadastro
completo da startup.

Testes de conversão cobrem novas propriedades, enum de regiões, crescimento com
contexto, deduplicação de áreas, omissão de experiência e de valores sem definição.
Testes de navegador interceptam os cadastros e verificam o JSON, sem inserir dados
no banco. A gravação PostgreSQL não foi testada nesta verificação.

O backend não foi iniciado: sua configuração habilita `synchronize` fora de
produção, o que pode modificar o schema automaticamente. Não foram feitas
alterações de banco, migrações ou requisições reais de cadastro.

## Teste das startups existentes — 05/10/2026

Esta verificação substitui as limitações históricas de upload descritas acima.
A edição do perfil agora envia logo e apresentação pelas rotas existentes
`POST /uploads/startup/logo` e `POST /uploads/startup/apresentacao`. As URLs
retornadas são usadas no perfil; os arquivos enviados são removidos do rascunho
para evitar novo envio ao salvar outra seção. Os demais campos editados continuam
locais, pois não existe rota de atualização da startup.

O login foi testado pelo frontend real para SolNexo Energia e AgroPonte Digital.
Ambos retornaram HTTP 500. A API registrou
`column Usuario.avatar_url does not exist`. Ela foi iniciada com
`NODE_ENV=production`, sem sincronização automática do banco.

Por decisão do usuário, o backend e o banco foram mantidos. Não foi possível
enviar arquivos autenticados, preencher as startups no banco ou confirmar sua
exibição em todas as telas. Explore, Matches e o perfil público ainda usam
perfis de demonstração, sem leitura desses registros reais.

Os testes unitários do frontend verificam o uso das rotas existentes, o retorno
das URLs, a ausência de reenvio após salvar e o bloqueio de uploads quando a
autenticação falha. Esses testes usam respostas simuladas e não comprovam
envio ao Cloudinary ou persistência no banco nesta verificação.

## Novos cadastros completos — 05/10/2026

Após adicionar `usuarios.avatar_url` como coluna opcional, foram cadastradas
pelo frontend RotaClara Logística Teste e AprendeMar Educação Teste. Os perfis
e os arquivos estão explicitamente identificados como fictícios de teste.

Os cadastros incluem descrição, responsável, segmento principal e secundário,
estágio, modelo de negócio, mercado, problema, solução, cidade/UF, regiões de
atuação e expansão, clientes, faturamento, equipe, crescimento com contexto,
capital, finalidades, necessidades, pitch e todos os nove blocos do Canvas.
Site, redes sociais e vídeo foram omitidos por não existirem endereços reais
dessas empresas. Logo PNG e apresentação PDF foram enviados pelas telas ao
Cloudinary; as URLs retornadas ficaram persistidas no banco.

Logins em sessões novas, retorno dos campos pela API, imagem carregada no perfil
e download dos PDFs foram validados. Os dois registros permanecem `pendente`,
conforme o padrão de moderação do cadastro.

A verificação revelou e corrigiu no frontend a exibição do faturamento mensal,
o rótulo de Conexões de mercado e o cálculo de completude que exigia o campo
antigo de parceiro sem equivalente no banco. As senhas não foram registradas
nesta documentação.
