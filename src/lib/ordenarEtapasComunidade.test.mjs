import assert from "node:assert/strict";
import { test } from "node:test";
import { ordenarEtapasComunidade } from "./ordenarEtapasComunidade.ts";

test("ordena por dataInicio e usa createdAt quando dataInicio não existe", () => {
  const etapas = [
    {
      id: 1,
      dataInicio: new Date("2024-02-01T00:00:00.000Z"),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    },
    {
      id: 2,
      dataInicio: new Date("2024-01-01T00:00:00.000Z"),
      createdAt: new Date("2024-02-01T00:00:00.000Z"),
    },
    {
      id: 3,
      dataInicio: null,
      createdAt: "2024-01-15T00:00:00.000Z",
    },
    {
      id: 4,
      dataInicio: null,
    },
  ];

  const ordenadas = ordenarEtapasComunidade(etapas);

  assert.deepEqual(
    ordenadas.map((etapa) => etapa.id),
    [2, 3, 1, 4],
  );
  assert.deepEqual(
    etapas.map((etapa) => etapa.id),
    [1, 2, 3, 4],
  );
});
