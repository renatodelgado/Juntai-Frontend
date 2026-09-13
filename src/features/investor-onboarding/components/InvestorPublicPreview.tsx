import { MapPinIcon, LinkedinLogoIcon } from '@phosphor-icons/react';
import * as S from '@/shared/components/profile/Profile.styles';
import { safeLink } from '@/features/startup-profile/model/profile';
import * as catalogs from '@/features/startup-onboarding/data/catalogs';
import * as model from '../model/investor';
import { money } from '../model/profile';

export function ProfileTags({
  options,
  values,
}: {
  options: readonly catalogs.Option[];
  values: string[];
}) {
  return (
    <S.Row>
      {values.length ? (
        values.map((value) => (
          <S.Badge key={value}>{catalogs.optionLabel(options, value)}</S.Badge>
        ))
      ) : (
        <S.Muted>Não informado</S.Muted>
      )}
    </S.Row>
  );
}
export function InvestorIdentity({
  data,
  main = false,
}: {
  data: model.InvestorDraft;
  main?: boolean;
}) {
  const linkedin = safeLink(data.linkedin);
  const name = data.name || 'Seu perfil';
  return (
    <>
      <S.Row>
        <S.Avatar>
          {data.photo ? (
            <img
              src={data.photo}
              alt={`Foto de ${name}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 'inherit',
              }}
            />
          ) : (
            <span aria-hidden="true">
              {name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase()}
            </span>
          )}
        </S.Avatar>
        <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          {main ? <h1>{name}</h1> : <h2>{name}</h2>}
          <p>{catalogs.optionLabel(model.participation, data.participation)}</p>
        </div>
      </S.Row>
      <p>{data.title || 'Título profissional não informado'}</p>
      <S.Muted>
        <MapPinIcon size={16} aria-hidden="true" />{' '}
        {data.cityName && data.state
          ? `${data.cityName}, ${data.state}`
          : 'Localização não informada'}
      </S.Muted>
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noopener noreferrer">
          <LinkedinLogoIcon size={18} aria-hidden="true" /> LinkedIn
        </a>
      )}
      <p>{data.bio || 'Adicione uma bio para apresentar sua trajetória.'}</p>
    </>
  );
}
export function InvestorPublicPreview({ data }: { data: model.InvestorDraft }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <InvestorIdentity data={data} />
      <h3>Segmentos de interesse</h3>
      <ProfileTags options={catalogs.segments} values={data.segments} />
      <h3>Estágios</h3>
      <ProfileTags options={catalogs.stages} values={data.stages} />
      {data.participation !== 'mentor' && (
        <>
          <h3>Faixa habitual de investimento</h3>
          <p>
            {money(data.ticketMin)} — {money(data.ticketMax)}
          </p>
        </>
      )}
      <h3>Minha experiência</h3>
      <ProfileTags options={model.expertise} values={data.expertise} />
      <h3>Modelos e regiões</h3>
      <ProfileTags
        options={catalogs.businessModels}
        values={data.businessModels}
      />
      <ProfileTags options={catalogs.regions} values={data.regions} />
      <h3>Como posso contribuir</h3>
      <ProfileTags options={model.offers} values={data.offers} />
      <h3>Disponibilidade</h3>
      <p>
        {catalogs.optionLabel(model.frequencies, data.frequency) ||
          'Não informado'}
      </p>
      <ProfileTags options={model.interactions} values={data.interactions} />
      <S.Muted>
        Prévia local de apresentação. Nenhum perfil está publicado.
      </S.Muted>
    </div>
  );
}
