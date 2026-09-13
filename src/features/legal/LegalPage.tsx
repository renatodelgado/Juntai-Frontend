import { Link } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { LEGAL_VERSION } from '@/features/startup-onboarding/model/submission';

export function LegalDocument({ document }: { document: 'terms' | 'privacy' }) {
  const terms = document === 'terms';
  return (
    <article>
      <p>
        <strong>Minuta provisória · versão {LEGAL_VERSION}</strong>
      </p>
      <p>
        Este texto descreve a versão de testes do Juntaí! e precisa ser revisado
        pelo grupo antes do lançamento. Ainda não define as condições de um
        serviço público em produção.
      </p>
      {terms ? (
        <>
          <h2>1. O que é esta prévia</h2>
          <p>
            O Juntaí! é um projeto acadêmico para aproximar startups,
            investidores anjo e mentores. Nesta versão, você pode construir e
            revisar um perfil no navegador e enviar o cadastro ao servidor. Não
            há recomendação automática, oferta de investimento, intermediação
            financeira ou garantia de conexão.
          </p>
          <h2>2. Informações e materiais do perfil</h2>
          <p>
            Ao preencher o perfil, utilize informações verdadeiras e materiais
            que você tenha autorização para apresentar. Confirme a autorização
            dos integrantes antes de incluir dados pessoais da equipe. Não
            inclua documentos pessoais, senhas ou informações confidenciais de
            terceiros.
          </p>
          <h2>3. Salvamento e disponibilidade</h2>
          <p>
            Ao escolher salvar, os dados e o arquivo de apresentação ficam
            apenas neste navegador. Eles podem ser perdidos se você limpar os
            dados do site, usar navegação privada ou trocar de dispositivo. Você
            pode remover o rascunho pela própria tela de cadastro.
          </p>
          <h2>4. Publicação e moderação futuras</h2>
          <p>
            A conclusão envia os dados compatíveis ao servidor, que registra o
            cadastro com status inicial pendente. Ainda não há acompanhamento da
            análise pelo frontend. Os critérios de publicação, ajustes,
            aprovação e rejeição precisarão ser apresentados em uma nova versão
            dos termos.
          </p>
          <h2>5. Antes do lançamento</h2>
          <p>
            O grupo deverá definir a entidade responsável pelo serviço, os
            canais de contato, condições de acesso, responsabilidades,
            procedimentos de moderação e demais regras aplicáveis. Os termos
            definitivos serão apresentados para novo aceite.
          </p>
        </>
      ) : (
        <>
          <h2>1. Informações preenchidas</h2>
          <p>
            O cadastro reúne apresentação da startup, localização, estágio,
            segmento, mercado, indicadores de tração, necessidades, preferências
            de parceiros, pitch, Canvas e dados profissionais da equipe. Alguns
            campos são opcionais e indicadores permitem escolher não informar.
          </p>
          <p>
            Para investidores e mentores, o perfil também reúne foto, bio, áreas
            de interesse, faixas de investimento quando aplicáveis, experiência,
            disponibilidade e formas de contribuição. As opções são usadas para
            construir a apresentação e preparar preferências para conexões
            futuras, sem executar recomendações nesta versão.
          </p>
          <h2>2. Finalidade e armazenamento nesta prévia</h2>
          <p>
            As informações servem para montar, revisar e retomar o perfil. Ao
            salvar, o navegador guarda o rascunho e a apresentação usando
            armazenamento local do site (IndexedDB). Ao finalizar o cadastro,
            nome, email, senha e dados compatíveis do perfil são enviados ao
            servidor do Juntaí!. Fotos, arquivos, links, preferências
            complementares e consentimentos continuam apenas no rascunho local.
          </p>
          <p>
            A senha do novo cadastro é enviada ao servidor para criação da conta
            e não é gravada pelo frontend. O login online ainda não está
            disponível. Contas antigas de demonstração continuam armazenadas
            somente neste navegador, com uma verificação criptográfica da senha
            e sessão local.
          </p>
          <h2>3. Serviços externos utilizados</h2>
          <p>
            A seleção de cidades consulta a API pública do IBGE usando o estado
            escolhido. As fontes são carregadas pelo Google Fonts. Essas
            conexões podem expor dados técnicos de navegação, como o endereço
            IP, aos provedores. O conteúdo completo do perfil não é enviado
            nessas consultas.
          </p>
          <h2>4. Sugestões de conexão no futuro</h2>
          <p>
            O projeto pretende comparar características estruturadas, como
            segmento, estágio, regiões e necessidades, com preferências de
            investidores e mentores. Ainda não há pontuação, ranking ou
            algoritmo de recomendação. A escolha opcional registrada agora é
            apenas uma preferência da prévia; finalidade, base legal e condições
            do recurso deverão ser revisadas antes da ativação, com nova
            confirmação quando cabível.
          </p>
          <h2>5. Controle sobre seu rascunho</h2>
          <p>
            Você pode revisar e alterar os dados a qualquer momento ou usar
            “Remover rascunho” para apagá-los deste navegador. Os dados locais
            permanecem até essa remoção ou até o navegador limpar seu
            armazenamento. Pessoas que utilizem o mesmo perfil de navegador
            podem acessar o rascunho; prefira um dispositivo pessoal. Remover o
            rascunho não exclui um cadastro já enviado ao servidor. A exclusão
            da conta no servidor ainda não está disponível nesta interface.
          </p>
          <h2>6. Registro das escolhas</h2>
          <p>
            Na conclusão da prévia, os aceites e preferências são salvos
            localmente com a versão deste documento e a data e hora do
            dispositivo. Não há usuário autenticado associado ainda. O registro
            oficial, vinculado ao usuário e com horário do servidor, depende da
            integração futura.
          </p>
          <h2>7. Definições pendentes</h2>
          <p>
            Antes do lançamento, deverão ser identificados o controlador dos
            dados e seu canal de atendimento, as bases legais, os prazos de
            retenção, os destinatários e as medidas de proteção. Também deverão
            ser definidos os procedimentos para exercer direitos relacionados
            aos dados pessoais. Esta minuta não declara conformidade integral
            com a LGPD.
          </p>
        </>
      )}
      <p>
        Referência para a revisão do grupo:{' '}
        <a
          href="https://www.gov.br/governodigital/pt-br/lgpd-pagina-do-cidadao/conheca-os-principais-conceitos"
          target="_blank"
          rel="noopener noreferrer"
        >
          conceitos de proteção de dados do Governo Digital
        </a>
        .
      </p>
    </article>
  );
}

export function LegalPage({ document }: { document: 'terms' | 'privacy' }) {
  return (
    <PageContainer>
      <Link to="/cadastro/startup">Voltar ao cadastro</Link>
      <h1>
        {document === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
      </h1>
      <LegalDocument document={document} />
    </PageContainer>
  );
}
