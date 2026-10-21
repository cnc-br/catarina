# Spec Delta

## Purpose

Permite que o administrador visualize e persista de quais paróquias um usuário do dashboard é responsável, consultando e atualizando essas atribuições na API externa (Ambrosio).

## ADDED Requirements

### Requirement: Listar paróquias de um usuário no GET da rota de usuário
O sistema SHALL incluir o campo `paroquias` no retorno do `GET /api/ambrosio/user/[id]`, contendo um array de objetos `{ id: number, descricao: string }` com as paróquias pelas quais o usuário é responsável, conforme retornado pela API externa `GET {ambrosio}/users/:id`.

#### Scenario: Usuário possui paróquias atribuídas
- **WHEN** um administrador consulta `GET /api/ambrosio/user/[id]` e a API externa retorna `paroquias` com paróquias
- **THEN** a resposta da rota contém `paroquias` com as paróquias devolvidas pela API externa

#### Scenario: Usuário sem paróquias atribuídas
- **WHEN** um administrador consulta `GET /api/ambrosio/user/[id]` e a API externa retorna o usuário com `paroquias` vazio ou ausente
- **THEN** a resposta da rota contém `paroquias` como array vazio

### Requirement: Persistir paróquias de um usuário via PATCH
O sistema SHALL expor a rota `PATCH /api/ambrosio/user/[id]/paroquias` que repassa a atualização para `PATCH {ambrosio}/users/:id/paroquias`, enviando no body o atributo `paroquiaIds` (array de inteiros) com os ids das paróquias selecionadas.

#### Scenario: Atribuir paróquias com sucesso
- **WHEN** um administrador envia `PATCH /api/ambrosio/user/[id]/paroquias` com body `{ "paroquiaIds": [1, 11] }` e a API externa aceita
- **THEN** a rota responde com sucesso, confirmando a atualização das paróquias do usuário

#### Scenario: Body sem paroquiaIds
- **WHEN** um administrador envia `PATCH /api/ambrosio/user/[id]/paroquias` sem o atributo `paroquiaIds` no body
- **THEN** a rota responde com erro de requisição inválida (400) e não chama a API externa

#### Scenario: paroquiaIds inválido
- **WHEN** um administrador envia `PATCH /api/ambrosio/user/[id]/paroquias` com `paroquiaIds` que não é um array de números inteiros
- **THEN** a rota responde com erro de requisição inválida (400) e não chama a API externa

#### Scenario: Usuário não encontrado na API externa
- **WHEN** um administrador envia `PATCH /api/ambrosio/user/[id]/paroquias` e a API externa responde 404
- **THEN** a rota responde com 404 indicando que o usuário não foi encontrado

### Requirement: Exibir paróquias do usuário na página de edição
O sistema SHALL exibir no card de dados do usuário, na página `/dashboard/usuarios/[id]`, o nome das paróquias das quais o usuário é responsável, usando o campo `paroquias` retornado pelo GET.

#### Scenario: Usuário com paróquias responsáveis
- **WHEN** um administrador abre a página de edição de um usuário que possui paróquias em `paroquias`
- **THEN** o card de dados do usuário lista o nome (`descricao`) de cada paróquia

#### Scenario: Usuário sem paróquias responsáveis
- **WHEN** um administrador abre a página de edição de um usuário com `paroquias` vazio
- **THEN** o card de dados do usuário indica que nenhuma paróquia foi atribuída

### Requirement: Pré-selecionar e salvar paróquias na página de atribuição
O sistema SHALL carregar, na página de atribuição de paróquias (`paroquias-usuario.tsx`), as paróquias já atribuídas ao usuário com as caixas de seleção marcadas, e o botão "Salvar" SHALL enviar `PATCH /api/ambrosio/user/[id]/paroquias` com `paroquiaIds` contendo os ids das paróquias marcadas.

#### Scenario: Pré-selecionar paróquias já atribuídas
- **WHEN** um administrador abre a página de atribuição de paróquias de um usuário que já possui paróquias em `paroquias`
- **THEN** as caixas dessas paróquias aparecem marcadas por padrão

#### Scenario: Salvar paróquias selecionadas
- **WHEN** um administrador marca ou desmarca paróquias na tabela e clica em "Salvar" com pelo menos uma selecionada
- **THEN** o sistema envia o PATCH com `paroquiaIds` contendo os ids das paróquias marcadas

#### Scenario: Salvar com nenhuma paróquia selecionada
- **WHEN** um administrador desmarca todas as paróquias na tabela
- **THEN** o botão "Salvar" fica desabilitado e nenhuma requisição é enviada