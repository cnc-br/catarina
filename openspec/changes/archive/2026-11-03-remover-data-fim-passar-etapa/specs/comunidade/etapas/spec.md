# Spec Delta

## Purpose

Gerencia a passagem de etapa de uma comunidade pelo dashboard, definindo quais informações são coletadas no dialog "Passar Comunidade de Etapa" e enviadas à API para persistência.

## ADDED Requirements

### Requirement: Passar Comunidade de Etapa não coleta data final da etapa
O sistema SHALL exibir no dialog "Passar Comunidade de Etapa" os campos de etapa, local da convivência, data da convivência (`dataInicio`) e observação, e SHALL NOT exibir ou permitir informar a data final da etapa (`dataFim`).

#### Scenario: Criar uma nova etapa de comunidade sem data final
- **WHEN** o usuário abre o dialog "Passar Comunidade de Etapa" para registrar uma nova etapa
- **THEN** não existe campo "Data final etapa" no formulário
- **AND** o formulário pode ser submetido com sucesso sem informar `dataFim`

#### Scenario: Editar uma etapa existente sem data final
- **WHEN** o usuário abre o dialog para editar uma etapa já registrada
- **THEN** não existe campo "Data final etapa" no formulário
- **AND** o dado `dataFim` persistido anteriormente não é preenchido no formulário

### Requirement: API interna não envia data final ao salvar etapa de comunidade
O sistema SHALL enviar à API externa Ambrosio o payload de criação (`POST`) e atualização (`PATCH`) da etapa de uma comunidade sem incluir `dataFim`.

#### Scenario: Criar etapa sem data final
- **WHEN** o sistema envia `POST /api/ambrosio/comunidade/{comunidadeId}/etapa`
- **THEN** o corpo da requisição não contém a propriedade `dataFim`

#### Scenario: Atualizar etapa sem data final
- **WHEN** o sistema envia `PATCH /api/ambrosio/comunidade/{comunidadeId}/etapa/{etapaComunidadeId}`
- **THEN** o corpo da requisição não contém a propriedade `dataFim`

### Requirement: Sistema não lê nem exibe data final da etapa
O sistema SHALL NOT ler nem exibir `dataFim` ao carregar ou listar as etapas de uma comunidade, uma vez que a propriedade foi removida da lib, do backend e do banco de dados.

#### Scenario: Carregar comunidade sem data final
- **WHEN** o sistema carrega os dados de uma comunidade pelo hook `useComunidadeById`
- **THEN** nenhuma leitura ou normalização de `dataFim` é feita nas etapas da comunidade

#### Scenario: Listar etapas de uma comunidade
- **WHEN** a página de detalhes `/dashboard/comunidades/{id}` renderiza a listagem de etapas da comunidade
- **THEN** a linha de cada etapa exibe apenas a data de início da convivência, sem apresentar data final