# Proposal

## Why

O campo `dataFim` (data final da etapa) da comunidade foi removido em todo o ecossistema: a lib `neocatecumenal` não expõe mais a propriedade, o backend não a envia e o dado foi removido do banco de dados. O frontend ainda referencia `dataFim` no dialog, nas rotas de proxy e em leitura/exibição, o que depende de campo inexistente e precisa ser eliminado.

## What Changes

- **BREAKING**: O dialog `dialog-passar-etapa.tsx` deixa de exibir o campo "Data final etapa" (`dataFim`), incluindo sua remoção do schema de validação (`zod`) e dos valores default do formulário.
- **BREAKING**: A API interna de proxy (`src/app/api/ambrosio/comunidade/[comunidadeId]/etapa/...`) deixa de enviar `dataFim` no payload ao criar (`POST`) ou atualizar (`PATCH`) a etapa da comunidade.
- **BREAKING**: As referências de leitura/exibição de `dataFim` são removidas de `useComunidadeById.ts` e da página `/dashboard/comunidades/[id]`, que passam a trabalhar apenas com `dataInicio`.
- O campo `dataInicio` ("Data convivência") permanece disponível e continua sendo salvo normalmente.

## Capabilities

### New Capabilities
- `comunidade/etapas`: Gerencia a passagem de etapa de uma comunidade via dashboard, incluindo o dialog "Passar Comunidade de Etapa" e a API interna de proxy que persiste as informações da etapa na API externa Ambrosio.

### Modified Capabilities
<!-- Nenhuma spec existente cobre essa capacidade; esta é a primeira definição do comportamento. -->

## Impact

- `src/components/custom/dashboard/comunidade/dialog-passar-etapa.tsx` — remoção do campo `dataFim` (schema, default values e campo de formulário).
- `src/app/api/ambrosio/comunidade/[comunidadeId]/etapa/route.ts` — remoção de `dataFim` no payload do `POST` (já não o envia; garante consistência).
- `src/app/api/ambrosio/comunidade/[comunidadeId]/etapa/[etapaComunidadeId]/route.ts` — remoção de `dataFim` no payload do `PATCH`.
- `src/hooks/useComunidadeById.ts` — remoção da normalização de `dataFim`.
- `src/app/dashboard/comunidades/[id]/page.tsx` — remoção da exibição de `dataFim` na listagem de etapas.