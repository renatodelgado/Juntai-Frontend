import { useState } from 'react';
import { Input } from './Fields';
import { Button } from '../ui/Button';

export function ImageUpload({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [error, setError] = useState('');
  async function choose(file?: File) {
    if (!file) return;
    setError('');
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError('Escolha uma imagem PNG, JPG ou WebP de até 2 MB.');
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result));
      reader.onerror = () =>
        setError('Não conseguimos abrir a imagem. Tente outra.');
      reader.readAsDataURL(file);
    } catch {
      setError('Não conseguimos abrir a imagem. Tente outra.');
    }
  }
  return (
    <div>
      {value && (
        <img
          src={value}
          alt={label}
          style={{
            width: 96,
            height: 96,
            objectFit: 'contain',
            borderRadius: 12,
          }}
        />
      )}
      <Input
        id={id}
        label={label}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hint="Opcional · PNG, JPG ou WebP de até 2 MB."
        error={error}
        onChange={(event) => {
          void choose(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      {value && (
        <Button type="button" $variant="danger" onClick={() => onChange('')}>
          Remover imagem
        </Button>
      )}
    </div>
  );
}
