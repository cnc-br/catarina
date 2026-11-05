# Design

## Context

A página `src/app/dashboard/(configuracoes)/carismas/page.tsx` já consome `GET /api/ambrosio/configuracoes/carismas` (route handler que repassa para `AmbrosioBaseUrl/carismas`) e renderiza os carismas agrupados por `TipoCarismaEnum` via `ListagemDeCarismas`. A interface `Carisma` da lib `neocatecumenal` é:

```ts
export default interface Carisma {
  id: number;
  descricao: string;
  tipo: TipoCarismaEnum;
  casalAndaJunto: boolean;
}
```

O route handler existente só implementa `GET`. Não há formulário de edição; a listagem é somente leitura e apenas exibe a marcação "(Casal anda junto)". Ver `proposal.md` para a motivação.

## Goals / Non-Goals

**Goals:**

- Exibir um Dialog de edição acessível a partir de cada item da listagem.
- Editar `descricao`, `tipo` e `casalAndaJunto` de um carisma existente.
- Disponibilizar endpoint de atualização com o `id` ao final da rota: `/api/ambrosio/configuracoes/carismas/[id]`.
- Refletir o resultado da atualização na listagem sem recarregar a página inteira.

**Non-Goals:**

- Criar/remover carismas (apenas update neste change).
- Editar "Situações Religiosas", que são uma lista estática fake na página.
- Alterar o contrato de `GET /api/ambrosio/configuracoes/carismas`.
- Introduzir cache/otimistic update sofisticado; um refetch simples após sucesso é suficiente.

## Decisions

### 1. Rota dinâmica `[id]` em vez de `?id=`

Criar `src/app/api/ambrosio/configuracoes/carismas/[id]/route.ts` com `PATCH` (e opcionalmente `PUT`). O `id` vem do segmento da URL, como o usuário pediu ("passando o id no final da rota"). Segue o padrão já existente no repo (`configuracoes/localidade/[id]/route.ts`, `ambrosio/pessoa/[id]/route.ts`).

- Alternativa considerada: adicionar `PATCH` no `route.ts` existente recebendo `id` no body. Rejeitada por fugir do padrão de rotas dinâmicas do projeto e por misturar coleção com recurso.

### 2. Handler do proxy repassa com `Bearer` token

O novo handler lê o cookie `token` via `cookies()` e chama `PATCH ${AmbrosioBaseUrl}/carismas/${id}` com `Authorization: Bearer ${token}`, `Content-Type: application/json` e o body serializado. Repassa `status` e body da resposta do backend, sem engolir erros.

- Alternativa considerada: `PUT` puro. Preferimos `PATCH` por ser atualização parcial e evitar que o cliente precise reenviar campos imutáveis; o body enviará o subconjunto editável (`descricao`, `tipo`, `casalAndaJunto`).

### 3. Dialog controlado a partir da página, não da listagem

`CarismasPage` mantém `carismaEmEdicao: Carisma | null` e passa `onEdit={(c) => setCarismaEmEdicao(c)}` para `ListagemDeCarismas`. `ListagemDeCarismas` ganha um botão (ícone `Pencil`) por item. O Dialog fica montado na página, recebendo o carisma selecionado, e fecha/reseta ao concluir.

- Alternativa considerada: cada item abrir seu próprio Dialog. Rejeitada por multiplicar estado e dificultar o refetch único da lista.

### 4. Formulário com `react-hook-form` + `zod`

Conforme AGENTS.md, formulários devem usar `react-hook-form` e schemas `zod`. Schema: `descricao` string não vazia, `tipo` enum `TipoCarismaEnum`, `casalAndaJunto` boolean. Toggle via componente `Switch` de `src/components/ui`.

### 5. Contrato confirmado no backend (2026-11-05)

Verificado em `ambrosio/src/carisma/carisma.controller.ts` e DTOs:

- Método/rota: `PATCH /carismas/:id` (protegido por `AuthGuard` + `RoleGuard`).
- Payload: `UpdateCarismaDto` = `PartialType(CreateCarismaDto)` — `descricao?: string` (máx. 100), `tipo?: 'PRIMITIVO' | 'SERVICO' | 'VINCULADO'` (máx. 20), `casalAndaJunto?: boolean`.
- `AmbrosioBaseUrl` local é `http://localhost:3005`; sem token a rota responde 401.

### 6. Refetch da lista após sucesso

Após `PATCH` bem-sucedido, incrementar um `refreshKey` no estado da página; o `useEffect` que busca a lista depende desse valor e refaz o `fetch`. Simples e consistente com o código atual, que já usa `useState` + `fetch` dentro do `useEffect`. Um `fetchCarismas` extraído com `useCallback` dispararia a regra `react-hooks/set-state-in-effect` do ESLint, que já acusa outros pontos do repo; por isso a opção pela chave de refresh.

## Risks / Trade-offs

- **Backend pode não aceitar `PATCH`/payload parcial** → antes de finalizar, confirmar o método e o schema aceitos por `AmbrosioBaseUrl/carismas/{id}`; se for `PUT`/payload completo, ajustar o handler e o body.
- **Endpoint de update pode não existir no backend** → o route handler deve repassar o status real (404/405/etc.) em vez de mascarar; a tarefa inclui validar a resposta em dev.
- **Situações Religiosas são fake e têm ids fixos 1–10** → não habilitar edição nelas para evitar PATCH em ids que não são carismas reais; o botão de editar deve aparecer somente para a lista real de carismas.
- **Revalidate cache do GET (`revalidate: 30`)** → após o PATCH, o refetch pode retornar cache antigo por até 30s; considerar `revalidate = 0` no GET ou `cache: "no-store"` para a página de configuração, ou usar `router.refresh()`. Anotado como decisão de implementação.
