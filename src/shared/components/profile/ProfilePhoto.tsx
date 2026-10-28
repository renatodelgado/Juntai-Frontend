import { useState } from 'react';
import defaultAvatar from '@/shared/assets/images/default-avatar.svg';
// Presentation only: the fallback never enters form values or persisted profiles.
export function ProfilePhoto({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const photo = src?.trim();
  const actual =
    photo &&
    photo !== failedSrc &&
    /^(https?:\/\/|data:image\/(?:png|jpeg|webp);base64,)/i.test(photo)
      ? photo
      : undefined;
  return (
    <img
      src={actual || defaultAvatar}
      alt={actual ? 'Foto de ' + name : 'Avatar padrão de ' + name}
      loading="lazy"
      decoding="async"
      onError={actual ? () => setFailedSrc(actual) : undefined}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 'inherit',
        display: 'block',
        backgroundImage: `url("${defaultAvatar}")`,
        backgroundSize: 'cover',
      }}
    />
  );
}
