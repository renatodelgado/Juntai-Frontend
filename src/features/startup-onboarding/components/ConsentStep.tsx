import { useState } from 'react';
import { ShieldCheckIcon } from '@phosphor-icons/react';
import { Checkbox } from '@/shared/components/forms/Fields';
import type { OnboardingController } from '../hooks/useOnboarding';
import { Fields, Notice } from '../pages/Onboarding.styles';
import { Button } from '@/shared/components/ui/Button';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { LegalDocument } from '@/features/legal/LegalPage';

export function ConsentStep({ form }: { form: OnboardingController }) {
  const [document, setDocument] = useState<'terms' | 'privacy' | null>(null);
  return (
    <Fields>
      <Notice>
        <ShieldCheckIcon size={28} aria-hidden="true" />
        <p>
          <strong>Antes de criar sua conta</strong>, conheça como o Juntaí!
          utiliza seus dados. Ao finalizar o cadastro, as informações do perfil
          serão enviadas ao servidor. Se você salvar um rascunho, ele ficará
          neste navegador. Os registros abaixo ainda não são enviados ao
          servidor.
        </p>
      </Notice>
      <div>
        <h2>Leia com calma</h2>
        <p>
          <Button
            type="button"
            $variant="quiet"
            onClick={() => setDocument('terms')}
          >
            Ler Termos de Uso
          </Button>
        </p>
        <p>
          <Button
            type="button"
            $variant="quiet"
            onClick={() => setDocument('privacy')}
          >
            Ler Política de Privacidade
          </Button>
        </p>
      </div>
      <Checkbox
        id="termsAccepted"
        checked={form.data.termsAccepted}
        onChange={(value) => form.update('termsAccepted', value)}
        error={form.errors.termsAccepted}
        label="Li e concordo com os Termos de Uso do Juntaí!."
      />
      <Checkbox
        id="privacyAcknowledged"
        checked={form.data.privacyAcknowledged}
        onChange={(value) => form.update('privacyAcknowledged', value)}
        error={form.errors.privacyAcknowledged}
        label="Li e estou ciente da Política de Privacidade e de como meus dados serão utilizados."
      />
      <Notice>
        <strong>Como aproximamos você de parceiros</strong>
        <p>
          Dados do perfil, como segmento, estágio, regiões e necessidades, são
          comparados com interesses de investidores e mentores para sugerir
          conexões. Perfis aprovados podem ser apresentados a outros usuários. A
          recomendação não garante contato ou investimento.
        </p>
      </Notice>
      <ContentDialog
        open={document !== null}
        title={
          document === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'
        }
        onClose={() => setDocument(null)}
      >
        {document && <LegalDocument document={document} />}
      </ContentDialog>
    </Fields>
  );
}
