# comunidade/pessoa Specification

## Purpose

Permite cadastrar uma pessoa diretamente a partir da página de uma comunidade, já associando-a àquela comunidade no mesmo fluxo de cadastro, repassando o `comunidadeId` à API ambrosio.

## Requirements

### Requirement: Botão para cadastrar pessoa no card "Carismas da comunidade"
O sistema SHALL exibir um botão "Cadastrar pessoa" no card "Carismas da comunidade" da página `/dashboard/comunidades/{id}`, independentemente de a comunidade possuir ou não carismas registrados.

#### Scenario: Comunidade com carismas
- **WHEN** a página `/dashboard/comunidades/{id}` é exibida e a comunidade possui carismas
- **THEN** o card "Carismas da comunidade" exibe o botão "Cadastrar pessoa"

#### Scenario: Comunidade sem carismas
- **WHEN** a página `/dashboard/comunidades/{id}` é exibida e a comunidade não possui carismas (array vazio ou ausente)
- **THEN** o card "Carismas da comunidade" ainda assim exibe o botão "Cadastrar pessoa"

### Requirement: Redirecionar ao cadastro de pessoa com o comunidadeId
O sistema SHALL, ao clicar no botão "Cadastrar pessoa" do card "Carismas da comunidade", navegar para a página de novo cadastro de pessoa (`/dashboard/pessoas/novo`) incluindo o query param `comunidadeId` com o id da comunidade atual.

#### Scenario: Clicar no botão "Cadastrar pessoa"
- **WHEN** o usuário clica no botão "Cadastrar pessoa" na página `/dashboard/comunidades/{id}`
- **THEN** o sistema navega para `/dashboard/pessoas/novo?comunidadeId={id}`

### Requirement: Cadastro de pessoa preservado quando não há comunidadeId
O sistema SHALL manter o cadastro de pessoa existente funcionando como hoje, de modo que, quando a página `/dashboard/pessoas/novo` é acessada sem o query param `comunidadeId` (fluxo normal), o formulário se comporta exatamente como antes e a requisição de criação não inclui o parâmetro `comunidadeId`.

#### Scenario: Acessar o cadastro normalmente
- **WHEN** o usuário acessa `/dashboard/pessoas/novo` sem o query param `comunidadeId`
- **THEN** o formulário de cadastro é exibido normalmente
- **AND** a submissão do formulário envia a criação de pessoa à API ambrosio sem o query param `comunidadeId`

### Requirement: Repassar o comunidadeId ao endpoint de criação de pessoa
O sistema SHALL repassar o query param `comunidadeId` lido da URL à API ambrosio como query param na requisição `POST` de criação de pessoa (`{baseUrl}/api/ambrosio/pessoa`), quando tal param estiver presente.

#### Scenario: Submeter cadastro com comunidadeId presente
- **WHEN** o usuário acessa `/dashboard/pessoas/novo?comunidadeId={id}` e submete o formulário de cadastro de pessoa
- **THEN** o sistema envia a requisição `POST` ao endpoint da API ambrosio incluindo o query param `comunidadeId={id}`
- **AND** a pessoa cadastrada é associada à comunidade correspondente

#### Scenario: Submeter cadastro sem comunidadeId
- **WHEN** o usuário acessa `/dashboard/pessoas/novo` sem o query param `comunidadeId` e submete o formulário
- **THEN** o sistema envia a requisição `POST` ao endpoint da API ambrosio sem o query param `comunidadeId`