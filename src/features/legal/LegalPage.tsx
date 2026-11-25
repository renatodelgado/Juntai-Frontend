import { Link } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { LEGAL_VERSION } from '@/features/startup-onboarding/model/submission';

export function LegalDocument({ document }: { document: 'terms' | 'privacy' }) {
  const terms = document === 'terms';
  return (
    <article>
      <p>
        <strong>Versão de testes · {LEGAL_VERSION}</strong>
      </p>
      {terms ? (
        <>
          <h2>1. Sobre o Juntaí!</h2>
          <p>
            O Juntaí! é um projeto acadêmico que aproxima startups, investidores
            anjo e mentores. A plataforma permite criar perfis, descobrir
            oportunidades e iniciar conversas. As sugestões são um apoio à
            busca: elas não garantem contato, investimento ou retorno
            financeiro.
          </p>
          <h2>2. Cadastro e perfil</h2>
          <p>
            Forneça informações verdadeiras e mantenha seu perfil atualizado.
            Inclua dados e materiais de outras pessoas somente quando tiver
            autorização para isso. Evite enviar senhas, documentos pessoais,
            informações confidenciais ou dados sensíveis em campos de texto e
            apresentações.
          </p>
          <p>
            Após o envio, o cadastro passa por análise. Perfis aprovados podem
            ser apresentados a outros participantes, conforme as funções da
            plataforma. A aprovação não representa verificação financeira,
            jurídica ou garantia sobre o conteúdo de um perfil.
          </p>
          <h2>3. Uso responsável</h2>
          <p>
            Use mensagens, perfis e materiais recebidos para interações ligadas
            à finalidade da plataforma. Não divulgue conteúdo de terceiros sem
            autorização nem utilize o serviço para fraude ou assédio. As
            funcionalidades e a disponibilidade podem mudar durante os testes.
          </p>
          <h2>4. Rascunho e conta</h2>
          <p>
            Um rascunho salvo pode ser retomado no mesmo navegador e pode ser
            perdido se os dados do site forem apagados. Remover o rascunho não
            exclui a conta enviada ao servidor. A exclusão da conta ainda não
            está disponível na interface.
          </p>
          <p>
            Estes termos são provisórios. As condições definitivas e a
            identificação do responsável pelo serviço ainda precisam ser
            estabelecidas antes de uma operação pública.
          </p>
        </>
      ) : (
        <>
          <h2>1. Quais dados são usados</h2>
          <p>
            No cadastro, podem ser informados nome, e-mail, senha, localização,
            foto, informações profissionais e dados do perfil da startup, do
            investidor ou do mentor. Conforme as escolhas feitas, o perfil pode
            incluir segmento, estágio, interesses, experiência, disponibilidade,
            valores de investimento, links e apresentação. A plataforma também
            trata mensagens, reuniões e interações realizadas durante o uso.
          </p>
          <p>
            Alguns campos são opcionais. Não é necessário informar dados sobre
            saúde, religião, origem racial ou outras informações sensíveis para
            criar um perfil. Evite incluí-los em textos livres e arquivos, assim
            como dados de outras pessoas sem autorização.
          </p>
          <h2>2. Para que os dados são usados</h2>
          <p>
            Os dados permitem criar e administrar a conta, autenticar o acesso,
            apresentar perfis aprovados, apoiar a moderação, ordenar sugestões
            de conexão e viabilizar mensagens e reuniões. As características e
            preferências informadas podem ser comparadas com outros perfis. A
            pontuação é uma indicação de afinidade e não assegura interesse,
            contato ou investimento; a decisão de conversar permanece com as
            pessoas envolvidas.
          </p>
          <h2>3. Onde ficam e com quem são compartilhados</h2>
          <p>
            Se você escolher salvar o rascunho, ele ficará no armazenamento
            deste navegador. Ao criar a conta, os dados compatíveis são enviados
            ao servidor. Fotos e apresentações selecionadas podem ser enviadas
            após a criação da conta. Partes dos perfis aprovados ficam visíveis
            a outros usuários conforme a plataforma permite; não inclua em seu
            perfil informações que não queira apresentar.
          </p>
          <p>
            No ambiente de testes, a infraestrutura utiliza serviços da Azure;
            imagens e arquivos podem ser armazenados no Cloudinary. A seleção de
            cidades consulta a API do IBGE, e as fontes são carregadas pelo
            Google Fonts. Esses fornecedores podem receber dados necessários à
            prestação de seus serviços, inclusive dados técnicos de conexão.
          </p>
          <h2>4. Segurança e conservação</h2>
          <p>
            O servidor armazena a senha em forma de hash e utiliza autenticação
            para proteger recursos da conta. Rascunhos podem ser acessados por
            quem utiliza o mesmo perfil do navegador; prefira um dispositivo
            pessoal. Os prazos de retenção, a rotina de descarte e as condições
            de restauração ainda precisam ser definidos para o serviço.
          </p>
          <h2>5. Seus direitos e escolhas</h2>
          <p>
            A LGPD prevê direitos como confirmação do tratamento, acesso,
            correção, eliminação nas hipóteses aplicáveis e informações sobre o
            compartilhamento. Quando o tratamento depender de consentimento,
            você também pode revogá-lo. A lei prevê ainda a solicitação de
            revisão de decisões tomadas unicamente de forma automatizada quando
            afetarem seus interesses.
          </p>
          <p>
            Você pode remover o rascunho no navegador, mas isso não apaga a
            conta no servidor. O canal para solicitações, a exclusão da conta e
            os procedimentos para exercer esses direitos ainda estão em
            definição e não estão disponíveis nesta interface. Os aceites
            exibidos no cadastro ainda não são registrados no servidor.
          </p>
          <h2>6. Informações ainda necessárias</h2>
          <p>
            O responsável pelo tratamento, seu canal de contato, as bases legais
            de cada finalidade, os prazos de conservação e os procedimentos de
            atendimento ainda precisam ser definidos. Este texto descreve a
            versão de testes e deverá ser atualizado antes da operação pública.
          </p>
        </>
      )}
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
