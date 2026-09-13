import { useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/Button';

export function PresentationLink({ file }: { file: File }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (ref.current) ref.current.href = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <Button as="a" ref={ref} download={file.name} $variant="secondary">
      Baixar apresentação · {file.name}
    </Button>
  );
}
