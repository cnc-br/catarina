# user-regioes Specification

## Purpose

Permite ao administrador atribuir regiões a um usuário com o papel `SECRETARIA_CNC`, persistindo os vínculos de região e exibindo as regiões atribuídas ao usuário.

## Requirements

### Requirement: Repassar as regiões do usuário no GET da rota de usuário
O sistema SHALL repassar no campo `regioes` do `GET /api/ambrosio/user/[id]` as regiões do usuário quando a API externa as devolver, com `id` e `descricao`. Quando a API externa não fornecer as regiões, a rota SHALL omitir o campo `regioes`, permitindo que o frontend use as regiões das paróquias como fallback.

#### Scenario: API externa devolve regiões
- **WHEN** um administrador consulta `GET /api/ambrosio/user/[id]` e a API externa retorna `regioes` para o usuário
- **THEN** a resposta da rota contém `regioes` com as regiões devolvidas pela API externa

#### Scenario: API externa não devolve regiões
- **WHEN** um administrador consulta `GET /api/ambrosio/user/[id]` e a API externa não retorna `regioes`
- **THEN** a resposta da rota omite o campo `regioes`, permitindo o fallback pelas paróquias do usuário

### Requirement: Persistir regiões do usuário via PATCH
O sistema SHALL expor a rota `PATCH /api/ambrosio/user/[id]/regioes`, que repassa a atualização para `PATCH {ambrosio}/users/:id/regioes`, enviando no body o atributo `regiaoIds` (array de inteiros) com os ids das regiões selecionadas.

#### Scenario: Atribuir regiões com sucesso
- **WHEN** um administrador envia `PATCH /api/ambrosio/user/[id]/regioes` com body `{ "regiaoIds": [1, 2] }` e a API externa aceita
- **THEN** a rota responde com sucesso, confirmando a atualização das regiões do usuário

#### Scenario: Body sem regiaoIds
- **WHEN** um administrador envia `PATCH /api/ambrosio/user/[id]/regioes` sem o atributo `regiaoIds` no body
- **THEN** a rota responde com erro de requisição inválida (400) e não chama a API externa

#### Scenario: regiaoIds inválido
- **WHEN** um administrador envia `PATCH /api/ambrosio/user/[id]/regioes` com `regiaoIds` que não é um array de números inteiros
- **THEN** a rota responde com erro de requisição inválida (400) e não chama a API externa

#### Scenario: Usuário não encontrado na API externa
- **WHEN** um administrador envia `PATCH /api/ambrosio/user/[id]/regioes` e a API externa responde 404
- **THEN** a rota responde com 404 indicando que o usuário não foi encontrado

### Requirement: Exibir o card de regiões apenas para usuário SECRETARIA_CNC
O sistema SHALL exibir o card de gestão de regiões na página `/dashboard/usuarios/[id]` somente quando o usuário editado tiver o papel `SECRETARIA_CNC`.

#### Scenario: Usuário editado é SECRETARIA_CNC
- **WHEN** um administrador abre a página de edição de um usuário com papel `SECRETARIA_CNC`
- **THEN** o card de regiões é exibido

#### Scenario: Usuário editado tem outro papel
- **WHEN** um administrador abre a página de edição de um usuário com papel diferente de `SECRETARIA_CNC`
- **THEN** o card de regiões não é exibido

### Requirement: Listar as regiões disponíveis no card de gestão
O card SHALL carregar as regiões disponíveis por meio de `GET /api/ambrosio/regiao` e exibi-las com caixas de seleção para o administrador.

#### Scenario: Carregamento bem-sucedido
- **WHEN** o card de regiões é exibido e a rota de regiões responde com sucesso
- **THEN** o card lista as regiões retornadas com caixas de seleção

#### Scenario: Erro ao carregar regiões
- **WHEN** a rota de regiões responde com erro
- **THEN** o card exibe uma mensagem de erro e não permite salvar

#### Scenario: Nenhuma região cadastrada
- **WHEN** a rota de regiões retorna uma lista vazia
- **THEN** o card informa que não há regiões disponíveis e não permite salvar

### Requirement: Pré-selecionar as regiões já atribuídas
O card SHALL marcar como selecionadas as regiões retornadas no campo `regioes` do usuário. Quando o campo `regioes` não estiver disponível, o card SHALL usar as regiões das paróquias do usuário como fallback.

#### Scenario: Usuário com regiões atribuídas
- **WHEN** um administrador abre o card de um usuário cujo campo `regioes` contém regiões
- **THEN** as caixas dessas regiões aparecem marcadas

#### Scenario: Usuário sem regiões atribuídas
- **WHEN** um administrador abre o card de um usuário cujo campo `regioes` está vazio
- **THEN** nenhuma caixa de região aparece marcada

#### Scenario: Fallback pelas paróquias do usuário
- **WHEN** o campo `regioes` não está disponível e o usuário possui paróquias com regiões
- **THEN** as regiões dessas paróquias aparecem marcadas

### Requirement: Salvar as regiões selecionadas
O sistema SHALL enviar `PATCH /api/ambrosio/user/[id]/regioes` com `regiaoIds` contendo os ids das regiões marcadas quando o administrador clicar em "Salvar".

#### Scenario: Salvar regiões selecionadas
- **WHEN** um administrador marca ou desmarca regiões e clica em "Salvar" com pelo menos uma selecionada
- **THEN** o sistema envia o PATCH com `regiaoIds` contendo os ids das regiões marcadas

#### Scenario: Salvar com nenhuma região selecionada
- **WHEN** um administrador desmarca todas as regiões na lista
- **THEN** o botão "Salvar" fica desabilitado e nenhuma requisição é enviada

#### Scenario: Salvamento bem-sucedido
- **WHEN** o PATCH responde com sucesso
- **THEN** o card exibe uma mensagem de sucesso e atualiza os dados do usuário

#### Scenario: Erro ao salvar
- **WHEN** o PATCH responde com erro
- **THEN** o card exibe a mensagem de erro retornada e mantém a seleção para nova tentativa

### Requirement: Exibir as regiões atribuídas no card de dados do usuário
O sistema SHALL listar no card de dados do usuário, na página `/dashboard/usuarios/[id]`, as regiões das quais o usuário `SECRETARIA_CNC` é responsável, usando o campo `regioes` retornado pelo GET.

#### Scenario: Usuário com regiões atribuídas
- **WHEN** um administrador abre a página de edição de um usuário `SECRETARIA_CNC` que possui regiões em `regioes`
- **THEN** o card de dados lista a descrição de cada região

#### Scenario: Usuário sem regiões atribuídas
- **WHEN** um administrador abre a página de edição de um usuário `SECRETARIA_CNC` com `regioes` vazio
- **THEN** o card de dados indica que nenhuma região foi atribuída
