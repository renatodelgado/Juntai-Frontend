import { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  UsersThreeIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
import { Input, Textarea } from '@/shared/components/forms/Fields';
import { ErrorText } from '@/shared/components/forms/styles';
import { Upload } from '@/shared/components/forms/Upload';
import { Button } from '@/shared/components/ui/Button';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import type { OnboardingController } from '../hooks/useOnboarding';
import { bindFields } from './fields';
import { canvasFields } from '../data/catalogs';
import {
  Fields,
  Columns,
  CanvasGrid,
  CanvasTile,
  SubCard,
  Notice,
} from '../pages/Onboarding.styles';
import type { TeamMember } from '../model/types';

export function PitchStep({ form }: { form: OnboardingController }) {
  const fields = bindFields(form);
  const [editor, setEditor] = useState<{
    field: (typeof canvasFields)[number];
    text: string;
  } | null>(null);
  async function closeEditor() {
    if (!editor || form.busy) return;
    const canvas = { ...form.data.canvas, [editor.field.value]: editor.text };
    form.update('canvas', canvas);
    await form.save(false, { ...form.data, canvas });
    setEditor(null);
  }
  return (
    <Fields>
      {fields.textarea('pitchText', 'Seu pitch', {
        maxLength: 5000,
        rows: 6,
        placeholder:
          'Qual é a sua ideia, por que ela importa e onde vocês querem chegar?',
      })}
      <Upload
        id="attachment"
        file={form.attachment}
        error={form.attachmentError}
        onChange={form.changeAttachment}
        onRemove={() => form.changeAttachment(null)}
      />
      {fields.input('videoUrl', 'Link do vídeo de apresentação', {
        type: 'url',
        placeholder: 'https://youtube.com/…',
        hint: 'Use um link acessível. O vídeo não será enviado ao Juntaí! nesta etapa.',
      })}
      <section aria-labelledby="canvas-title">
        <h2 id="canvas-title">Seu modelo de negócio, em um Canvas</h2>
        <p>
          Abra um bloco para escrever com calma. Ao fechar, o texto fica salvo e
          o bloco aparece como preenchido.
        </p>
        <CanvasGrid>
          {canvasFields.map((field) => (
            <div key={field.value}>
              <CanvasTile
                type="button"
                aria-label={`${form.data.canvas[field.value].trim() ? 'Editar' : 'Preencher'} ${field.label}`}
                onClick={() =>
                  setEditor({ field, text: form.data.canvas[field.value] })
                }
              >
                <strong>{field.label}</strong>
                <span>
                  {form.data.canvas[field.value].trim() || field.hint}
                </span>
                <small>
                  {form.data.canvas[field.value].trim() ? (
                    <>
                      <CheckCircleIcon size={18} aria-hidden="true" />
                      Preenchido
                    </>
                  ) : (
                    <>
                      <PlusIcon size={18} aria-hidden="true" />
                      Adicionar
                    </>
                  )}
                </small>
              </CanvasTile>
            </div>
          ))}
        </CanvasGrid>
        {form.errors.canvas && <ErrorText>{form.errors.canvas}</ErrorText>}
      </section>
      <ContentDialog
        open={editor !== null}
        title={editor?.field.label ?? 'Editar Canvas'}
        closeLabel="Salvar e fechar"
        busy={form.busy}
        onClose={() => void closeEditor()}
      >
        {editor && (
          <Fields>
            <Textarea
              id={`canvas-${editor.field.value}`}
              label={editor.field.label}
              placeholder={editor.field.hint}
              maxLength={1500}
              rows={10}
              autoFocus
              value={editor.text}
              onChange={(event) =>
                setEditor({ ...editor, text: event.target.value })
              }
            />
            <p>
              Ao fechar, este bloco e seu rascunho são salvos neste navegador.
            </p>
          </Fields>
        )}
      </ContentDialog>
    </Fields>
  );
}

export function TeamStep({ form }: { form: OnboardingController }) {
  function updateMember(id: string, field: keyof TeamMember, value: string) {
    form.update(
      'members',
      form.data.members.map((member) =>
        member.id === id ? { ...member, [field]: value } : member,
      ),
    );
  }
  return (
    <Fields>
      {!form.data.members.length && (
        <Notice>
          <UsersThreeIcon size={28} aria-hidden="true" />
          <p>
            Uma pessoa também faz uma equipe. Adicione você e os demais
            integrantes, ou continue para completar depois.
          </p>
        </Notice>
      )}
      {form.data.members.map((member, index) => (
        <SubCard key={member.id} aria-labelledby={`member-title-${member.id}`}>
          <header>
            <h2 id={`member-title-${member.id}`}>Integrante {index + 1}</h2>
            <Button
              type="button"
              $variant="quiet"
              aria-label={`Remover integrante ${index + 1}`}
              onClick={() =>
                form.update(
                  'members',
                  form.data.members.filter((item) => item.id !== member.id),
                )
              }
            >
              <TrashIcon size={20} aria-hidden="true" />
              Remover
            </Button>
          </header>
          <Fields>
            <Columns>
              <Input
                id={`member-${member.id}`}
                label="Nome"
                required
                maxLength={120}
                value={member.name}
                error={form.errors[`member-${member.id}`]}
                onChange={(event) =>
                  updateMember(member.id, 'name', event.target.value)
                }
              />
              <Input
                id={`role-${member.id}`}
                label="Cargo/função"
                required
                maxLength={120}
                value={member.role}
                onChange={(event) =>
                  updateMember(member.id, 'role', event.target.value)
                }
              />
            </Columns>
            <Textarea
              id={`bio-${member.id}`}
              label="Breve descrição"
              maxLength={600}
              value={member.bio}
              onChange={(event) =>
                updateMember(member.id, 'bio', event.target.value)
              }
            />
            <Input
              id={`linkedin-${member.id}`}
              label="LinkedIn"
              type="url"
              value={member.linkedin}
              onChange={(event) =>
                updateMember(member.id, 'linkedin', event.target.value)
              }
            />
          </Fields>
        </SubCard>
      ))}
      <div>
        <Button
          type="button"
          $variant="secondary"
          disabled={form.data.members.length >= 30}
          onClick={() =>
            form.update('members', [
              ...form.data.members,
              {
                id: crypto.randomUUID(),
                name: '',
                role: '',
                bio: '',
                linkedin: '',
              },
            ])
          }
        >
          <PlusIcon size={20} aria-hidden="true" />
          Adicionar integrante
        </Button>
      </div>
    </Fields>
  );
}
