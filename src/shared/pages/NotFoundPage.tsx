import { Link } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer>
      <h1>Página não encontrada</h1>
      <p>O endereço que você acessou não está disponível.</p>
      <Link to="/">Voltar ao início</Link>
    </PageContainer>
  );
}
