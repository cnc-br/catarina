/// <reference types="cypress" />

// -- This is a parent command --
Cypress.Commands.add(
  "login",
  (email = "admin@admin.com", password = "admin") => {
    cy.session([email, password], () => {
      cy.visit("/");
      cy.get('input[id="email"]').type(email);
      cy.get('input[id="password"]').type(password);
      cy.get("button").contains("Entrar").click();

      // Aguarda redirecionamento após login bem-sucedido
      cy.url().should("not.include", "/login");
      cy.url().should("include", "/dashboard");
    });
  }
);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Chainable<Subject = any> {
      login(email?: string, password?: string): Chainable<void>;
    }
  }
}

export {};
