# Proposal

## Why

Hoje a API interna de usuários (`/api/ambrosio/user/[id]`) expõe apenas `GET` e `PATCH`, e a página `/dashboard/usuarios/[id]` permite editar e desativar usuários (via `active: false`), mas não excluí-los. Quando um usuário precisa ser removido do sistema, não há como fazê-lo pela interface.

## What Changes

- Adicionar handler `DELETE` à rota `src/app/api/ambrosio/user/[id]/route.ts`, repassando a operação para `DELETE {ambrosio}/users/:id` na API externa Ambrosio com autenticação Bearer e tratamento de erros consistente com os handlers `GET`/`PATCH` existentes.
- Adicionar um botão "Excluir usuário" na página `/dashboard/usuarios/[id]` (arquivo `src/app/dashboard/(configuracoes)/usuarios/[id]/page.tsx`) com diálogo de confirmação, feedback via toast e redirecionamento para a listagem após exclusão bem-sucedida.
- **Bloquear auto-exclusão**: na própria página do usuário logado, a ação de exclusão não fica disponível (impede o administrador de excluir a própria conta).

## Capabilities

### New Capabilities
- `users`: gestão do ciclo de vida de usuários do dashboard (visualizar, cadastrar, editar, desativar e excluir). Surge com a exclusão de usuário e absorverá futuros requisitos de gestão de usuários. O id `users` mantém a convenção em inglês já usada por `user-paroquias`.

### Modified Capabilities
- Nenhuma. `user-paroquias` trata apenas da atribuição de paróquias a usuários e seu comportamento não muda.

## Impact

- **API**: `src/app/api/ambrosio/user/[id]/route.ts` — novo handler `DELETE` que proxifica para `DELETE {AmbrosioBaseUrl}/users/:id`.
- **UI**: `src/app/dashboard/(configuracoes)/usuarios/[id]/page.tsx` — botão de exclusão com confirmação usando `AlertDialog` (shadcn/ui, já presente no projeto), guarda de auto-exclusão via `useUser`.
- **Dependência externa**: endpoint `DELETE /users/:id` da API Ambrosio (assumido existente; ver design.md).
- **Sem quebras**: mudança aditiva, não altera `GET`/`PATCH` nem outras rotas.
