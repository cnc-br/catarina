type ValorData = Date | string | null | undefined;

function obterTimestamp(valor: ValorData): number | undefined {
  if (valor == null) return undefined;

  const timestamp =
    valor instanceof Date ? valor.getTime() : new Date(valor).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

export function ordenarEtapasComunidade<
  T extends { dataInicio?: ValorData; createdAt?: ValorData },
>(etapas: T[]): T[] {
  return [...etapas].sort((a, b) => {
    const aData = obterTimestamp(a.dataInicio) ?? obterTimestamp(a.createdAt);
    const bData = obterTimestamp(b.dataInicio) ?? obterTimestamp(b.createdAt);

    if (aData === undefined) return bData === undefined ? 0 : 1;
    if (bData === undefined) return -1;

    return aData - bData;
  });
}
