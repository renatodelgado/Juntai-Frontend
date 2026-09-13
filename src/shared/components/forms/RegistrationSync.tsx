import { useContext, useId, type ReactNode } from 'react';
import styled from 'styled-components';
import {
  RegistrationSyncContext,
  registrationSyncNote,
  type SyncScope,
} from './registrationSyncStatus';

const Frame = styled.div<{ $partial: boolean; $marked: boolean }>`
  display: ${({ $marked }) => ($marked ? 'block' : 'contents')};
  min-width: 0;
  border: 1px dashed ${({ $partial }) => ($partial ? '#346b92' : '#9a6700')};
  border-radius: 12px;
  padding: 0.85rem;
  background: ${({ $partial }) => ($partial ? '#f4f9fd' : '#fffcf4')};
`;
const Comment = styled.p<{ $partial: boolean }>`
  margin: 0.65rem 0 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: ${({ $partial }) => ($partial ? '#275676' : '#785000')};
`;
export function RegistrationSyncScope({
  role,
  data,
  children,
}: SyncScope & { children: ReactNode }) {
  return (
    <RegistrationSyncContext.Provider value={{ role, data }}>
      {children}
    </RegistrationSyncContext.Provider>
  );
}
export function FieldSync({
  field,
  children,
}: {
  field: string;
  children: ReactNode;
}) {
  const scope = useContext(RegistrationSyncContext);
  const id = useId();
  const note = registrationSyncNote(scope, field);
  return (
    <Frame
      $marked={!!note}
      $partial={note?.kind === 'partial'}
      data-sync={note?.kind}
      role={note ? 'group' : undefined}
      aria-describedby={note ? id : undefined}
    >
      {children}
      {note && (
        <Comment id={id} $partial={note.kind === 'partial'}>
          <strong>
            {note.kind === 'partial'
              ? 'Envio parcial.'
              : 'Não enviado ao backend.'}
          </strong>{' '}
          {note.text}
        </Comment>
      )}
    </Frame>
  );
}
export function SyncLegend() {
  return (
    <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
      <strong style={{ color: '#785000' }}>Borda tracejada amarela:</strong>{' '}
      informação não enviada ao backend.{' '}
      <strong style={{ color: '#275676' }}>Azul:</strong> envio parcial. O
      comentário abaixo explica cada caso.
    </p>
  );
}
