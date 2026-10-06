// Um único cenário integrado, sem respostas falsas de autenticação ou negócio.
// Cada execução cria duas startups próprias. Contas existentes só fazem login.
// O chat é aberto, mas nenhuma mensagem é enviada para outra pessoa.
export {};

type Account = { email: string; password: string };
type StartupRecord = {
  id: string;
  nomeFantasia: string;
  segmento: string;
  modeloNegocio: string;
  statusModeracao: string;
};

describe('Juntaí! — cadastro, moderação, descoberta e conversa reais', () => {
  it('percorre o caminho feliz e verifica as restrições implementadas', () => {
    // Identificação exclusiva evita depender dos nomes e interesses já no banco.
    // Sem retries: repetir automaticamente criaria mais contas no servidor.
    const run = `${Date.now()}-${Cypress._.random(1000, 9999)}`;
    const name = `Cypress Fintech ${run}`;
    const rejectedName = `Cypress Rejeitada ${run}`;
    const startup: Account = {
      email: `cypress.startup.${run}@example.com`,
      password: `Cypress!${run}`,
    };
    const rejected: Account = {
      email: `cypress.rejeitada.${run}@example.com`,
      password: `Cypress!${run}`,
    };
    const reason = `Cadastro fictício rejeitado na demonstração ${run}`;
    let api = '';
    let admin: Account;
    let investor: Account;
    let startupId = '';
    let rejectedId = '';
    let investorToken = '';
    let adminToken = '';
    let approved: StartupRecord[] = [];
    let presentationUrl = '';

    // Helpers apenas organizam o mesmo teste, sem criar testes separados.
    // A troca de usuário remove somente a sessão, preservando os demais dados.
    function login(account: Account, role: 'startup' | 'investidor' | 'admin') {
      cy.visit('/login', {
        onBeforeLoad(win) {
          win.localStorage.removeItem('juntai:auth-session');
          win.sessionStorage.removeItem('juntai:auth-session');
        },
      });
      cy.get('#email').type(account.email, { log: false });
      cy.get('#password').type(account.password, { log: false });
      cy.contains('button', /^Entrar$/).click();
      cy.location('pathname').should(
        'eq',
        role === 'admin' ? '/admin' : `/${role}/inicio`,
      );
    }

    // O token vem do login real, nunca de uma sessão inventada no armazenamento.
    function token(use: (value: string) => void) {
      cy.window({ log: false }).then((win) => {
        const raw = win.localStorage.getItem('juntai:auth-session');
        if (!raw) throw new Error('O login não criou uma sessão.');
        use((JSON.parse(raw) as { token: string }).token);
      });
    }

    // GETs independentes consultam o estado atual persistido pela API.
    // Respostas e cabeçalhos autenticados não entram no Command Log.
    function request(path: string, auth: string) {
      return cy.request({
        url: `${api}/${path}`,
        headers: { Authorization: `Bearer ${auth}` },
        log: false,
        failOnStatusCode: false,
      });
    }

    // A submissão usa o botão da etapa e espera o título da etapa seguinte.
    function next(title: string) {
      cy.get('button[type="submit"]').click();
      cy.contains('h1', title).should('be.visible');
    }

    // A busca navega ao atualizar a URL. Esperar essa condição por caractere
    // evita que uma nova tecla concorra com a navegação anterior, sem pausas fixas.
    function search(value: string) {
      const field = 'input[aria-label="Buscar startups"]';
      cy.get(field).clear();
      cy.location('search').should((query) => {
        expect(new URLSearchParams(query).get('q') || '').to.eq('');
      });
      [...value].forEach((character, index) => {
        const expected = value.slice(0, index + 1);
        cy.get(field).type(character);
        cy.location('search').should((query) => {
          expect(new URLSearchParams(query).get('q')).to.eq(expected);
        });
        cy.get(field).should('have.value', expected);
      });
    }

    // A decisão acontece pela interface e exclusivamente na linha da conta criada.
    function decide(label: string, decision: 'Aprovar' | 'Rejeitar') {
      cy.visit('/admin/cadastros');
      cy.get('input[placeholder="Nome ou e-mail"]').type(label);
      cy.contains('tbody tr', label).within(() => {
        cy.contains('button', decision).click();
      });
      cy.get('dialog[open]').within(() => {
        if (decision === 'Rejeitar') cy.get('textarea').type(reason);
        cy.contains(
          'button',
          decision === 'Aprovar' ? 'Confirmar aprovação' : 'Confirmar rejeição',
        ).click();
      });
      cy.get('dialog[open]').should('not.exist');
      cy.contains(
        decision === 'Aprovar' ? 'Cadastro aprovado.' : 'Cadastro rejeitado.',
      ).should('be.visible');
    }

    // Credenciais são lidas pela API assíncrona do Cypress 16.
    // Falta de configuração causa falha explícita antes de cadastrar qualquer dado.
    cy.env([
      'API_URL',
      'ADMIN_EMAIL',
      'ADMIN_PASSWORD',
      'INVESTOR_EMAIL',
      'INVESTOR_PASSWORD',
    ]).then((settings) => {
      for (const key of [
        'API_URL',
        'ADMIN_EMAIL',
        'ADMIN_PASSWORD',
        'INVESTOR_EMAIL',
        'INVESTOR_PASSWORD',
      ]) {
        if (typeof settings[key] !== 'string' || !settings[key])
          throw new Error(`Configure ${key} em cypress.env.json.`);
      }
      api = String(settings.API_URL).replace(/\/$/, '');
      admin = {
        email: String(settings.ADMIN_EMAIL),
        password: String(settings.ADMIN_PASSWORD),
      };
      investor = {
        email: String(settings.INVESTOR_EMAIL),
        password: String(settings.INVESTOR_PASSWORD),
      };
    });

    // A primeira tela valida campos realmente obrigatórios: responsável e nome.
    // O browser do Cypress é isolado do navegador pessoal do apresentador.
    cy.visit('/cadastro/startup');
    cy.contains('h1', 'Vamos começar pela sua startup').should('be.visible');
    cy.get('button[type="submit"]').click();
    cy.get('#ownerName').should('have.attr', 'aria-invalid', 'true');
    cy.get('#name').should('have.attr', 'aria-invalid', 'true');
    cy.contains('Campo obrigatório').should('be.visible');
    cy.screenshot('01-validacao-obrigatorios', { capture: 'viewport' });
    cy.get('#ownerName').type('Responsável fictício Cypress');
    cy.get('#name').type(name);
    cy.get('#description').type(
      'Gestão financeira B2B para pequenas empresas.',
    );
    next('Onde sua startup está hoje?');

    // Fintech, MVP e B2B são opções aceitas pelo contrato atual do cadastro.
    cy.get('#segment').select('fintech');
    cy.get('input[name="stage"][value="mvp"]').check();
    next('Como o seu negócio funciona?');
    cy.get('#primaryModel').select('b2b');
    cy.get('#targetMarket').type('Pequenas empresas brasileiras');
    cy.get('#problem').type('Falta de controle financeiro integrado.');
    cy.get('#solution').type('Painel financeiro para empresas.');
    next('Onde vocês estão e onde querem chegar?');

    // O município vem da consulta real ao IBGE usada pelo formulário.
    // Nenhuma resposta de cidade, cadastro ou aprovação é substituída no teste.
    cy.get('#state').select('CE');
    cy.get('#cityId').should('not.be.disabled').select('Fortaleza');
    cy.get('input[name="operatingRegions"][value="northeast"]').check();
    cy.get('input[name="targetRegions"][value="northeast"]').check();
    next('Como o negócio está performando?');

    // Faturamento mensal é opcional. Equipe é obrigatória no formulário atual.
    // Primeiro validamos a equipe vazia e depois preenchemos números verificáveis.
    cy.get('button[type="submit"]').click();
    cy.get('#exactTeamSize').should('have.attr', 'aria-invalid', 'true');
    cy.get('#monthlyRevenue').type('12500');
    cy.get('#customers').type('20');
    cy.get('#exactTeamSize').type('3');
    next('O que vocês estão buscando?');
    cy.get('#capital').type('100000');
    cy.get('input[name="investmentPurposes"][value="product"]').check();
    cy.get('input[name="needs"][value="mentoring"]').check();
    next('Agora conte a história da sua startup');

    // Arquivo inválido deve gerar erro. O PDF de teste substitui esse arquivo.
    // A apresentação é opcional no produto, mas seu upload faz parte deste cenário.
    cy.get('#attachment').selectFile({
      contents: Cypress.Buffer.from('arquivo inválido'),
      fileName: 'invalido.txt',
      mimeType: 'text/plain',
    });
    cy.contains('Escolha uma apresentação em PDF, PPT ou PPTX.').should(
      'be.visible',
    );
    cy.get('#attachment').selectFile('cypress/fixtures/pitch-cypress.pdf');
    cy.contains('pitch-cypress.pdf').should('be.visible');
    cy.get('#pitchText').type(
      'Solução fictícia de controle financeiro para empresas.',
    );
    next('Confira seu perfil antes de entrar no Juntaí!');
    cy.contains('dd', name).should('be.visible');
    next('Crie seu acesso ao Juntaí!');
    cy.get('#termsAccepted').check();
    cy.get('#privacyAcknowledged').check();
    cy.get('#account-email').type(startup.email, { log: false });
    cy.get('#account-password').type(startup.password, { log: false });
    cy.get('#account-confirm').type(startup.password, { log: false });

    // Intercepts apenas observam requisições reais. Cadastro e upload devem passar.
    cy.intercept('POST', '**/startups').as('registration');
    cy.intercept('POST', '**/uploads/startup/apresentacao').as('upload');
    cy.contains('button', 'Enviar cadastro').click();
    cy.wait('@registration').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      startupId = String(response?.body.id);
      expect(response?.body.statusModeracao).to.eq('pendente');
    });
    cy.wait('@upload', { responseTimeout: 90000 }).then(({ response }) => {
      expect(response?.statusCode).to.be.oneOf([200, 201]);
      presentationUrl = String(response?.body.url);
      expect(presentationUrl).to.match(/^https:\/\//);
    });
    cy.contains('h1', 'Startup cadastrada!', { timeout: 90000 }).should(
      'be.visible',
    );

    // Login da nova startup confirma pendência e os campos salvos no backend.
    cy.then(() => login(startup, 'startup'));
    cy.contains('h2', 'Seu perfil está em avaliação').should('be.visible');
    token((value) => {
      request('auth/profile', value).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.statusModeracao).to.eq('pendente');
        expect(Number(body.faturamentoMensal)).to.eq(12500);
        expect(Number(body.numeroClientes)).to.eq(20);
        expect(body.modeloNegocio).to.eq('b2b');
        expect(body.apresentacaoUrl).to.eq(presentationUrl);
      });
    });
    cy.screenshot('02-startup-pendente', { capture: 'viewport' });

    // A segunda startup prepara somente o ramo de rejeição via cadastro público.
    // O cadastro principal, acima, percorre todas as etapas da interface.
    cy.then(() => {
      cy.request({
        method: 'POST',
        url: `${api}/startups`,
        log: false,
        failOnStatusCode: false,
        body: {
          nome: 'Responsável fictício para rejeição',
          email: rejected.email,
          senha: rejected.password,
          nomeFantasia: rejectedName,
          segmento: 'fintech',
          estagio: 'mvp',
          modeloNegocio: 'b2b',
          descricaoCurta: 'Cadastro auxiliar da demonstração Cypress.',
          mercadoAlvo: 'Empresas',
          estado: 'CE',
          cidade: 'Fortaleza',
          regioesAtuacao: ['nordeste'],
          regioesCrescimento: ['nordeste'],
          buscaInvestimento: true,
          capitalProcurado: 100000,
          finalidadeInvestimento: 'Desenvolvimento de produto',
          necessidadesAdicionais: ['mentoria'],
        },
      }).then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.statusModeracao).to.eq('pendente');
        rejectedId = String(body.id);
      });
    });

    // Investidor existente e aprovado não deve descobrir startups pendentes.
    cy.then(() => login(investor, 'investidor'));
    token((value) => {
      investorToken = value;
    });
    cy.then(() => request('auth/profile', investorToken)).then(
      ({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.statusModeracao, 'Investidor precisa estar aprovado').to.eq(
          'aprovado',
        );
      },
    );
    // pathname exato evita capturar também o documento /investidor/startups.
    cy.intercept({ method: 'GET', pathname: '/startups' }).as('discovery');
    cy.visit('/investidor/startups');
    cy.wait('@discovery').then(({ response }) => {
      expect(response?.statusCode).to.eq(200);
      expect(response?.body).to.be.an('array');
      const ids = (response?.body as StartupRecord[]).map((item) => item.id);
      expect(ids).not.to.include(startupId);
      expect(ids).not.to.include(rejectedId);
    });
    search(run);
    cy.contains('h2', 'Nenhuma startup encontrada').should('be.visible');
    cy.screenshot('03-pendente-fora-da-busca', { capture: 'viewport' });

    // Administrador modera somente as duas startups desta execução.
    cy.then(() => login(admin, 'admin'));
    token((value) => {
      adminToken = value;
    });
    cy.then(() => decide(name, 'Aprovar'));
    cy.screenshot('04-aprovacao', { capture: 'viewport' });
    cy.then(() => decide(rejectedName, 'Rejeitar'));
    cy.screenshot('05-rejeicao', { capture: 'viewport' });

    // A interface mostra a tradução atual de rejeitado: Precisa de ajustes.
    // O motivo não aparece para a startup hoje, por isso é validado na auditoria.
    cy.then(() => login(rejected, 'startup'));
    cy.contains('h2', 'Precisamos de alguns ajustes').should('be.visible');
    cy.contains('span', 'Precisa de ajustes').should('be.visible');
    token((value) => {
      request('auth/profile', value).then(({ body }) => {
        expect(body.statusModeracao).to.eq('rejeitado');
      });
    });
    cy.then(() =>
      request(`admin/cadastros/startup/${rejectedId}`, adminToken),
    ).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(
        body.historico.some(
          (entry: { detalhes: { motivo?: string } }) =>
            entry.detalhes?.motivo === reason,
        ),
      ).to.eq(true);
    });

    // Snapshot da resposta real fornece a referência para a igualdade dos filtros.
    // A comparação usa IDs, incluindo as startups que já existiam no banco.
    cy.then(() => login(investor, 'investidor'));
    cy.intercept({ method: 'GET', pathname: '/startups' }).as(
      'approvedDiscovery',
    );
    cy.visit('/investidor/startups');
    cy.wait('@approvedDiscovery').then(({ response }) => {
      expect(response?.statusCode).to.eq(200);
      expect(response?.body).to.be.an('array');
      approved = response?.body as StartupRecord[];
      expect(
        approved.every((item) => item.statusModeracao === 'aprovado'),
      ).to.eq(true);
      expect(approved.map((item) => item.id)).to.include(startupId);
      expect(approved.map((item) => item.id)).not.to.include(rejectedId);
    });
    cy.get('select[aria-label="Todos os segmentos"]').select('Fintech');
    // Filtros também navegam. Cada próximo controle espera a seleção aplicada.
    cy.location('search').should((query) => {
      expect(new URLSearchParams(query).get('segment')).to.eq('Fintech');
    });
    cy.get('select[aria-label="Todos os segmentos"]').should(
      'have.value',
      'Fintech',
    );
    cy.get('select[aria-label="Modelo de negócio"]').select('B2B');
    cy.location('search').should((query) => {
      const params = new URLSearchParams(query);
      expect(params.get('segment')).to.eq('Fintech');
      expect(params.get('model')).to.eq('B2B');
    });
    cy.get('select[aria-label="Modelo de negócio"]').should(
      'have.value',
      'B2B',
    );
    cy.get('button[aria-label="Visualização em lista"]').click();
    cy.location('search').should((query) => {
      const params = new URLSearchParams(query);
      expect(params.get('segment')).to.eq('Fintech');
      expect(params.get('model')).to.eq('B2B');
      expect(params.get('view')).to.eq('list');
    });
    cy.then(() => {
      const expected = approved
        .filter(
          (item) => item.segmento === 'fintech' && item.modeloNegocio === 'b2b',
        )
        .map((item) => item.id)
        .sort();
      cy.get<HTMLAnchorElement>('article a[href^="/startups/"]').should(
        ($links) => {
          const actual = [...$links]
            .map((link) => new URL(link.href).pathname.split('/').at(-1))
            .sort();
          expect(actual).to.deep.eq(expected);
        },
      );
    });
    search(run);
    cy.contains('h3', name).should('be.visible');
    cy.screenshot('06-filtro-fintech-b2b', { capture: 'viewport' });

    // Salvar é uma função local existente. Não equivale a interesse no banco.
    cy.get(`button[aria-label="Salvar ${name}"]`).click();
    cy.get(`button[aria-label="Remover ${name}"]`).should(
      'have.attr',
      'aria-pressed',
      'true',
    );
    cy.contains('h3', name)
      .closest('article')
      .within(() => {
        cy.contains('a', 'Ver startup').click();
      });
    cy.then(() =>
      cy.location('pathname').should('eq', `/startups/${startupId}`),
    );
    cy.contains('h1', name).should('be.visible');
    cy.contains('a', 'Abrir apresentação')
      .should('have.attr', 'href')
      .then((href) => {
        expect(href).to.eq(presentationUrl);
      });

    // Antes do interesse, o perfil esconde Enviar mensagem e bloqueia a reunião.
    // A URL direta da conversa também deve bloquear o compositor, sem interesse.
    cy.contains('button', /^Tenho interesse$/).should('be.enabled');
    cy.contains('a', 'Enviar mensagem').should('not.exist');
    cy.contains('button', 'Agendar reunião').should('be.disabled');
    cy.screenshot('07-contato-bloqueado', { capture: 'viewport' });
    cy.then(() => cy.visit(`/investidor/mensagens?startup=${startupId}`));
    cy.contains(
      'Confirme o interesse em uma startup aprovada antes de iniciar a conversa.',
    ).should('be.visible');
    cy.get('textarea[aria-label="Mensagem"]').should('not.exist');
    cy.then(() => cy.visit(`/startups/${startupId}`));
    cy.contains('h1', name).should('be.visible');

    // Interesse confirmado pela interface grava o evento real no backend.
    cy.intercept('POST', '**/startups/*/interesse').as('interest');
    cy.contains('button', /^Tenho interesse$/).click();
    cy.get('dialog[open]').within(() => {
      cy.contains('button', 'Confirmar interesse').click();
    });
    cy.wait('@interest').then(({ response }) => {
      expect(response?.statusCode).to.eq(200);
      expect(response?.body.startupId).to.eq(startupId);
    });
    cy.get('dialog[open]').within(() => {
      cy.contains('h2', 'Interesse confirmado').should('be.visible');
      cy.contains('button', 'Iniciar conversa').should('be.enabled');
    });
    cy.screenshot('08-interesse-confirmado', { capture: 'viewport' });

    // O rótulo atual para entrar em contato é Iniciar conversa no modal.
    // Abrimos o chat e verificamos o destinatário, sem enviar mensagem real.
    cy.get('dialog[open]').within(() => {
      cy.contains('button', 'Iniciar conversa').click();
    });
    cy.location('pathname').should('eq', '/investidor/mensagens');
    cy.contains('h2', name).should('be.visible');
    cy.get('textarea[aria-label="Mensagem"]').should('be.enabled');
    cy.get('button[aria-label="Enviar mensagem"]').should('be.disabled');
    cy.screenshot('09-chat-aberto', { capture: 'viewport' });

    // Recarga confirma que o interesse persiste na API e aparece em Matches.
    cy.reload();
    cy.get('textarea[aria-label="Mensagem"]').should('be.enabled');
    cy.visit('/investidor/matches');
    cy.contains('h1', 'Seus matches').should('be.visible');
    cy.get(`article[aria-label="Match: ${name}"]`).should('be.visible');
    cy.then(() => request('startups/interesses', investorToken)).then(
      ({ status, body }) => {
        expect(status).to.eq(200);
        expect(
          body.some(
            (item: { startupId: string }) => item.startupId === startupId,
          ),
        ).to.eq(true);
      },
    );
    cy.screenshot('10-match-persistido', { capture: 'viewport' });

    // Manifesto contém só IDs próprios e escopo. Não contém tokens nem senhas.
    // Registros ficam preservados, pois não há endpoint de exclusão nesse fluxo.
    cy.then(() =>
      cy.writeFile('cypress/artifacts/ultima-execucao-real.json', {
        run,
        startupId,
        rejectedId,
        name,
        rejectedName,
        scope:
          'API real, cadastro UI, upload, moderação, filtros, interesse e chat aberto',
        messageSent: false,
      }),
    );
  });
});
