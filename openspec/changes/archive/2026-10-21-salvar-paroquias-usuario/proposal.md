# Proposal

## Why

Hoje o administrador não consegue definir de quais paróquias um usuário do dashboard é responsável: a página de edição do usuário lista as paróquias disponíveis, mas o botão "Salvar" não faz nada. Sem essa informação persistida, o sistema não sabe o escopo de atuação de cada usuário.

## What Changes

- Adicionar `paroquias` ao retorno do `GET /api/ambrosio/user/[id]` (a rota que faz proxy para `GET {ambrosio}/users/:id`).
- Criar a rota `PATCH /api/ambrosio/user/[id]/paroquias` que faz proxy para `PATCH {ambrosio}/users/:id/paroquias`, recebendo no body um array de inteiros `paroquiaIds`.
- No card de dados do usuário da página `/dashboard/usuarios/[id]`, listar as paróquias das quais o usuário é responsável.
- Na página que lista/atribui paróquias (`paroquias-usuario.tsx`), pré-selecionar as paróquias já atribuídas e implementar o botão "Salvar", que envia os ids selecionados via PATCH.

## Capabilities

### New Capabilities
- `user-paroquias`: capacidade de gerenciar (listar e persistir) as paróquias pelas quais um usuário do dashboard é responsável.

### Modified Capabilities

Nenhuma. Não existem specs anteriores neste repositório (`openspec/specs/` está vazio).

## Impact

- `src/app/api/ambrosio/user/[id]/route.ts`: GET passa a devolver `paroquias`; permanece o PATCH existente de dados gerais.
- `src/app/api/ambrosio/user/[id]/paroquias/route.ts`: nova rota de PATCH.
- `src/components/custom/dashboard/usuarios/paroquias-usuario.tsx`: pré-seleção do estado atual e botão "Salvar" funcional; passa a receber o `userId` e as paróquias atuais via props.
- `src/app/dashboard/(configuracoes)/usuarios/[id]/page.tsx`: lista as paróquias no card de dados do usuário e repassa o `userId` para `ParoquiasUsuario`.
- API externa (Ambrosio): consuma `PATCH {ambrosio}/users/:id/paroquias` com body `{ paroquiaIds: number[] }`.