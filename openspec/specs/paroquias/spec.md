# paroquias Specification

## Purpose

Permite ao administrador gerenciar o ciclo de vida das paróquias no dashboard, incluindo a exclusão de paróquias pela interface e pela API interna de proxy.

## Requirements

### Requirement: Excluir paróquia via API interna
O sistema SHALL expor `DELETE /api/ambrosio/paroquia/[id]`, que repassa a operação para `DELETE {ambrosio}/paroquia/:id` na API externa Ambrosio enviando o token da sessão no header `Authorization` como Bearer, e refletir o status e a mensagem retornados pela API externa.

#### Scenario: Exclusão bem-sucedida
- **WHEN** o administrador chama `DELETE /api/ambrosio/paroquia/[id]` e a API externa responde com sucesso
- **THEN** a rota interna retorna o mesmo status de sucesso com o corpo de resposta da API externa

#### Scenario: Paróquia não encontrada
- **WHEN** a API externa responde `404` para a exclusão
- **THEN** a rota interna responde `404` com a mensagem "Paróquia não encontrada"

#### Scenario: Sem permissão
- **WHEN** a API externa responde `401` ou `403` para a exclusão
- **THEN** a rota interna responde o mesmo status com uma mensagem informando que não há permissão para excluir a paróquia

#### Scenario: Erro da API externa
- **WHEN** a API externa responde com outro status de erro
- **THEN** a rota interna responde esse status com a mensagem de erro retornada pela API externa

### Requirement: Excluir paróquia pela página de detalhes
O sistema SHALL exibir na página `/dashboard/paroquias/[id]` uma ação "Excluir paróquia" que solicita confirmação antes de enviar `DELETE /api/ambrosio/paroquia/[id]`, exibe feedback de sucesso ou erro via toast e redireciona para `/dashboard/paroquias` após a exclusão bem-sucedida.

#### Scenario: Exclusão confirmada com sucesso
- **WHEN** o administrador clica em "Excluir paróquia" e confirma a exclusão
- **THEN** a página envia `DELETE /api/ambrosio/paroquia/[id]` e, em caso de sucesso, exibe um toast de sucesso e redireciona para `/dashboard/paroquias`

#### Scenario: Exclusão cancelada
- **WHEN** o administrador clica em "Excluir paróquia" e cancela o diálogo de confirmação
- **THEN** a página não envia nenhuma requisição de exclusão

#### Scenario: Erro ao excluir
- **WHEN** a exclusão responde com erro
- **THEN** a página exibe um toast de erro com a mensagem retornada e permanece na página da paróquia sem redirecionar

#### Scenario: Requisição em andamento
- **WHEN** a requisição de exclusão está em andamento
- **THEN** a página impede novas submissões até a requisição terminar
