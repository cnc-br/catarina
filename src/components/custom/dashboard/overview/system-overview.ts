/**
 * Contrato e normalização do resumo agregado consumido de `GET /dashboard`
 * no Ambrosio.
 *
 * O payload pode chegar direto na raiz ou dentro de `{ data: ... }`, como
 * acontece em outros endpoints do Ambrosio. Campos ausentes ou inválidos são
 * tratados como `0` para que a página continue renderizando.
 */
export type SystemOverviewPayload = {
  pessoas?: {
    total?: number;
    ativas?: number;
    inativas?: number;
  } | null;
  paroquias?: number | null;
  dioceses?: number | null;
  comunidades?: number | null;
  equipes?: number | null;
  carismas?: {
    total?: number;
    vinculos?: number;
  } | null;
  usuarios?: {
    total?: number;
    porPapel?: Record<string, number> | null;
  } | null;
};

export type SystemOverviewDistributionItem = {
  label: string;
  value: number;
  percent: number;
};

export type SystemOverview = {
  pessoas: {
    total: number;
    ativas: number;
    inativas: number;
    ativasPercent: number;
    inativasPercent: number;
  };
  paroquias: number;
  dioceses: number;
  comunidades: number;
  equipes: number;
  carismas: {
    total: number;
    vinculos: number;
  };
  usuarios: {
    total: number;
    porPapel: SystemOverviewDistributionItem[];
  };
};

export const KNOWN_USER_ROLES = [
  "ADMIN",
  "SECRETARIA_PAROQUIA",
  "NAO_IDENTIFICADO",
] as const;

const OVERVIEW_KEYS = [
  "pessoas",
  "paroquias",
  "dioceses",
  "comunidades",
  "equipes",
  "carismas",
  "usuarios",
] as const;

const numberFormatter = new Intl.NumberFormat("pt-BR");
const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/**
 * Recebe um percentual entre 0 e 100 (ex.: 90) e devolve o texto localizado
 * (ex.: "90%").
 */
export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function calculatePercent(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function normalizeUserRoles(
  porPapel: unknown,
  total: number,
): SystemOverviewDistributionItem[] {
  const roles = isRecord(porPapel) ? porPapel : {};
  const knownRoles = KNOWN_USER_ROLES.map((role) => ({
    label: role,
    value: normalizeCount(roles[role]),
  }));

  const extras = Object.keys(roles)
    .filter(
      (role) => !KNOWN_USER_ROLES.includes(role as (typeof KNOWN_USER_ROLES)[number]),
    )
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((role) => ({
      label: role,
      value: normalizeCount(roles[role]),
    }));

  return [...knownRoles, ...extras].map((role) => ({
    ...role,
    percent: calculatePercent(role.value, total),
  }));
}

export function normalizeSystemOverview(
  payload: SystemOverviewPayload,
): SystemOverview {
  const pessoas = isRecord(payload.pessoas) ? payload.pessoas : {};
  const carismas = isRecord(payload.carismas) ? payload.carismas : {};
  const usuarios = isRecord(payload.usuarios) ? payload.usuarios : {};

  const pessoasTotal = normalizeCount(pessoas.total);
  const pessoasAtivas = normalizeCount(pessoas.ativas);
  const pessoasInativas = normalizeCount(pessoas.inativas);
  const usuariosTotal = normalizeCount(usuarios.total);

  return {
    pessoas: {
      total: pessoasTotal,
      ativas: pessoasAtivas,
      inativas: pessoasInativas,
      ativasPercent: calculatePercent(pessoasAtivas, pessoasTotal),
      inativasPercent: calculatePercent(pessoasInativas, pessoasTotal),
    },
    paroquias: normalizeCount(payload.paroquias),
    dioceses: normalizeCount(payload.dioceses),
    comunidades: normalizeCount(payload.comunidades),
    equipes: normalizeCount(payload.equipes),
    carismas: {
      total: normalizeCount(carismas.total),
      vinculos: normalizeCount(carismas.vinculos),
    },
    usuarios: {
      total: usuariosTotal,
      porPapel: normalizeUserRoles(usuarios.porPapel, usuariosTotal),
    },
  };
}

function hasOverviewShape(value: Record<string, unknown>): boolean {
  return OVERVIEW_KEYS.some((key) => key in value);
}

/**
 * Extrai o payload do resumo, aceitando resposta direta ou embrulhada em
 * `{ data: ... }`. Retorna `null` quando o corpo não tem nenhuma chave
 * conhecida do resumo.
 */
export function extractSystemOverviewPayload(
  body: unknown,
): SystemOverviewPayload | null {
  if (!isRecord(body)) {
    return null;
  }

  if (!hasOverviewShape(body) && isRecord(body.data) && hasOverviewShape(body.data)) {
    return body.data as SystemOverviewPayload;
  }

  return hasOverviewShape(body) ? (body as SystemOverviewPayload) : null;
}
