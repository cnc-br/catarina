const adminUser = {
  id: "admin-1",
  email: "admin@admin.com",
  role: "ADMIN",
  whatsapp: null,
  active: true,
  verifiedWhatsapp: true,
  createdAt: new Date().toISOString(),
  paroquias: [],
  regioes: [],
};

const secretariaUser = {
  ...adminUser,
  id: "user-secretaria",
  email: "secretaria@admin.com",
  role: "SECRETARIA_CNC",
};

const regioes = [
  {
    id: 1,
    descricao: "Região 1",
    ativo: true,
    macroRegiao: { id: 1, descricao: "Macro 1", ativo: true },
  },
  {
    id: 2,
    descricao: "Região 2",
    ativo: true,
    macroRegiao: { id: 1, descricao: "Macro 1", ativo: true },
  },
];

const interceptarRequisicoesComuns = () => {
  cy.intercept("GET", "/api/ambrosio/auth/me", {
    statusCode: 200,
    body: { data: adminUser },
  }).as("getMe");

  cy.intercept("GET", "/api/ambrosio/cidades", {
    statusCode: 200,
    body: { data: [] },
  }).as("getCidades");

  cy.intercept("GET", "/api/ambrosio/regiao", {
    statusCode: 200,
    body: { data: regioes },
  }).as("getRegioes");
};

describe("Usuário SECRETARIA_CNC - gestão de regiões", () => {
  beforeEach(() => {
    cy.login();
    interceptarRequisicoesComuns();
  });

  it("exibe o card Regiões para usuário SECRETARIA_CNC", () => {
    cy.intercept("GET", "/api/ambrosio/user/user-secretaria", {
      statusCode: 200,
      body: secretariaUser,
    }).as("getUsuario");

    cy.visit("/dashboard/usuarios/user-secretaria");
    cy.wait("@getUsuario");

    cy.get('[data-slot="card-title"]')
      .contains("Regiões")
      .should("be.visible");
    cy.contains("Região 1").should("be.visible");
    cy.contains("Região 2").should("be.visible");
  });

  it("não exibe o card Regiões para usuário de outro papel", () => {
    cy.intercept("GET", "/api/ambrosio/user/user-admin", {
      statusCode: 200,
      body: { ...adminUser, id: "user-admin" },
    }).as("getUsuario");

    cy.visit("/dashboard/usuarios/user-admin");
    cy.wait("@getUsuario");

    cy.get('[data-slot="card-title"]')
      .contains("Regiões")
      .should("not.exist");
  });

  it("envia regiaoIds ao salvar as regiões selecionadas", () => {
    cy.intercept("GET", "/api/ambrosio/user/user-secretaria", {
      statusCode: 200,
      body: secretariaUser,
    }).as("getUsuario");

    cy.intercept("PATCH", "/api/ambrosio/user/user-secretaria/regioes", {
      statusCode: 200,
      body: { message: "Regiões atualizadas com sucesso" },
    }).as("patchRegioes");

    cy.visit("/dashboard/usuarios/user-secretaria");
    cy.wait("@getUsuario");
    cy.wait("@getRegioes");

    cy.contains('[data-slot="card-title"]', "Regiões")
      .closest('[data-slot="card"]')
      .within(() => {
        cy.get('input[type="checkbox"]').first().check();
        cy.contains("button", "Salvar").click();
      });

    cy.wait("@patchRegioes")
      .its("request.body")
      .should("deep.include", { regiaoIds: [1] });
  });
});
