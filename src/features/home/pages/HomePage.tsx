import { PageContainer } from '@/shared/components/PageContainer';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import logo from '@/shared/assets/images/logo-txt.svg';
import symbol from '@/shared/assets/images/logo-symb.svg';
import {
  Brand,
  Card,
  Description,
  Eyebrow,
  Header,
  Hero,
  HeroCopy,
  SymbolComposition,
  Title,
} from './HomePage.styles';

export function HomePage() {
  return (
    <PageContainer>
      <Header>
        <Brand src={logo} alt="Juntaí!" />
        <div>
          <Button as={Link} to="/login" $variant="secondary">
            Entrar
          </Button>
        </div>
      </Header>
      <Hero>
        <HeroCopy>
          <Eyebrow>Conexões que fazem o Nordeste crescer</Eyebrow>
          <Title>
            Grandes ideias
            <br className="narrow-break" /> começam
            <br className="wide-break" /> com
            <br className="narrow-break" /> <span>uma conexão</span>
          </Title>
          <Description>
            Um ponto de encontro para startups, investidores anjo e mentores.
            Aproximando ideias, experiência e oportunidades no ecossistema de
            inovação.
          </Description>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Button as={Link} to="/cadastro/startup">
              Tenho uma startup
              <ArrowRightIcon size={20} aria-hidden="true" />
            </Button>{' '}
            <Button as={Link} to="/cadastro/investidor" $variant="investor">
              Sou um investidor ou mentor
              <ArrowRightIcon size={20} aria-hidden="true" />
            </Button>
          </div>
        </HeroCopy>
        <SymbolComposition aria-hidden="true">
          <img src={symbol} alt="" />
        </SymbolComposition>
      </Hero>
      <Card aria-labelledby="project-status">
        <h2 id="project-status">
          Sua próxima conexão começa com a sua história
        </h2>
        <p>
          Apresente sua startup ou compartilhe sua experiência como investidor e
          mentor. Crie sua conta de teste, entre e mantenha seu perfil
          atualizado. As sugestões de conexões chegam nas próximas etapas.
        </p>
        <small>
          Nesta versão, contas e perfis ficam somente no navegador utilizado.
        </small>
      </Card>
    </PageContainer>
  );
}
