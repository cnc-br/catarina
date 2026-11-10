# Spec Delta

## ADDED Requirements

### Requirement: Atualizar contato de pessoa via PATCH
O sistema SHALL expor a rota `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` que repassa a atualização para `PATCH {ambrosio}/pessoas/:id/contato/:contatoId`, enviando no body os campos da interface `PessoaContato` — `tipoTelefone` e `telefone` (obrigatórios), `email`, `observacao` e `contatoPrincipal` (opcionais) — com `tipoTelefone` restrito aos valores `CELULAR`, `RESIDENCIAL` ou `COMERCIAL`, e refletir o status e a mensagem retornados pela API externa.

#### Scenario: Atualização bem-sucedida
- **WHEN** um usuário envia `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` com `tipoTelefone` (um dos valores do enum), `telefone` e os demais campos da `PessoaContato` e a API externa aceita com sucesso
- **THEN** a rota responde com sucesso, confirmando a atualização do contato

#### Scenario: Tipo de telefone inválido
- **WHEN** um usuário envia `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` com `tipoTelefone` que não é `CELULAR`, `RESIDENCIAL` ou `COMERCIAL`
- **THEN** a rota responde com erro de requisição inválida (400) e não chama a API externa

#### Scenario: Telefone ausente
- **WHEN** um usuário envia `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` com `telefone` ausente ou vazio
- **THEN** a rota responde com erro de requisição inválida (400) e não chama a API externa

#### Scenario: E-mail com formato inválido
- **WHEN** um usuário envia `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` com `email` que não é um e-mail válido
- **THEN** a rota responde com erro de requisição inválida (400) e não chama a API externa

#### Scenario: Contato não encontrado na API externa
- **WHEN** um usuário envia `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` e a API externa responde 404
- **THEN** a rota responde com 404 indicando que o contato não foi encontrado

#### Scenario: Erro da API externa
- **WHEN** a API externa responde com outro status de erro para a atualização do contato
- **THEN** a rota responde com esse status e a mensagem de erro retornada pela API externa

### Requirement: Editar contato pelo dialog na página da pessoa
O sistema SHALL permitir editar um contato existente por um dialog aberto a partir do card "Contatos" da página `/dashboard/pessoas/[id]` ao acionar a ação de edição do contato, com o formulário (campos `tipoTelefone` — select com `CELULAR`, `RESIDENCIAL` e `COMERCIAL` —, `telefone`, `email`, `observacao` e `contatoPrincipal`) pré-preenchido com os dados do contato, enviando `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` ao submeter e exibindo feedback de sucesso ou erro via toast.

#### Scenario: Edição realizada com sucesso
- **WHEN** um usuário aciona a edição de um contato, altera os dados no formulário pré-preenchido e submete
- **THEN** o sistema envia o PATCH com os campos preenchidos e, em caso de sucesso, exibe um toast de sucesso, fecha o dialog e atualiza a listagem do card com os dados editados

#### Scenario: E-mail inválido no formulário
- **WHEN** um usuário informa um `email` em formato inválido e tenta submeter a edição do contato
- **THEN** o formulário exibe erro de validação no campo de e-mail e não envia nenhuma requisição

#### Scenario: Erro ao editar contato
- **WHEN** a atualização responde com erro
- **THEN** o dialog exibe um toast de erro com a mensagem retornada e permanece aberto, mantendo os dados preenchidos para nova tentativa

## MODIFIED Requirements

### Requirement: Exibir card de contatos na página da pessoa
O sistema SHALL exibir na página `/dashboard/pessoas/[id]` um card "Contatos" que, quando a pessoa possui contatos, lista os contatos retornados pelo GET (telefone com seu tipo, e-mail e observação de cada contato, com indicação do contato principal) e oferece a ação de cadastro e a ação de edição por contato; quando a pessoa não possui contatos, o card SHALL exibir a mensagem "Contatos dessa pessoa nao foi informada" mantendo a ação de cadastro disponível.

#### Scenario: Pessoa com contatos cadastrados
- **WHEN** um usuário abre a página de uma pessoa que possui contatos em `contatos`
- **THEN** o card lista cada contato com seu telefone (e tipo), e-mail e observação, indicando o contato principal quando houver, e oferece a ação de cadastrar um novo contato e a ação de editar cada contato listado

#### Scenario: Pessoa sem contatos cadastrados
- **WHEN** um usuário abre a página de uma pessoa com `contatos` vazio
- **THEN** o card exibe a mensagem "Contatos dessa pessoa nao foi informada" e mantém a ação de cadastro disponível
