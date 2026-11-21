import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractSystemOverviewPayload,
  formatNumber,
  formatPercent,
  normalizeSystemOverview,
} from "./system-overview.ts";

const payloadCompleto = {
  pessoas: { total: 100, ativas: 90, inativas: 10 },
  paroquias: 12,
  dioceses: 2,
  comunidades: 30,
  equipes: 8,
  carismas: { total: 4, vinculos: 15 },
  usuarios: {
    total: 5,
    porPapel: {
      ADMIN: 3,
      SECRETARIA_PAROQUIA: 2,
      NAO_IDENTIFICADO: 0,
    },
  },
};

test("normaliza o payload completo do resumo", () => {
  const overview = normalizeSystemOverview(payloadCompleto);

  assert.deepEqual(overview.pessoas, {
    total: 100,
    ativas: 90,
    inativas: 10,
    ativasPercent: 90,
    inativasPercent: 10,
  });
  assert.equal(overview.paroquias, 12);
  assert.equal(overview.dioceses, 2);
  assert.equal(overview.comunidades, 30);
  assert.equal(overview.equipes, 8);
  assert.deepEqual(overview.carismas, { total: 4, vinculos: 15 });
  assert.equal(overview.usuarios.total, 5);
  assert.deepEqual(overview.usuarios.porPapel, [
    { label: "ADMIN", value: 3, percent: 60 },
    { label: "SECRETARIA_PAROQUIA", value: 2, percent: 40 },
    { label: "NAO_IDENTIFICADO", value: 0, percent: 0 },
  ]);
});

test("mantém totais zerados e evita divisão por zero", () => {
  const overview = normalizeSystemOverview({
    pessoas: { total: 0, ativas: 0, inativas: 0 },
    paroquias: 0,
    dioceses: 0,
    comunidades: 0,
    equipes: 0,
    carismas: { total: 0, vinculos: 0 },
    usuarios: {
      total: 0,
      porPapel: { ADMIN: 0, SECRETARIA_PAROQUIA: 0, NAO_IDENTIFICADO: 0 },
    },
  });

  assert.equal(overview.pessoas.ativasPercent, 0);
  assert.equal(overview.pessoas.inativasPercent, 0);
  assert.equal(overview.usuarios.total, 0);
  assert.ok(overview.usuarios.porPapel.every((role) => role.percent === 0));
});

test("preenche campos ausentes com zero e mantém os papéis conhecidos", () => {
  const overview = normalizeSystemOverview({});

  assert.deepEqual(overview.pessoas, {
    total: 0,
    ativas: 0,
    inativas: 0,
    ativasPercent: 0,
    inativasPercent: 0,
  });
  assert.equal(overview.paroquias, 0);
  assert.deepEqual(overview.carismas, { total: 0, vinculos: 0 });
  assert.deepEqual(
    overview.usuarios.porPapel.map((role) => role.label),
    ["ADMIN", "SECRETARIA_PAROQUIA", "NAO_IDENTIFICADO"],
  );
});

test("adiciona papéis extras depois dos conhecidos em ordem alfabética", () => {
  const overview = normalizeSystemOverview({
    usuarios: {
      total: 6,
      porPapel: {
        ZELADOR: 1,
        ADMIN: 3,
        COORDENADOR: 1,
        SECRETARIA_PAROQUIA: 1,
      },
    },
  });

  assert.deepEqual(
    overview.usuarios.porPapel.map((role) => role.label),
    [
      "ADMIN",
      "SECRETARIA_PAROQUIA",
      "NAO_IDENTIFICADO",
      "COORDENADOR",
      "ZELADOR",
    ],
  );
  assert.deepEqual(
    overview.usuarios.porPapel.map((role) => role.value),
    [3, 1, 0, 1, 1],
  );
});

test("ignora percentuais quando o total é zero mesmo com valores informados", () => {
  const overview = normalizeSystemOverview({
    pessoas: { total: 0, ativas: 5, inativas: 5 },
    usuarios: { total: 0, porPapel: { ADMIN: 4 } },
  });

  assert.equal(overview.pessoas.ativasPercent, 0);
  assert.equal(overview.pessoas.inativasPercent, 0);
  assert.equal(overview.usuarios.porPapel[0].percent, 0);
});

test("extrai o payload direto ou embrulhado em data", () => {
  assert.deepEqual(extractSystemOverviewPayload(payloadCompleto), payloadCompleto);
  assert.deepEqual(extractSystemOverviewPayload({ data: payloadCompleto }), payloadCompleto);
  assert.equal(extractSystemOverviewPayload({ data: {} }), null);
  assert.equal(extractSystemOverviewPayload(null), null);
  assert.equal(extractSystemOverviewPayload([]), null);
  assert.equal(extractSystemOverviewPayload("payload"), null);
});

test("formata números e percentuais em pt-BR", () => {
  assert.equal(formatNumber(1234), "1.234");
  assert.equal(formatPercent(90), "90%");
  assert.equal(formatPercent(33), "33%");
});
