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
          <strong>Você está experimentando uma prévia do cadastro.</strong> Os
          documentos abaixo são provisórios. Ao finalizar, os dados compatíveis
          do cadastro serão enviados ao servidor. Os consentimentos e as
          informações complementares ficam neste navegador.
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
        label="Concordo com os Termos de Uso desta prévia local."
      />
      <Checkbox
        id="privacyAcknowledged"
        checked={form.data.privacyAcknowledged}
        onChange={(value) => form.update('privacyAcknowledged', value)}
        error={form.errors.privacyAcknowledged}
        label="Estou ciente da Política de Privacidade e do tratamento dos meus dados para as finalidades apresentadas nesta prévia."
      />
      <Notice>
        <strong>Como pensamos em aproximar vocês dos parceiros certos</strong>
        <p>
          No futuro, segmento, estágio, regiões, necessidades e preferências
          poderão ser comparados com os interesses de investidores e mentores
          para sugerir conexões. Não há recomendação automática nem
          compartilhamento desses dados nesta prévia.
        </p>
      </Notice>
      <Checkbox
        id="matchingConsent"
        checked={form.data.matchingConsent}
        onChange={(value) => form.update('matchingConsent', value)}
        label="Quero permitir o uso dos dados do perfil para sugestões de investidores e mentores quando esse recurso estiver disponível. Nesta prévia, essa escolha é opcional e será confirmada novamente no lançamento."
      />
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
