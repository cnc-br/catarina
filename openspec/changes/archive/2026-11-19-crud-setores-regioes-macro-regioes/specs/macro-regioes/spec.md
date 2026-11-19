# Spec Delta

## Purpose

Permite ao usuário administrativo cadastrar e editar macro regiões no dashboard, controlando a descrição e a situação ativo/inativo do registro.

## ADDED Requirements

### Requirement: Cadastrar macro região pela API interna
O sistema SHALL expor `POST /api/ambrosio/macro-regiao`, que valida a presença de `descricao`, repassa a operação para `POST {ambrosio}/macro-regiao` com o corpo `{ descricao, ativo }` e o token da sessão no header `Authorization` como Bearer, e reflete o status retornado pela API externa.

#### Scenario: Cadastro bem-sucedido
- **WHEN** o usuário autorizado envia `POST /api/ambrosio/macro-regiao` com descrição válida
- **THEN** a rota interna responde `201` com a macro região criada retornada pela API externa

#### Scenario: Dados inválidos
- **WHEN** a API externa rejeita a requisição por descrição ausente ou acima do limite
- **THEN** a rota interna responde com o mesmo status de erro e com a mensagem retornada pela API externa

#### Scenario: Sem permissão para cadastrar
- **WHEN** a API externa responde `401` ou `403` ao cadastro
- **THEN** a rota interna responde o mesmo status com uma mensagem informando que não há permissão para cadastrar macro região

#### Scenario: Erro inesperado da API externa
- **WHEN** a API externa responde com outro status de erro
- **THEN** a rota interna responde esse status com a mensagem de erro normalizada

### Requirement: Editar macro região pela API interna
O sistema SHALL expor `GET /api/ambrosio/macro-regiao/[id]` e `PATCH /api/ambrosio/macro-regiao/[id]`, repassando para `GET {ambrosio}/macro-regiao/:id` e `PATCH {ambrosio}/macro-regiao/:id` com o token da sessão. O `PATCH` SHALL aceitar atualização parcial de `descricao` e `ativo`.

#### Scenario: Leitura de macro região existente
- **WHEN** o usuário solicita `GET /api/ambrosio/macro-regiao/[id]` para uma macro região existente
- **THEN** a rota interna responde `200` com os dados da macro região

#### Scenario: Macro região não encontrada
- **WHEN** o `GET` ou o `PATCH` recebe `404` da API externa
- **THEN** a rota interna responde `404` com a mensagem "Macro região não encontrada"

#### Scenario: Edição bem-sucedida
- **WHEN** o usuário autorizado envia `PATCH /api/ambrosio/macro-regiao/[id]` com descrição e/ou situação válidas
- **THEN** a rota interna responde `200` com a macro região atualizada retornada pela API externa

#### Scenario: Sem permissão para editar
- **WHEN** a API externa responde `401` ou `403` à edição
- **THEN** a rota interna responde o mesmo status com uma mensagem informando que não há permissão para editar macro região

### Requirement: Cadastrar macro região pelo dashboard
O sistema SHALL disponibilizar a página `/dashboard/macro-regiao/novo` com formulário validado por schema contendo descrição e alternador "Ativo" (padrão ligado). Ao salvar com sucesso, SHALL exibir toast de confirmação e redirecionar para `/dashboard/macro-regiao`.

#### Scenario: Cadastro concluído pela interface
- **WHEN** o usuário autorizado preenche uma descrição válida e envia o formulário
- **THEN** a página envia `POST /api/ambrosio/macro-regiao`, exibe toast de sucesso e navega para `/dashboard/macro-regiao`

#### Scenario: Validação local impede envio incompleto
- **WHEN** o usuário tenta enviar sem descrição válida
- **THEN** o formulário exibe mensagem de validação e não envia requisição

#### Scenario: Erro no cadastro
- **WHEN** a requisição de cadastro responde com erro
- **THEN** a página exibe toast destrutivo com a mensagem retornada e permanece no formulário

#### Scenario: Requisição em andamento
- **WHEN** o cadastro está sendo enviado
- **THEN** o botão de salvar fica desabilitado até a resposta

### Requirement: Editar macro região pelo dashboard
O sistema SHALL disponibilizar a página `/dashboard/macro-regiao/[id]` que carrega a macro região existente, preenche o formulário com seus dados e permite salvar alterações. Ao salvar com sucesso, SHALL exibir toast de confirmação e redirecionar para `/dashboard/macro-regiao`.

#### Scenario: Edição concluída pela interface
- **WHEN** o usuário autorizado altera a descrição ou a situação e envia o formulário
- **THEN** a página envia `PATCH /api/ambrosio/macro-regiao/[id]`, exibe toast de sucesso e navega para `/dashboard/macro-regiao`

#### Scenario: Macro região inexistente
- **WHEN** a página de edição recebe `404` ao carregar a macro região
- **THEN** exibe toast informando que a macro região não foi encontrada e redireciona para `/dashboard/macro-regiao`

#### Scenario: Erro na edição
- **WHEN** a requisição de edição responde com erro
- **THEN** a página exibe toast destrutivo com a mensagem retornada e permanece no formulário
