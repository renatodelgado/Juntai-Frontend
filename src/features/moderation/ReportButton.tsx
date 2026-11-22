import { useState } from 'react';
import styled from 'styled-components';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import { post } from './api';
const Fields = styled.div`
  display: grid;
  gap: 1rem;
  label {
    display: grid;
    gap: 0.4rem;
  }
  input,
  textarea,
  select {
    font: inherit;
    padding: 0.6rem;
    max-width: 100%;
    border: 1px solid #999;
    border-radius: 0.4rem;
  }
  textarea {
    min-height: 6rem;
  }
`;
const fields: Record<string, Record<string, string>> = {
  startup: {
    nomeFantasia: 'Nome',
    descricaoCurta: 'Descrição curta',
    descricaoPitch: 'Pitch',
    siteUrl: 'Site',
    linksSociais: 'Redes sociais',
    videoApresentacaoUrl: 'Vídeo',
    logoUrl: 'Logo',
    apresentacaoUrl: 'Apresentação',
  },
  investidor: {
    nome: 'Nome',
    tituloProfissional: 'Título profissional',
    bio: 'Biografia',
    descricaoExperiencia: 'Experiência',
    linkedinUrl: 'LinkedIn',
    avatarUrl: 'Foto',
  },
};
export function ReportButton({
  tipo,
  id,
}: {
  tipo: 'mensagem' | 'avaliacao' | 'startup' | 'investidor';
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [campo, setCampo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  async function submit() {
    setBusy(true);
    setError('');
    try {
      await post('denuncias', {
        tipoAlvo: tipo,
        alvoId: id,
        campoAlvo: campo || null,
        motivo: motivo.trim(),
        ...(descricao.trim() ? { descricao: descricao.trim() } : {}),
      });
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Não foi possível enviar a denúncia.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Button
        type="button"
        $variant="quiet"
        onClick={() => {
          setOpen(true);
          setDone(false);
          setError('');
        }}
      >
        Denunciar
      </Button>
      <ContentDialog
        open={open}
        title="Denunciar conteúdo"
        onClose={() => setOpen(false)}
        busy={busy}
        compact
        actions={
          !done && (
            <Button
              disabled={busy || !motivo.trim()}
              onClick={() => void submit()}
            >
              {busy ? 'Enviando…' : 'Enviar denúncia'}
            </Button>
          )
        }
      >
        <Fields>
          {done ? (
            <p role="status">
              Denúncia enviada. Acompanhe em Denúncias e sanções no menu da
              conta.
            </p>
          ) : (
            <>
              {fields[tipo] && (
                <label>
                  Parte do perfil
                  <select
                    value={campo}
                    onChange={(e) => setCampo(e.target.value)}
                  >
                    <option value="">Perfil completo</option>
                    {Object.entries(fields[tipo]).map(([key, name]) => (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Motivo
                <input
                  maxLength={100}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                />
              </label>
              <label>
                Detalhes (opcional)
                <textarea
                  maxLength={2000}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </label>
              {error && <p role="alert">{error}</p>}
            </>
          )}
        </Fields>
      </ContentDialog>
    </>
  );
}
