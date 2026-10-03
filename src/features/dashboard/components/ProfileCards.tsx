import { Link } from 'react-router-dom';
import { CheckCircleIcon, CircleIcon } from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import {
  Card,
  Badge,
  Row,
  Progress,
  Muted,
  Avatar,
} from '@/shared/components/profile/Profile.styles';
import {
  Checklist,
  Details,
  StatusPanel,
  TipsPanel,
} from '../pages/Dashboard.styles';
import {
  completionItems,
  dashboardName,
  initials,
  label,
  labels,
  moderation,
  money,
  type Dashboard,
} from '../model/dashboard';

export function ProfileStatusCard({ data }: { data: Dashboard }) {
  const status = moderation(data.profile.statusModeracao);
  return (
    <StatusPanel
      $status={data.profile.statusModeracao}
      aria-labelledby="profile-status-title"
    >
      <div>
        <Badge>{status.badge}</Badge>
        <h2 id="profile-status-title">{status.title}</h2>
        <p>{status.description}</p>
        {(data.profile.statusModeracao === 'pendente' || status.approved) && (
          <Row aria-label="Etapas da avaliação">
            <Badge>
              <CheckCircleIcon aria-hidden="true" />
              Cadastro concluído
            </Badge>
            <Badge aria-current={!status.approved ? 'step' : undefined}>
              Em avaliação
            </Badge>
            <Badge aria-current={status.approved ? 'step' : undefined}>
              Perfil aprovado
            </Badge>
          </Row>
        )}
      </div>
      <Button as={Link} to={`/${data.role}/perfil`} $variant="secondary">
        {data.profile.statusModeracao === 'rejeitado'
          ? 'Revisar meu perfil'
          : 'Ver meu perfil'}
      </Button>
    </StatusPanel>
  );
}

export function ProfileCompletionCard({ data }: { data: Dashboard }) {
  const items = completionItems(data);
  const percent = Math.round(
    (items.filter((item) => item.filled).length / items.length) * 100,
  );
  return (
    <Card>
      <header>
        <h2>Complete seu perfil</h2>
        <Badge>{percent}%</Badge>
      </header>
      <Progress
        max={100}
        value={percent}
        aria-label="Completude dos dados cadastrados"
      />
      <Muted>
        {data.role === 'startup'
          ? 'As mesmas seções do seu perfil, incluindo alterações salvas neste navegador.'
          : 'Sua apresentação é o primeiro passo para boas conexões.'}
      </Muted>
      <Checklist>
        {items.map((item) => (
          <li key={item.label}>
            {item.filled ? (
              <CheckCircleIcon aria-label="Preenchido" weight="fill" />
            ) : (
              <CircleIcon aria-label="Ainda não preenchido" />
            )}
            {!item.filled && item.step ? (
              <Link
                to={`/${data.role}/perfil?editar=${item.step}`}
                aria-label={`Completar ${item.label}`}
              >
                {item.label} · Completar
              </Link>
            ) : (
              item.label
            )}
          </li>
        ))}
      </Checklist>
      <Button as={Link} to={`/${data.role}/perfil`} $variant="secondary">
        {percent === 100 ? 'Revisar perfil' : 'Completar perfil'}
      </Button>
    </Card>
  );
}

export function ProfileSummaryCard({ data }: { data: Dashboard }) {
  const name = dashboardName(data);
  return (
    <Card>
      <header>
        <h2>
          {data.role === 'startup'
            ? 'Minha startup'
            : 'Meu perfil de investimento e mentoria'}
        </h2>
      </header>
      <Row>
        <Avatar aria-hidden="true">{initials(name)}</Avatar>
        <div>
          <strong>{name}</strong>
          <br />
          <Badge>{moderation(data.profile.statusModeracao).badge}</Badge>
        </div>
      </Row>
      <Details>
        {data.role === 'startup' ? (
          <>
            <div>
              <dt>Segmento</dt>
              <dd>{label(data.profile.segmento)}</dd>
            </div>
            <div>
              <dt>Estágio</dt>
              <dd>{label(data.profile.estagio)}</dd>
            </div>
            <div>
              <dt>Região</dt>
              <dd>
                {data.profile.regioesAtuacao?.length
                  ? labels(data.profile.regioesAtuacao)
                  : label(data.profile.regiao ?? '')}
              </dd>
            </div>
            <div>
              <dt>Modelo de negócio</dt>
              <dd>{label(data.profile.modeloNegocio)}</dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>Atuação</dt>
              <dd>{label(data.profile.tipoInvestidor)}</dd>
            </div>
            <div>
              <dt>Segmentos</dt>
              <dd>{labels(data.profile.segmentosInteresse)}</dd>
            </div>
            <div>
              <dt>Estágios</dt>
              <dd>{labels(data.profile.estagiosInteresse)}</dd>
            </div>
            <div>
              <dt>Regiões</dt>
              <dd>{labels(data.profile.regioesInteresse)}</dd>
            </div>
            <div>
              <dt>Modelos</dt>
              <dd>{labels(data.profile.modelosInteresse)}</dd>
            </div>
            {data.profile.tipoInvestidor !== 'mentor' && (
              <div>
                <dt>Faixa de investimento</dt>
                <dd>
                  {data.profile.ticketMinimo != null &&
                  data.profile.ticketMaximo != null
                    ? `${money(data.profile.ticketMinimo)} – ${money(data.profile.ticketMaximo)}`
                    : 'Ainda não informada'}
                </dd>
              </div>
            )}
            <div>
              <dt>Disponibilidade</dt>
              <dd>Ainda não disponível nesta área</dd>
            </div>
          </>
        )}
      </Details>
      <Button as={Link} to={`/${data.role}/perfil`} $variant="quiet">
        {data.role === 'startup'
          ? 'Revisar informações da startup'
          : 'Revisar preferências'}
      </Button>
    </Card>
  );
}

export function SeekingCard({
  data,
}: {
  data: Extract<Dashboard, { role: 'startup' }>;
}) {
  return (
    <Card>
      <h2>O que sua startup está buscando?</h2>
      {(data.profile.capitalProcurado ?? 0) > 0 && <Badge>Investimento</Badge>}
      <Details>
        <div>
          <dt>Capital buscado</dt>
          <dd>{money(data.profile.capitalProcurado)}</dd>
        </div>
        <div>
          <dt>Objetivo do investimento</dt>
          <dd>
            {data.profile.finalidadeInvestimento || 'Ainda não informado'}
          </dd>
        </div>
      </Details>
      <Muted>
        Outras necessidades aparecerão aqui quando estiverem disponíveis na sua
        conta.
      </Muted>
      <Button as={Link} to="/startup/perfil" $variant="quiet">
        Revisar objetivos
      </Button>
    </Card>
  );
}

export function ProfileTips({ data }: { data: Dashboard }) {
  const missing = completionItems(data).filter((item) => !item.filled);
  return (
    <TipsPanel>
      <h2>Como preparar novas conexões</h2>
      {missing.length ? (
        <>
          <p>Vale a pena revisar estas informações:</p>
          <ul>
            {missing.slice(0, 3).map((item) => (
              <li key={item.label}>{item.label}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>
          Mantenha seus objetivos e interesses atualizados para representar seu
          momento atual.
        </p>
      )}
      <Muted>
        Um perfil bem descrito ajuda outras pessoas a conhecerem sua atuação.
      </Muted>
    </TipsPanel>
  );
}
