# Spec Delta

## Purpose

Permitir a edição e atualização de registros de carisma na página de configurações do dashboard, incluindo a definição do flag `casalAndaJunto`, de forma integrada à listagem existente.

## ADDED Requirements

### Requirement: Abrir formulário de edição de carisma
O sistema SHALL disponibilizar uma ação na listagem de carismas da página de configurações (`src/app/dashboard/(configuracoes)/carismas/page.tsx`) que abre um Dialog contendo um formulário de edição do carisma selecionado.

#### Scenario: Abrir edição a partir da listagem
- **WHEN** o usuário aciona a ação de edição de um carisma na listagem
- **THEN** o sistema exibe um Dialog com o formulário de edição preenchido com os dados do carisma selecionado

#### Scenario: Fechar o formulário sem salvar
- **WHEN** o usuário fecha o Dialog sem submeter o formulário
- **THEN** o sistema descarta as alterações e retorna à listagem inalterada

### Requirement: Alternar casalAndaJunto
O sistema SHALL disponibilizar um controle do tipo toggle no formulário de edição de carisma para definir o valor de `casalAndaJunto`, conforme o tipo `Carisma` da biblioteca `neocatecumenal`.

#### Scenario: Ativar casalAndaJunto
- **WHEN** o usuário ativa o toggle `casalAndaJunto` e submete o formulário
- **THEN** o sistema envia o valor `true` para o campo `casalAndaJunto` na atualização do carisma

#### Scenario: Desativar casalAndaJunto
- **WHEN** o usuário desativa o toggle `casalAndaJunto` e submete o formulário
- **THEN** o sistema envia o valor `false` para o campo `casalAndaJunto` na atualização do carisma

### Requirement: Atualizar carisma via API
O sistema SHALL expor um endpoint de atualização que recebe o identificador do carisma ao final da rota (`src/app/api/ambrosio/configuracoes/carismas/{id}`) e persiste as alterações submetidas pelo formulário.

#### Scenario: Atualização bem-sucedida
- **WHEN** o formulário de edição é submetido com dados válidos
- **THEN** o sistema envia uma requisição de atualização para o endpoint com o `id` do carisma
- **AND** persiste os dados alterados no backend
- **AND** atualiza a listagem de carismas com os novos valores

#### Scenario: Erro de atualização
- **WHEN** a requisição de atualização falha no backend
- **THEN** o sistema exibe uma mensagem de erro ao usuário
- **AND** mantém o Dialog aberto com os dados informados para nova tentativa
