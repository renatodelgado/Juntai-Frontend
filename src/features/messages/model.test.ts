import { describe, expect, it } from 'vitest';
import { demoMessagesRepository, filterConversations } from './model';

const user = {
  id: 'sol-user',
  nome: 'SolNexo',
  email: 'solnexo.teste.2109@example.com',
  tipoPerfil: 'startup' as const,
};
describe('conversas de demonstração', () => {
  it('limita os dados às contas demonstrativas e ao papel correto', async () => {
    expect(
      await demoMessagesRepository.list({
        ...user,
        email: 'outra@example.com',
      }),
    ).toEqual([]);
    expect(
      await demoMessagesRepository.list({ ...user, tipoPerfil: 'investidor' }),
    ).toEqual([]);
    expect(
      await demoMessagesRepository.list({ ...user, tipoPerfil: 'admin' }),
    ).toEqual([]);
    const items = await demoMessagesRepository.list(user);
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.participant.type === 'investor')).toBe(
      true,
    );
  });
  it('busca nomes e segmentos sem distinguir acentos e filtra não lidas', async () => {
    const items = await demoMessagesRepository.list(user);
    expect(filterConversations(items, ' CAMILA ', 'all')).toHaveLength(1);
    expect(
      filterConversations(items, 'tecnologia', 'all')[0]!.participant.name,
    ).toBe('Bruno Almeida');
    expect(filterConversations(items, '', 'unread')).toHaveLength(1);
    expect(filterConversations(items, '', 'mentor')).toEqual([]);
  });
});
