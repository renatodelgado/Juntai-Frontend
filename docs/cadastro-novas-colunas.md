# Cadastro — adaptação às novas colunas (03/10/2026)

Comparação feita com as entidades, enums, serviços e rotas do backend local em
`../Juntai-Backend`. Nenhum arquivo do backend foi alterado. Não foi consultado
o schema de uma instância PostgreSQL; as conclusões abaixo são sobre o código local.

## Impedimento de persistência

As novas colunas existem nas entidades, mas `StartupService.create` e
`InvestidorService.create` ainda usam DTOs e listas de propriedades antigos.
Os novos campos enviados pelo frontend são ignorados nesses serviços.
O frontend foi preparado para o novo formato, sem afirmar que a gravação já ocorre.
Os campos correspondentes exibem aviso sobre essa pendência.

Em startup, o serviço também tenta atribuir `regiao`, removido da entidade.
O enum `Regiao` agora aceita apenas `norte`, `nordeste`, `centro_oeste`, `sudeste`
e `sul`; valores antigos `recife`, `porto_digital` e `nacional` não são válidos.
Isso também afeta as regiões de interesse do investidor, já gravadas pelo serviço:
o frontend passou a enviar os cinco valores atuais, sem condensá-los em `nacional`.

Para concluir a persistência, é necessário adaptar os dois serviços do backend
para aceitar, validar e atribuir as novas propriedades. Essa alteração foi
comunicada; o usuário optou por manter esta entrega somente no frontend.

## Campos preparados no frontend

| Cadastro   | Dados enviados com os nomes das novas propriedades                                                                                                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startup    | `descricaoCurta`, `siteUrl`, `linksSociais`, `videoApresentacaoUrl`, `segmentosSecundarios`, `estado`, `cidade`, `regioesAtuacao`, `regioesCrescimento`, `metricaCrescimento`, `periodoComparacaoCrescimento`, `descricaoEvolucao`, `buscaInvestimento`, `necessidadesAdicionais` |
| Investidor | `tituloProfissional`, `linkedinUrl`, `estado`, `cidade`, `areasAjuda`, `disponibilidade`, `jaAtuouComStartups`, `numeroAproximadoInvestimentos`, `descricaoExperiencia`, `setoresAtuacao`                                                                                         |

`taxaCrescimentoPct` já era uma propriedade do serviço; agora só é enviada com
métrica e período compatíveis. O backend atual ainda ignora esse contexto.
O limite foi reduzido para 9.999,99%, conforme `numeric(6,2)`.

O formulário de localização usa regiões de atuação e crescimento e deixou de
pedir a região antiga singular. Nacional seleciona as cinco regiões brasileiras.
Exterior continua sem equivalente e impede envio, sem ser removido silenciosamente.
Segmentos secundários e setores históricos novos usam o catálogo suportado.

Períodos de crescimento: últimos três meses, últimos seis meses, último ano ou
desde a fundação. Rascunhos com período mensal permanecem legíveis, mas precisam
de nova seleção antes do envio. Métrica aceita receita, clientes ou ambos.
A revisão e o perfil mostram o período escolhido, sem rotular tudo como anual.

A busca de investimento tem escolha explícita no formulário. Capital e finalidade
são solicitados apenas quando a startup responde que está buscando investimento.

Foram acrescentados campos opcionais para tempo dedicado e quantidade numérica
de investimentos. Frequência semanal não é convertida em horas disponíveis;
faixas como 2–5 investimentos não são convertidas em um número estimado. A escolha
“1” pode ser enviada como um, se não houver quantidade exata.

O leitor de perfil também aceita os novos campos e não exige mais `regiao`.
Respostas antigas continuam aceitas. Rascunhos locais de edição mantêm sua
precedência atual, para não sobrescrever alterações ainda não enviadas.

## Diferenças que permanecem

- `logoUrl` existe na startup, mas o formulário recebe uma imagem local em data URI.
  As rotas verificadas não oferecem upload; não foi enviada essa imagem como URL.
  Foto do investidor não tem coluna equivalente na entidade consultada.
- Nome oficial separado, múltiplos modelos da startup, faixas de receita/equipe,
  preferências de parceiro, equipe detalhada, anexos e consentimentos continuam
  sem correspondência completa no cadastro.
- Algumas necessidades e especialidades do frontend não têm equivalente nos novos
  enums. São preservadas no rascunho e sinalizadas; apenas opções compatíveis
  são enviadas. Áreas equivalentes que pertencem à mesma categoria são deduplicadas.
- Busca de investimento “em avaliação” não cabe num booleano e é omitida. A entidade
  usa `true` como padrão. “Prefiro não informar” histórico é omitido; o padrão da
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
no banco. A gravação PostgreSQL permanece pendente da correção dos serviços.

O backend não foi iniciado: sua configuração habilita `synchronize` fora de
produção, o que pode modificar o schema automaticamente. Não foram feitas
alterações de banco, migrações ou requisições reais de cadastro.
