import { PageContainer } from '@/shared/components/PageContainer';
import { Card, Description, Eyebrow, Title } from './HomePage.styles';

export function HomePage() {
  return (
    <PageContainer>
      <Eyebrow>Conexões que fazem o Nordeste crescer</Eyebrow>
      <Title>Juntaí!</Title>
      <Description>
        Um ponto de encontro para startups, investidores anjo e mentores.
        Aproximando ideias, experiência e oportunidades no ecossistema de
        inovação.
      </Description>
      <Card aria-labelledby="project-status">
        <h2 id="project-status">Estamos construindo essa conexão</h2>
        <p>
          A plataforma está em desenvolvimento. Em breve, você poderá apresentar
          sua startup e descobrir pessoas que compartilham dos seus interesses.
        </p>
      </Card>
    </PageContainer>
  );
}
