const investor = {
  id: 'cypress-investidor-demo',
  nome: 'Investidor Demonstração',
  email: 'demo.cypress@example.com',
  tipoPerfil: 'investidor',
};

describe('Juntaí! — da exploração ao match', () => {
  it('registra o interesse e mantém o match após recarregar', () => {
    // A autenticação é controlada; não exige conta ou backend reais.
    cy.intercept('GET', '**/auth/me', { body: investor }).as('session');
    cy.visit('/investidor/startups', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.sessionStorage.clear();
        win.localStorage.setItem(
          'juntai:auth-session',
          JSON.stringify({
            token: 'cypress-session-ficticia',
            usuario: investor,
          }),
        );
      },
    });
    cy.wait('@session');
    cy.contains('h1', 'Explorar startups').should('be.visible');
    cy.contains('h3', 'AgroPonte Digital').should('be.visible');

    cy.get('input[aria-label="Buscar startups"]').type('solar');
    cy.get('select[aria-label="Localização"]').select('CE');
    cy.contains('h3', 'SolNexo Energia').should('be.visible');
    cy.contains('h3', 'AgroPonte Digital').should('not.exist');
    cy.screenshot('01-busca-solar');

    cy.contains('a', 'Ver startup').click();
    cy.location('pathname').should('eq', '/startups/solnexo');
    cy.contains('h1', 'SolNexo Energia').should('be.visible');
    cy.contains('button', /^Tenho interesse$/).click();
    cy.get('dialog[open]').within(() => {
      cy.contains('button', 'Confirmar interesse').click();
    });
    cy.contains('button', /^Interesse enviado$/).should('be.disabled');
    cy.screenshot('02-interesse-confirmado');

    cy.get('nav[aria-label="Navegação do perfil"]').within(() => {
      cy.contains('a', /^Matches$/).click();
    });
    cy.location('pathname').should('eq', '/investidor/matches');
    cy.contains('h1', 'Seus matches').should('be.visible');
    cy.get('article[aria-label="Match: SolNexo Energia"]').should('be.visible');
    cy.get('article[aria-label="Match: AgroPonte Digital"]').should(
      'not.exist',
    );

    cy.reload();
    cy.get('article[aria-label="Match: SolNexo Energia"]').within(() => {
      cy.contains('button', 'Interesse enviado').should('be.disabled');
    });
    cy.screenshot('03-match-persistido');
  });
});
