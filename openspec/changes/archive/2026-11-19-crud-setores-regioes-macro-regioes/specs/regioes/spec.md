# Spec Delta

## Purpose

Permite ao usuário administrativo cadastrar e editar regiões no dashboard, mantendo o vínculo obrigatório com uma macro região e a situação ativo/inativo do registro.

## ADDED Requirements

### Requirement: Cadastrar região pela API interna
O sistema SHALL expor `POST /api/ambrosio/regiao`, que valida a presença de `descricao` e `macroRegiaoId`, repassa a operação para `POST {ambrosio}/regiao` com o corpo `{ descricao, macroRegiao: { id }, ativo }` e o token da sessão no header `Authorization` como Bearer, e reflete o status retornado pela API externa.

#### Scenario: Cadastro bem-sucedido
- **WHEN** o usuário autorizado envia `POST /api/ambrosio/regiao` com descrição válida e uma macro região existente
- **THEN** a rota interna responde `201` com a região criada retornada pela API externa

#### Scenario: Dados inválidos
- **WHEN** a API externa rejeita a requisição por descrição ausente/longa ou macro região inválida
- **THEN** a rota interna responde com o mesmo status de erro e com a mensagem retornada pela API externa

#### Scenario: Sem permissão para cadastrar
- **WHEN** a API externa responde `401` ou `403` ao cadastro
- **THEN** a rota interna responde o mesmo status com uma mensagem informando que não há permissão para cadastrar região

#### Scenario: Erro inesperado da API externa
- **WHEN** a API externa responde com outro status de erro
- **THEN** a rota interna responde esse status com a mensagem de erro normalizada

### Requirement: Editar região pela API interna
O sistema SHALL expor `GET /api/ambrosio/regiao/[id]` e `PATCH /api/ambrosio/regiao/[id]`. O `GET` SHALL retornar a região com sua macro região; o `PATCH` SHALL aceitar atualização parcial de `descricao`, `macroRegiaoId` e `ativo`, repassando para `PATCH {ambrosio}/regiao/:id` com o token da sessão.

#### Scenario: Leitura de região existente
- **WHEN** o usuário solicita `GET /api/ambrosio/regiao/[id]` para uma região existente
- **THEN** a rota interna responde `200` com os dados da região, incluindo a macro região vinculada

#### Scenario: Região não encontrada
- **WHEN** o `GET` ou o `PATCH` recebe `404` da API externa
- **THEN** a rota interna responde `404` com a mensagem "Região não encontrada"

#### Scenario: Edição bem-sucedida
- **WHEN** o usuário autorizado envia `PATCH /api/ambrosio/regiao/[id]` com descrição e/ou macro região válidas
- **THEN** a rota interna responde `200` com a região atualizada retornada pela API externa

#### Scenario: Sem permissão para editar
- **WHEN** a API externa responde `401` ou `403` à edição
- **THEN** a rota interna responde o mesmo status com uma mensagem informando que não há permissão para editar região

### Requirement: Cadastrar região pelo dashboard
O sistema SHALL disponibilizar a página `/dashboard/regioes/novo` com formulário validado por schema contendo descrição, seleção obrigatória de macro região e alternador "Ativo" (padrão ligado). Ao salvar com sucesso, SHALL exibir toast de confirmação e redirecionar para `/dashboard/regioes`.

#### Scenario: Cadastro concluído pela interface
- **WHEN** o usuário autorizado preenche descrição e macro região válidas e envia o formulário
- **THEN** a página envia `POST /api/ambrosio/regiao`, exibe toast de sucesso e navega para `/dashboard/regioes`

#### Scenario: Validação local impede envio incompleto
- **WHEN** o usuário tenta enviar sem descrição válida ou sem macro região selecionada
- **THEN** o formulário exibe mensagens de validação e não envia requisição

#### Scenario: Erro no cadastro
- **WHEN** a requisição de cadastro responde com erro
- **THEN** a página exibe toast destrutivo com a mensagem retornada e permanece no formulário

#### Scenario: Requisição em andamento
- **WHEN** o cadastro está sendo enviado
- **THEN** o botão de salvar fica desabilitado até a resposta

### Requirement: Editar região pelo dashboard
O sistema SHALL disponibilizar a página `/dashboard/regioes/[id]` que carrega a região existente, preenche o formulário com seus dados e permite salvar alterações. Ao salvar com sucesso, SHALL exibir toast de confirmação e redirecionar para `/dashboard/regioes`.

#### Scenario: Edição concluída pela interface
- **WHEN** o usuário autorizado altera a descrição, a macro região ou a situação e envia o formulário
- **THEN** a página envia `PATCH /api/ambrosio/regiao/[id]`, exibe toast de sucesso e navega para `/dashboard/regioes`

#### Scenario: Região inexistente
- **WHEN** a página de edição recebe `404` ao carregar a região
- **THEN** exibe toast informando que a região não foi encontrada e redireciona para `/dashboard/regioes`

#### Scenario: Erro na edição
- **WHEN** a requisição de edição responde com erro
- **THEN** a página exibe toast destrutivo com a mensagem retornada e permanece no formulário
