import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CaretRightIcon, HouseIcon } from '@phosphor-icons/react';
import { getSession, homePath } from '@/features/auth/services/session';
import { Header } from './PageHeader.styles';

export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [{ label: title }],
  actions,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  const home = homePath(getSession()?.usuario.tipoPerfil ?? 'investidor');
  const crumbs =
    breadcrumbs[0]?.label === 'Início' || breadcrumbs[0]?.label === 'Juntaí!'
      ? breadcrumbs
      : [{ label: 'Início', to: home }, ...breadcrumbs];
  return (
    <Header>
      <nav aria-label="Breadcrumb">
        <ol>
          {crumbs.map((crumb, index) => (
            <Fragment key={`${crumb.label}-${index}`}>
              <li>
                {index > 0 && <CaretRightIcon size={12} aria-hidden="true" />}
                {crumb.to ? (
                  <Link to={crumb.to}>
                    {index === 0 && <HouseIcon size={14} aria-hidden="true" />}
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={
                      index === crumbs.length - 1 ? 'page' : undefined
                    }
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
      <div className="heading-row">
        <div className="heading-copy">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="heading-actions">{actions}</div>}
      </div>
    </Header>
  );
}
