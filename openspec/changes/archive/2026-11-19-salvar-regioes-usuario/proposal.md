# Proposal

## Why

O ADMIN já consegue atribuir paróquias a um usuário, mas não regiões. Usuários com o papel `SECRETARIA_CNC` precisam trabalhar apenas com as paróquias da sua região. O backend Ambrosio está sendo migrado de `usuarioSetor` para `usuarioRegiao`, expondo a rota `PATCH /users/:id/regioes`; o frontend precisa acompanhar esse contrato para permitir a gestão de regiões por usuário.

## What Changes

- Adicionar um card "Regiões" na página `/dashboard/usuarios/[id]`, exibido somente quando o usuário editado tem o papel `SECRETARIA_CNC`.
- O card lista as regiões disponíveis por meio do `GET /api/ambrosio/regiao` e permite marcar/desmarcar regiões.
- O ADMIN marca as regiões; ao salvar, o sistema envia `PATCH /api/ambrosio/user/[id]/regioes` com `regiaoIds` contendo os ids das regiões marcadas.
- Criar a rota proxy `PATCH /api/ambrosio/user/[id]/regioes`, que valida `regiaoIds` e repassa a atualização para `PATCH {ambrosio}/users/:id/regioes`.
- Repassar `regioes` no `GET /api/ambrosio/user/[id]` para pré-selecionar as regiões já atribuídas; quando o campo não estiver disponível, o card usa as regiões das paróquias do usuário como fallback.
- Listar as regiões atribuídas no card de dados do usuário quando o papel for `SECRETARIA_CNC`.
- O vínculo de paróquias existente permanece inalterado.

## Capabilities

### New Capabilities

- `user-regioes`: gestão de regiões por usuário — exibição condicional por papel, leitura de regiões, pré-seleção e persistência via `regiaoIds`.

### Modified Capabilities

Nenhuma. O vínculo de paróquias e as demais capacidades permanecem inalterados.

## Impact

- `src/app/api/ambrosio/user/[id]/route.ts`: GET passa a devolver `regioes` (quando disponível).
- `src/app/api/ambrosio/user/[id]/regioes/route.ts`: nova rota de PATCH.
- `src/components/custom/dashboard/usuarios/regioes-usuario.tsx`: novo componente de gestão de regiões.
- `src/app/dashboard/(configuracoes)/usuarios/[id]/page.tsx`: renderiza o card apenas para `SECRETARIA_CNC` e lista as regiões no card de dados.
- `src/constants.ts`: constante `ROLE_SECRETARIA_CNC` (ou uso de `UserRoleEnum.SECRETARIA_CNC`).
- Tipos: estender o tipo `User` com `regioes?: Regiao[]`.
- Backend Ambrosio (em andamento pelo usuário): migração de `usuarioSetor` para `usuarioRegiao` e rota `PATCH /users/:id/regioes`.
