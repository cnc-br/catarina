# Tasks

## 1. API — handler DELETE

- [x] 1.1 Adicionar `export async function DELETE` em `src/app/api/ambrosio/paroquia/[id]/route.ts`, lendo o token do cookie e repassando `fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } })`; verificar que `npm run lint` não reporta erros no arquivo.
- [x] 1.2 Na função DELETE, mapear `404` para `Response.json({ message: "Paróquia não encontrada" }, { status: 404 })` e `401`/`403` para mensagem de permissão, espelhando o handler `GET` existente; verificar os branches com `npm run build` (tipagem) e leitura do código.
- [x] 1.3 Retornar resposta de sucesso (2xx) repassando status e corpo da API externa, e para outros erros extrair a mensagem de forma robusta (`Array.isArray(msg) ? msg[0] : msg`); verificar manualmente que o body da resposta usa a mensagem tratada (não `undefined`).

## 2. UI — botão de exclusão na página

- [x] 2.1 Em `src/app/dashboard/(pontos-fisicos)/paroquias/[id]/page.tsx`, adicionar estado de carregamento (`isDeleting`) e função `handleDelete` que chama `fetch(`${BASE_URL}/api/ambrosio/paroquia/${paroquiaId}`, { method: "DELETE" })`; ao confirmar sucesso exibe toast e chama `router.push("/dashboard/paroquias")`; em erro exibe toast destrutivo com a mensagem e permanece na página; verificar via `npm run lint`.
- [x] 2.2 Adicionar o botão "Excluir paróquia" (`variant="destructive"`, com `disabled={isDeleting}`) no `CardFooter` da página, ao lado de "Editar paróquia", usando `AlertDialog` (confirmar/cancelar) de `src/components/ui/alert-dialog.tsx`; verificar visualmente no dev (fluxo confirmar e cancelar) que nenhuma requisição é enviada ao cancelar.
- [x] 2.3 Impedir submissões duplicadas enquanto a exclusão está em andamento (botão desabilitado) e garantir que o `AlertDialog` fecha após concluir; verificar manualmente no navegador que durante a requisição o botão fica desabilitado.

## 3. Integração e verificação

- [x] 3.1 Executar `npm run lint` e `npm run build` no projeto; verificar que ambos concluem sem erros relacionados às mudanças.
- [x] 3.2 Testar ponta a ponta no navegador: abrir `/dashboard/paroquias/[id]`, confirmar a exclusão de uma paróquia válida, e verificar o toast de sucesso, o redirecionamento para `/dashboard/paroquias` e o sumiço da paróquia na listagem; testar também o fluxo de cancelamento e um caso de erro (ex.: paróquia já removida → toast destrutivo e permanência na página).

## Workflow follow-up

- Revisar os artefatos planejados com o dono do produto/backend.
- Após a aprovação, iniciar `/opsx-apply` para implementar as tarefas acima.
