# Design

## Context

O dialog `PassarComunidadeDeEtapa` (`src/components/custom/dashboard/comunidade/dialog-passar-etapa.tsx`) controla a criação (POST) e edição (PATCH) da etapa de uma comunidade. Ele define um schema `zod` com os campos `etapa`, `local`, `dataInicio`, `dataFim` e `observacao`, e o payload é enviado aos endpoints de proxy:

- `PATCH /api/ambrosio/comunidade/[comunidadeId]/etapa/[etapaComunidadeId]` → monta o corpo com `dataFim: payload.dataFim`.
- `POST /api/ambrosio/comunidade/[comunidadeId]/etapa` → já não monta `dataFim` (apenas `dataInicio`).

Além disso, `dataFim` é lido/exibido em `useComunidadeById.ts` (normalização) e em `/dashboard/comunidades/[id]` (listagem). Esse campo foi removido de todo o ecossistema: a lib `neocatecumenal` já não expõe `dataFim` no tipo `ComunidadeEtapa`, o backend não o envia e o dado foi removido do banco, de modo que essas referências de leitura dependem de campo inexistente.

Veja proposal.md (Why) para a motivação. O objetivo é eliminar qualquer referência a `dataFim` no frontend, mantendo `dataInicio` inalterado.

## Goals / Non-Goals

**Goals:**
- Remover o campo "Data final etapa" do formulário, do schema `zod` e dos valores default do dialog.
- Garantir que nenhum payload enviado à API externa contenha `dataFim`.
- Remover as referências de leitura/exibição de `dataFim` em `useComunidadeById.ts` e na página de detalhes.
- Manter `dataInicio` e os demais campos funcionando sem regressão.

**Non-Goals:**
- Alterar a estrutura de dados ou o contrato de APIs exclusivamente externas a este repo (a responsabilidade de não enviar `dataFim` no backend já foi tratada fora deste change).
- Migração ou limpeza de registros no banco (já executado fora deste change).

## Decisions

**1. Remover o campo por completo no dialog, incluindo schema e defaults**
O `dataFim` é um campo opcional sem dependência estrutural. Removê-lo do schema `zod`, dos `defaultValues` e do `FormField` correspondente é a forma mais limpa: evita um campo invisível no formulário e valores órfãos no estado do `react-hook-form`.
- Alternativa considerada: manter o campo no schema mas omiti-lo. Rejeitado porque deixaria código morto persistido no componente.

**2. Remover `dataFim` do payload do PATCH e manter consistência no POST**
No endpoint de atualização (`[etapaComunidadeId]/route.ts`), o objeto `etapa` montado é enviado integralmente à Ambrosio; qualquer propriedade nele é repassada. Remover `dataFim: payload.dataFim` garante que a API externa não receba o campo.
- O endpoint de `POST` já não envia `dataFim`; apenas confirmamos a consistência sem alteração necessária.
- Alternativa considerada: adicionar uma regra de filtragem genérica do payload. Rejeitado por sobredimensionar uma remoção pontual já coberta literalmente.

**3. Remover também as referências de leitura/exibição**
Como `dataFim` foi removido da lib (`ComunidadeEtapa` já não expõe o campo), do backend e do banco, a normalização em `useComunidadeById.ts` e a exibição em `/dashboard/comunidades/[id]` referenciariam propriedade inexistente (erro de tipo). Eles são ajustados para trabalhar apenas com `dataInicio`, eliminando qualquer vestígio do campo no frontend.

## Risks / Trade-offs

- [Payload legado contendo `dataFim` ainda trafega de clientes antigos] → Mitigação: o requisito reduz o alcance ao comportamento do dialog, das rotas de proxy e da leitura neste repo; clientes externos não são tratados nesta mudança, o que é aceitável por ser um proxy interno.