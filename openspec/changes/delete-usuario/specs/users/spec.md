# Spec Delta

## Purpose

Permite ao administrador gerenciar o ciclo de vida dos usuários do dashboard, incluindo a exclusão de usuários pela interface e pela API interna de proxy.

## ADDED Requirements

### Requirement: Excluir usuário via API interna
O sistema SHALL expor `DELETE /api/ambrosio/user/[id]`, que repassa a operação para `DELETE {ambrosio}/users/:id` na API externa Ambrosio enviando o token da sessão no header `Authorization` como Bearer, e refletir o status e a mensagem retornados pela API externa.

#### Scenario: ID ausente
- **WHEN** é feita uma chamada `DELETE /api/ambrosio/user` sem informar o `id`
- **THEN** a rota interna responde `400` com a mensagem "ID do usuário é obrigatório"

#### Scenario: Exclusão bem-sucedida
- **WHEN** o administrador chama `DELETE /api/ambrosio/user/[id]` e a API externa responde com sucesso
- **THEN** a rota interna retorna o mesmo status de sucesso com o corpo de resposta da API externa

#### Scenario: Usuário não encontrado
- **WHEN** a API externa responde `404` para a exclusão
- **THEN** a rota interna responde `404` com a mensagem "Usuário não encontrado"

#### Scenario: Sem permissão
- **WHEN** a API externa responde `401` ou `403` para a exclusão
- **THEN** a rota interna responde o mesmo status com uma mensagem informando que não há permissão para excluir o usuário

#### Scenario: Erro da API externa
- **WHEN** a API externa responde com outro status de erro
- **THEN** a rota interna responde esse status com a mensagem de erro retornada pela API externa (ou uma mensagem genérica quando não houver corpo)

### Requirement: Excluir usuário pela página de detalhes
O sistema SHALL exibir na página `/dashboard/usuarios/[id]` uma ação "Excluir usuário" que solicita confirmação antes de enviar `DELETE /api/ambrosio/user/[id]`, exibe feedback de sucesso ou erro via toast e redireciona para `/dashboard/usuarios` após a exclusão bem-sucedida.

#### Scenario: Exclusão confirmada com sucesso
- **WHEN** o administrador clica em "Excluir usuário" e confirma a exclusão
- **THEN** a página envia `DELETE /api/ambrosio/user/[id]` e, em caso de sucesso, exibe um toast de sucesso e redireciona para `/dashboard/usuarios`

#### Scenario: Exclusão cancelada
- **WHEN** o administrador clica em "Excluir usuário" e cancela o diálogo de confirmação
- **THEN** a página não envia nenhuma requisição de exclusão

#### Scenario: Erro ao excluir
- **WHEN** a exclusão responde com erro
- **THEN** a página exibe um toast de erro com a mensagem retornada e permanece na página do usuário sem redirecionar

#### Scenario: Requisição em andamento
- **WHEN** a requisição de exclusão está em andamento
- **THEN** a página impede novas submissões até a requisição terminar

### Requirement: Impedir auto-exclusão
O sistema SHALL não disponibilizar a ação "Excluir usuário" quando o usuário na página é o próprio usuário logado no dashboard.

#### Scenario: Próprio perfil
- **WHEN** o administrador abre a página do usuário logado atualmente
- **THEN** a ação "Excluir usuário" não é exibida nem pode ser acionada

#### Scenario: Perfil de outro usuário
- **WHEN** o administrador abre a página de um usuário diferente do logado
- **THEN** a ação "Excluir usuário" é exibida normalmente
