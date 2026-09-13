import {
  supportedSegment,
  supportedModel,
} from '@/shared/config/registrationCatalogs';
import {
  InstagramLogoIcon,
  LinkedinLogoIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Input } from '@/shared/components/forms/Fields';
import { Button } from '@/shared/components/ui/Button';
import type { OnboardingController } from '../hooks/useOnboarding';
import { bindFields } from './fields';
import { LogoUpload } from './LogoUpload';
import {
  Fields,
  Columns,
  InlineRow,
  SubCard,
} from '../pages/Onboarding.styles';
import { segments, stages, businessModels } from '../data/catalogs';

export function AboutStep({ form }: { form: OnboardingController }) {
  const fields = bindFields(form);
  return (
    <Fields>
      <LogoUpload form={form} />
      {fields.input('name', 'Nome da startup', {
        required: true,
        maxLength: 120,
        autoComplete: 'organization',
        placeholder: 'Como sua startup se chama?',
      })}
      {fields.input('publicName', 'Nome fantasia / nome público', {
        maxLength: 120,
        hint: 'Preencha somente se for diferente do nome oficial.',
      })}
      {fields.textarea('description', 'Descrição curta', {
        required: true,
        maxLength: 280,
        placeholder: 'Em uma frase, o que a sua startup faz?',
      })}
      {fields.input('website', 'Site', {
        type: 'url',
        placeholder: 'https://sua-startup.com.br',
        autoComplete: 'url',
      })}
      <SubCard>
        <h2>Onde podemos conhecer vocês?</h2>
        <Fields>
          <Columns>
            {fields.input('linkedin', 'LinkedIn', {
              type: 'url',
              icon: <LinkedinLogoIcon size={22} aria-hidden="true" />,
              placeholder: 'https://linkedin.com/company/…',
            })}
            {fields.input('instagram', 'Instagram', {
              type: 'url',
              icon: <InstagramLogoIcon size={22} aria-hidden="true" />,
              placeholder: 'https://instagram.com/…',
            })}
          </Columns>
          {form.data.otherLinks.map((link, index) => (
            <InlineRow key={link.id}>
              <Input
                id={`link-${link.id}`}
                label={`Outro link ${index + 1}`}
                required
                type="url"
                icon={<LinkIcon size={20} aria-hidden="true" />}
                value={link.url}
                error={form.errors.otherLinks}
                onChange={(event) =>
                  form.update(
                    'otherLinks',
                    form.data.otherLinks.map((item) =>
                      item.id === link.id
                        ? { ...item, url: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <Button
                type="button"
                $variant="secondary"
                aria-label={`Remover link ${index + 1}`}
                onClick={() =>
                  form.update(
                    'otherLinks',
                    form.data.otherLinks.filter((item) => item.id !== link.id),
                  )
                }
              >
                <TrashIcon size={20} aria-hidden="true" />
              </Button>
            </InlineRow>
          ))}
          <div>
            <Button
              type="button"
              $variant="quiet"
              disabled={form.data.otherLinks.length >= 5}
              onClick={() =>
                form.update('otherLinks', [
                  ...form.data.otherLinks,
                  { id: crypto.randomUUID(), url: '' },
                ])
              }
            >
              <PlusIcon size={18} aria-hidden="true" />
              Adicionar outro link
            </Button>
          </div>
        </Fields>
      </SubCard>
    </Fields>
  );
}

export function BusinessStep({ form }: { form: OnboardingController }) {
  const fields = bindFields(form);
  return (
    <Fields>
      {fields.select(
        'segment',
        'Segmento principal',
        segments.filter((item) => supportedSegment(item.value)),
      )}
      {fields.multi(
        'secondarySegments',
        'Categorias secundárias',
        segments.filter((segment) => segment.value !== form.data.segment),
        false,
        'Se fizer sentido, escolha até 3 categorias complementares.',
      )}
      {fields.radio('stage', 'Estágio da startup', stages)}
    </Fields>
  );
}

export function MarketStep({ form }: { form: OnboardingController }) {
  const fields = bindFields(form);
  return (
    <Fields>
      {fields.multi(
        'businessModels',
        'Modelo de negócio',
        businessModels.filter(
          (item) =>
            supportedModel(item.value) ||
            form.data.businessModels.includes(item.value),
        ),
        true,
        'Você pode combinar o público atendido e a forma de gerar receita.',
      )}
      {fields.textarea('targetMarket', 'Quem é o cliente da sua startup?', {
        required: true,
        maxLength: 200,
        placeholder: 'Descreva o público ou mercado que vocês atendem.',
      })}
      {fields.textarea('problem', 'Qual problema sua startup resolve?', {
        required: true,
        maxLength: 1500,
      })}
      {fields.textarea('solution', 'Como vocês resolvem esse problema?', {
        required: true,
        maxLength: 1500,
      })}
    </Fields>
  );
}
