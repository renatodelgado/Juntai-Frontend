import type { Errors, FieldName, StartupDraft } from './types';
import type { StepId } from '../data/steps';
import {
  supportedSegment,
  supportedModel,
} from '../../../shared/config/registrationCatalogs';

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const url = new URL(
    /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`,
  );
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    !url.hostname.includes('.') ||
    url.username ||
    url.password
  ) {
    throw new Error('Use um endereço válido, como https://sua-startup.com.br.');
  }
  return url.href;
}

export function validateStep(step: StepId, data: StartupDraft): Errors {
  const errors: Errors = {};
  function requireFields(...fields: FieldName[]) {
    fields.forEach((field) => {
      const value = data[field];
      if (
        value === null ||
        value === false ||
        (typeof value === 'string' && !value.trim()) ||
        (Array.isArray(value) && !value.length)
      ) {
        errors[field] = Array.isArray(value)
          ? 'Escolha ao menos uma opção'
          : 'Campo obrigatório';
      }
    });
  }
  function maxLength(field: FieldName, max: number) {
    const value = data[field];
    if (typeof value === 'string' && value.length > max)
      errors[field] = `Use até ${max} caracteres.`;
  }
  function checkUrl(field: 'website' | 'linkedin' | 'instagram' | 'videoUrl') {
    try {
      normalizeUrl(data[field]);
    } catch {
      errors[field] = 'Confira o link. Exemplo: https://sua-startup.com.br.';
    }
  }

  switch (step) {
    case 'about':
      requireFields('ownerName', 'name', 'description');
      maxLength('ownerName', 150);
      maxLength('name', 120);
      maxLength('publicName', 120);
      maxLength('description', 280);
      checkUrl('website');
      checkUrl('linkedin');
      checkUrl('instagram');
      for (const link of data.otherLinks) {
        try {
          if (!link.url.trim()) throw new Error();
          normalizeUrl(link.url);
        } catch {
          errors.otherLinks =
            'Confira os links adicionais ou remova os que ficaram vazios.';
        }
      }
      break;
    case 'business':
      requireFields('segment', 'stage');
      if (data.segment && !supportedSegment(data.segment))
        errors.segment =
          'Este segmento ainda não é aceito pelo servidor. Escolha uma opção da lista.';
      if (data.secondarySegments.includes(data.segment))
        errors.secondarySegments =
          'A categoria principal já está selecionada. Escolha outras categorias secundárias.';
      if (data.secondarySegments.length > 3)
        errors.secondarySegments = 'Escolha até 3 categorias secundárias.';
      break;
    case 'market':
      requireFields('businessModels', 'targetMarket', 'problem', 'solution');
      if (
        data.businessModels.length > 1 &&
        !data.businessModels.includes(data.primaryModel)
      )
        errors.primaryModel = 'Escolha o modelo principal.';
      if (data.businessModels.some((value) => !supportedModel(value)))
        errors.businessModels =
          'Remova os modelos ainda não aceitos pelo servidor.';
      ['targetMarket', 'problem', 'solution'].forEach((key) =>
        maxLength(key as FieldName, 1500),
      );
      maxLength('targetMarket', 200);
      break;
    case 'location':
      requireFields('state', 'cityId', 'registrationRegion', 'targetRegions');
      if (data.cityId && (!/^\d{7}$/.test(data.cityId) || !data.cityName))
        errors.cityId = 'Selecione uma cidade da lista.';
      break;
    case 'traction':
      requireFields('revenue', 'exactTeamSize');
      if (
        data.exactTeamSize !== null &&
        (!Number.isInteger(data.exactTeamSize) ||
          data.exactTeamSize < 1 ||
          data.exactTeamSize > 32767)
      )
        errors.exactTeamSize = 'Informe um número inteiro entre 1 e 32.767.';
      if (
        data.monthlyRevenue !== null &&
        (data.monthlyRevenue < 0 || data.monthlyRevenue > 999999999999.99)
      )
        errors.monthlyRevenue = 'Informe um faturamento válido.';
      if (
        !data.hideCustomers &&
        data.customers !== null &&
        (!Number.isSafeInteger(data.customers) || data.customers < 0)
      )
        errors.customers = 'Use um número inteiro igual ou maior que zero.';
      if (data.growthPercent !== null) {
        requireFields('growthPeriod', 'growthMetric');
        if (data.growthPercent < -100 || data.growthPercent > 100000)
          errors.growthPercent = 'Informe um percentual entre -100 e 100.000.';
      }
      maxLength('growthNotes', 1000);
      break;
    case 'investment':
      requireFields('needs');
      {
        requireFields('capital', 'investmentPurposes');
        if (data.capital !== null && (data.capital <= 0 || data.capital > 1e12))
          errors.capital =
            'Informe um valor maior que zero e de até R$ 1 trilhão.';
      }
      requireFields('partnerType', 'expertise');
      maxLength('preferences', 1500);
      break;
    case 'pitch':
      checkUrl('videoUrl');
      maxLength('pitchText', 5000);
      if (Object.values(data.canvas).some((value) => value.length > 1500))
        errors.canvas = 'Use até 1.500 caracteres em cada bloco do Canvas.';
      break;
    case 'consent':
      requireFields('termsAccepted', 'privacyAcknowledged');
      break;
  }
  return errors;
}

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export function validateAttachment(file: File): string | null {
  if (!/\.(pdf|ppt|pptx)$/i.test(file.name))
    return 'Escolha uma apresentação em PDF, PPT ou PPTX.';
  if (file.size === 0)
    return 'Esse arquivo está vazio. Escolha outra apresentação.';
  if (file.size > MAX_ATTACHMENT_BYTES) return 'O arquivo deve ter até 10 MB.';
  return null;
}
