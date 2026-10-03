import { Link } from 'react-router-dom';
import { ChatCircleIcon, ArrowUpRightIcon } from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import { StartupIdentity } from '@/features/explore-startups/components/StartupCard';
import type { Discovery } from '@/features/explore-startups/useDiscovery';
import { matchStatus, statusLabels, type Match } from '../model';
import * as S from '../Matches.styles';

export function StartedConnections({
  matches,
  data,
  search,
}: {
  matches: Match[];
  data: Discovery;
  search: string;
}) {
  const started = matches.filter(
    (match) =>
      match.canMessage ||
      match.mutualInterest ||
      data.state.interests.some((item) => item.startupId === match.startup.id),
  );
  return (
    <S.Connections>
      <h2>Conexões que estão acontecendo</h2>
      <p>
        Acompanhe os próximos passos das suas conexões. A conversa completa fica
        em Mensagens.
      </p>
      {!started.length ? (
        <p>
          Quando você demonstrar interesse ou iniciar uma conexão, ela aparecerá
          aqui.
        </p>
      ) : (
        <div className="items">
          {started.map((match) => {
            const last = match.conversation?.messages.at(-1);
            const contact =
              last?.createdAt ??
              data.state.interests.find(
                (item) => item.startupId === match.startup.id,
              )?.createdAt;
            return (
              <article key={match.startup.id}>
                <div className="identity">
                  <StartupIdentity startup={match.startup} />
                  <div>
                    <h3>{match.startup.name}</h3>
                    <S.Status $status={matchStatus(match, data.state)}>
                      {statusLabels[matchStatus(match, data.state)]}
                    </S.Status>
                  </div>
                </div>
                {contact && (
                  <time dateTime={contact}>
                    Último contato ·{' '}
                    {new Date(contact).toLocaleString('pt-BR', {
                      timeZone: 'America/Fortaleza',
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </time>
                )}
                {last?.content && <blockquote>{last.content}</blockquote>}
                <div className="actions">
                  {match.canMessage && (
                    <Button
                      as={Link}
                      to={`/investidor/mensagens?startup=${match.startup.id}`}
                      $variant="secondary"
                    >
                      <ChatCircleIcon size={16} />
                      Abrir conversa
                    </Button>
                  )}
                  <Button
                    as={Link}
                    to={`/startups/${match.startup.id}`}
                    state={{
                      returnTo: '/investidor/matches',
                      returnSearch: search,
                    }}
                    onClick={() => data.viewed(match.startup.id)}
                    $variant="quiet"
                  >
                    Consultar perfil
                    <ArrowUpRightIcon size={15} />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </S.Connections>
  );
}
