import { ImageUpload } from '@/shared/components/forms/ImageUpload';
import type { OnboardingController } from '../hooks/useOnboarding';

export function LogoUpload({ form }: { form: OnboardingController }) {
  return (
    <ImageUpload
      id="startup-logo"
      label="Logo da startup"
      value={form.data.logo}
      onChange={(value) => form.update('logo', value)}
    />
  );
}
