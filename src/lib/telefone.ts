import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import metadados from "libphonenumber-js/metadata.min.json";

type MetadadosMin = {
  countries: Record<string, [string, string, string, number[], ...unknown[]]>;
};

const METADADOS = metadados as unknown as MetadadosMin;

export const PAIS_PADRAO: CountryCode = "BR";

export type PaisDdi = {
  iso: CountryCode;
  ddi: string;
  nome: string;
};

export type TelefoneSeparado = {
  pais: CountryCode;
  nacional: string;
};

let cachePaises: PaisDdi[] | null = null;

function criarDisplayNames(): Intl.DisplayNames | null {
  if (typeof Intl === "undefined" || typeof Intl.DisplayNames !== "function") {
    return null;
  }
  return new Intl.DisplayNames(["pt-BR"], { type: "region" });
}

/** Lista os países com DDI, ordenados pelo nome em pt-BR. */
export function listarPaisesComDdi(): PaisDdi[] {
  if (cachePaises) {
    return cachePaises;
  }

  const display = criarDisplayNames();

  cachePaises = getCountries()
    .map((iso) => ({
      iso,
      ddi: getCountryCallingCode(iso),
      nome: display?.of(iso) ?? iso,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return cachePaises;
}

/** Nome de exibição do país (pt-BR), com fallback para o código ISO. */
export function nomeDoPais(iso: CountryCode): string {
  return criarDisplayNames()?.of(iso) ?? iso;
}

/** DDI (código de discagem) do país, ex.: "BR" -> "55". */
export function ddiDoPais(iso: CountryCode): string {
  return getCountryCallingCode(iso);
}

/** Remove tudo que não for dígito. */
export function apenasDigitos(valor?: string | null): string {
  return (valor ?? "").replace(/\D/g, "");
}

const MAX_E164 = 15;

/** Tamanho máximo do número nacional (sem o DDI) para o país. */
export function limiteTelefoneNacional(iso: CountryCode): number {
  const lengths = METADADOS.countries[iso]?.[3];
  if (Array.isArray(lengths) && lengths.length > 0) {
    return Math.max(...lengths);
  }
  return MAX_E164 - ddiDoPais(iso).length;
}

/** Mantém apenas dígitos, limitado ao tamanho máximo do número do país. */
export function limitarTelefoneNacional(
  iso: CountryCode,
  valor?: string | null,
): string {
  return apenasDigitos(valor).slice(0, limiteTelefoneNacional(iso));
}

/**
 * Remove DDI(s) repetido(s) que tenham vazado para o número nacional
 * (ex.: usuário colou "+55 16 ..." no campo, ou um salvamento anterior
 * duplicou o DDI). Só remove enquanto o valor exceder o tamanho máximo do
 * número nacional e começar com o DDI do país — assim um DDD que coincida
 * com o DDI (ex.: DDD 55 no Brasil) não é removido indevidamente.
 */
function removerDdiRepetido(iso: CountryCode, nacional: string): string {
  let digits = apenasDigitos(nacional);
  const cc = ddiDoPais(iso);
  const limite = limiteTelefoneNacional(iso);

  while (digits.length > limite && digits.startsWith(cc)) {
    digits = digits.slice(cc.length);
  }

  return digits;
}

/** Formata o número nacional conforme o país, para exibição no input. */
export function formatarTelefoneNacional(
  iso: CountryCode,
  nacional: string,
): string {
  const digits = apenasDigitos(nacional);
  if (!digits) {
    return "";
  }
  return new AsYouType(iso).input(digits);
}

/**
 * Separa o telefone persistido (somente dígitos) em país + número nacional.
 * Prioriza o Brasil para valores legados de 10/11 dígitos válidos como
 * brasileiro; senão tenta interpretar como internacional; senão cai no Brasil.
 */
export function separarTelefone(telefone?: string | null): TelefoneSeparado {
  const digits = apenasDigitos(telefone);

  if (!digits) {
    return { pais: PAIS_PADRAO, nacional: "" };
  }

  if (
    (digits.length === 10 || digits.length === 11) &&
    isValidPhoneNumber(digits, "BR")
  ) {
    return { pais: "BR", nacional: digits };
  }

  // Aceita números apenas parseáveis (mesmo inválidos) para extrair país e
  // número nacional — exigir validade fazia o DDI duplicar a cada edição em
  // números fora do padrão.
  const parsed = parsePhoneNumberFromString(`+${digits}`);
  if (parsed?.country && parsed.nationalNumber) {
    return {
      pais: parsed.country,
      nacional: removerDdiRepetido(parsed.country, parsed.nationalNumber),
    };
  }

  return { pais: PAIS_PADRAO, nacional: removerDdiRepetido(PAIS_PADRAO, digits) };
}

/** Junta o DDI do país com o número nacional (somente dígitos, sem "+"). */
export function montarTelefone(iso: CountryCode, nacional: string): string {
  const digits = removerDdiRepetido(iso, nacional);
  if (!digits) {
    return "";
  }
  return `${ddiDoPais(iso)}${digits}`;
}
