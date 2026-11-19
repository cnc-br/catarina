/**
 * Normaliza a mensagem de erro devolvida pelo Ambrosio, que alterna entre
 * string e array de strings conforme o filtro de excecoes/validacao acionado.
 */
export function normalizarMensagem(
  mensagem: unknown,
  fallback: string,
): string {
  if (Array.isArray(mensagem)) {
    const itens = mensagem.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
    return itens.length > 0 ? itens.join(", ") : fallback;
  }

  if (typeof mensagem === "string" && mensagem.length > 0) {
    return mensagem;
  }

  return fallback;
}
