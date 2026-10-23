# Tasks

## 1. API — handler DELETE

- [x] 1.1 Adicionar `export async function DELETE` em `src/app/api/ambrosio/user/[id]/route.ts`, no estilo do `PATCH` existente (try/catch, `NextResponse.json`), lendo o token do cookie e repassando `fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } })`; verificar que `npm run lint` não reporta erros no arquivo.
- [x] 1.2 Na função DELETE, validar `id` ausente (`400` "ID do usuário é obrigatório"), mapear `404` para "Usuário não encontrado" e `401`/`403` para mensagem de permissão, espelhando os handlers `GET`/`PATCH` existentes; verificar os branches com `npx tsc --noEmit` e leitura do código.
- [x] 1.3 Retornar resposta de sucesso (2xx) repassando status e corpo da API externa (resposta vazia em `204`), e para outros erros extrair a mensagem de forma robusta (`Array.isArray(msg) ? msg[0] : msg` com fallback genérico "Erro ao excluir usuário"); verificar manualmente que o body da resposta usa a mensagem tratada (não `undefined`).

## 2. UI — botão de exclusão na página

- [x] 2.1 Em `src/app/dashboard/(configuracoes)/usuarios/[id]/page.tsx`, adicionar estado de carregamento (`isDeleting`) e função `handleDelete` que chama `fetch(`/api/ambrosio/user/${id}`, { method: "DELETE" })`; ao confirmar sucesso exibe toast e chama `router.push(ROUTE_LIST)`; em erro exibe toast destrutivo com a mensagem e permanece na página; verificar via `npm run lint`.
- [x] 2.2 Adicionar o botão "Excluir usuário" (`variant="destructive"`, com `disabled={isDeleting}`) no `CardFooter` do card de dados, usando `AlertDialog` (confirmar/cancelar) de `src/components/ui/alert-dialog.tsx`; verificar no dev (fluxo confirmar e cancelar) que nenhuma requisição é enviada ao cancelar.
- [x] 2.3 Impedir submissões duplicadas enquanto a exclusão está em andamento (botões desabilitados) e garantir que o `AlertDialog` fecha após concluir; verificar manualmente no navegador que durante a requisição o botão fica desabilitado.
- [x] 2.4 Implementar a guarda de auto-exclusão: comparar `usuario.id` com `user.id` de `useUser()` e não renderizar a ação "Excluir usuário" quando forem iguais; verificar manualmente no navegador a ausência do botão na própria página do usuário logado.

## 3. Integração e verificação

- [x] 3.1 Executar `npm run lint` e `npm run build` no projeto; verificar que ambos concluem sem erros relacionados às mudanças.
- [ ] 3.2 Testar ponta a ponta no navegador: abrir `/dashboard/usuarios/[id]` de um usuário não logado, confirmar a exclusão de um usuário válido e verificar o toast de sucesso, o redirecionamento para `/dashboard/usuarios` e o sumiço do usuário na listagem; testar também o fluxo de cancelamento, um caso de erro (ex.: usuário já removido → toast destrutivo e permanência na página) e a ausência do botão na própria página do usuário logado.

## Workflow follow-up

- Revisar os artefatos planejados com o dono do produto/backend.
- Confirmar com o backend se `DELETE /users/:id` existe na API Ambrosio antes de concluir a implementação.
- Após a aprovação, iniciar `/opsx-apply` para implementar as tarefas acima.
