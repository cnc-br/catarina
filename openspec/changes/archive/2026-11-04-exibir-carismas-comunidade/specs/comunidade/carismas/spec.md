# Spec Delta

## Purpose

Exibe os carismas de uma comunidade e seus respectivos membros/equipe no dashboard, apresentando o nome de cada carisma em destaque com as pessoas associadas, agrupando sempre marido e mulher na mesma linha.

## ADDED Requirements

### Requirement: Exibir carismas da comunidade no card
O sistema SHALL renderizar no card "Carismas da comunidade" da página `/dashboard/comunidades/{id}` os carismas retornados em `comunidade.carismas`, substituindo o texto placeholder "Em breve carismas da comunidade".

#### Scenario: Comunidade possui carismas
- **WHEN** a comunidade carregada possui carismas registrados em `comunidade.carismas`
- **THEN** o card exibe a listagem desses carismas no lugar do texto placeholder

#### Scenario: Comunidade não possui carismas
- **WHEN** a comunidade carregada não possui carismas registrados em `comunidade.carismas` (array vazio ou ausente)
- **THEN** o card exibe uma mensagem indicando que nenhum carisma foi cadastrado para a comunidade

### Requirement: Nome do carisma em destaque com pessoas abaixo
O sistema SHALL exibir, para cada carisma, o seu nome (`descricao`) em destaque e, abaixo do nome, a lista das pessoas/equipe associadas (`pessoas`).

#### Scenario: Renderizar carisma com membros
- **WHEN** um carisma possui pessoas associadas
- **THEN** o sistema exibe o nome do carisma em destaque
- **AND** lista os nomes das pessoas associadas abaixo do nome do carisma

#### Scenario: Carisma sem pessoas associadas
- **WHEN** um carisma não possui pessoas associadas (array `pessoas` vazio)
- **THEN** o sistema exibe apenas o nome do carisma em destaque, sem linhas de pessoas

### Requirement: Renderizar casal juntos na mesma linha
O sistema SHALL renderizar o marido e a mulher de um casal juntos na mesma linha: quando uma pessoa associada a um carisma possui cônjuge (`conjugue`), o sistema exibe o nome da pessoa e o nome do cônjuge lado a lado na mesma linha; pessoas sem cônjuge SHALL ser exibidas sozinhas em uma linha.

#### Scenario: Pessoa com conjugue
- **WHEN** uma pessoa associada a um carisma possui um `conjugue`
- **THEN** o sistema exibe o nome da pessoa e o nome do cônjuge juntos na mesma linha

#### Scenario: Pessoa sem conjugue
- **WHEN** uma pessoa associada a um carisma não possui `conjugue`
- **THEN** o sistema exibe apenas o nome da pessoa em uma linha

### Requirement: Nome da pessoa clicável como link para a página da pessoa
O sistema SHALL tornar o nome de cada pessoa associada a um carisma clicável, navegando para a página da pessoa (`/dashboard/pessoas/{id}`). Quando a pessoa possui cônjuge, tanto o nome da pessoa quanto o nome do cônjuge SHALL ser links individuais para suas respectivas páginas (`/dashboard/pessoas/{id}` de cada um).

#### Scenario: Clicar no nome de uma pessoa solteira
- **WHEN** o usuário clica no nome de uma pessoa associada a um carisma que não possui cônjuge
- **THEN** o sistema navega para `/dashboard/pessoas/{id}` daquela pessoa

#### Scenario: Clicar no nome de uma pessoa de um casal
- **WHEN** o usuário clica no nome da pessoa ou no nome do cônjuge exibidos juntos na mesma linha
- **THEN** o sistema navega para `/dashboard/pessoas/{id}` correspondente a cada nome clicado