# setores Specification

## Purpose

Permite ao usuário administrativo cadastrar e editar setores no dashboard, mantendo o vínculo obrigatório com uma região e a situação ativo/inativo do registro.

## Requirements

### Requirement: Cadastrar setor pela API interna
O sistema SHALL expor `POST /api/ambrosio/setor`, que valida a presença de `descricao` e `regiaoId`, repassa a operação para `POST {ambrosio}/setor` com o corpo `{ descricao, regiao: { id }, ativo }` e o token da sessão no header `Authorization` como Bearer, e reflete o status retornado pela API externa.

#### Scenario: Cadastro bem-sucedido
- **WHEN** o usuário autorizado envia `POST /api/ambrosio/setor` com descrição válida e uma região existente
- **THEN** a rota interna responde `201` com o setor criado retornado pela API externa

#### Scenario: Dados inválidos
- **WHEN** a API externa rejeita a requisição por descrição ausente/longa ou região inválida
- **THEN** a rota interna responde com o mesmo status de erro e com a mensagem retornada pela API externa

#### Scenario: Sem permissão para cadastrar
- **WHEN** a API externa responde `401` ou `403` ao cadastro
- **THEN** a rota interna responde o mesmo status com uma mensagem informando que não há permissão para cadastrar setor

#### Scenario: Erro inesperado da API externa
- **WHEN** a API externa responde com outro status de erro
- **THEN** a rota interna responde esse status com a mensagem de erro normalizada

### Requirement: Editar setor pela API interna
O sistema SHALL expor `GET /api/ambrosio/setor/[id]` e `PATCH /api/ambrosio/setor/[id]`. O `GET` SHALL retornar o setor com sua região; o `PATCH` SHALL aceitar atualização parcial de `descricao`, `regiaoId` e `ativo`, repassando para `PATCH {ambrosio}/setor/:id` com o token da sessão.

#### Scenario: Leitura de setor existente
- **WHEN** o usuário solicita `GET /api/ambrosio/setor/[id]` para um setor existente
- **THEN** a rota interna responde `200` com os dados do setor, incluindo a região vinculada

#### Scenario: Setor não encontrado
- **WHEN** o `GET` ou o `PATCH` recebe `404` da API externa
- **THEN** a rota interna responde `404` com a mensagem "Setor não encontrado"

#### Scenario: Edição bem-sucedida
- **WHEN** o usuário autorizado envia `PATCH /api/ambrosio/setor/[id]` com descrição e/ou região válidas
- **THEN** a rota interna responde `200` com o setor atualizado retornado pela API externa

#### Scenario: Sem permissão para editar
- **WHEN** a API externa responde `401` ou `403` à edição
- **THEN** a rota interna responde o mesmo status com uma mensagem informando que não há permissão para editar setor

### Requirement: Cadastrar setor pelo dashboard
O sistema SHALL disponibilizar a página `/dashboard/setores/novo` com formulário validado por schema contendo descrição, seleção obrigatória de região e alternador "Ativo" (padrão ligado). Ao salvar com sucesso, SHALL exibir toast de confirmação e redirecionar para `/dashboard/setores`.

#### Scenario: Cadastro concluído pela interface
- **WHEN** o usuário autorizado preenche descrição e região válidas e envia o formulário
- **THEN** a página envia `POST /api/ambrosio/setor`, exibe toast de sucesso e navega para `/dashboard/setores`

#### Scenario: Validação local impede envio incompleto
- **WHEN** o usuário tenta enviar sem descrição válida ou sem região selecionada
- **THEN** o formulário exibe mensagens de validação e não envia requisição

#### Scenario: Erro no cadastro
- **WHEN** a requisição de cadastro responde com erro
- **THEN** a página exibe toast destrutivo com a mensagem retornada e permanece no formulário

#### Scenario: Requisição em andamento
- **WHEN** o cadastro está sendo enviado
- **THEN** o botão de salvar fica desabilitado até a resposta

### Requirement: Editar setor pelo dashboard
O sistema SHALL disponibilizar a página `/dashboard/setores/[id]` que carrega o setor existente, preenche o formulário com seus dados e permite salvar alterações. Ao salvar com sucesso, SHALL exibir toast de confirmação e redirecionar para `/dashboard/setores`.

#### Scenario: Edição concluída pela interface
- **WHEN** o usuário autorizado altera a descrição, a região ou a situação e envia o formulário
- **THEN** a página envia `PATCH /api/ambrosio/setor/[id]`, exibe toast de sucesso e navega para `/dashboard/setores`

#### Scenario: Setor inexistente
- **WHEN** a página de edição recebe `404` ao carregar o setor
- **THEN** exibe toast informando que o setor não foi encontrado e redireciona para `/dashboard/setores`

#### Scenario: Erro na edição
- **WHEN** a requisição de edição responde com erro
- **THEN** a página exibe toast destrutivo com a mensagem retornada e permanece no formulário
