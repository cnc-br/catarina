# pessoa-contato Specification

## Purpose

Permite cadastrar e visualizar os dados de contato de uma pessoa no dashboard (telefones, e-mail, observação), persistindo-os na API externa Ambrosio.

## Requirements

### Requirement: Listar contatos no GET da rota de pessoa
O sistema SHALL incluir o campo `contatos` no retorno do `GET /api/ambrosio/pessoa/[id]`, contendo um array de objetos com os contatos da pessoa conforme devolvidos pela API externa `GET {ambrosio}/pessoas/:id`.

#### Scenario: Pessoa possui contatos cadastrados
- **WHEN** um usuário consulta `GET /api/ambrosio/pessoa/[id]` e a API externa retorna `contatos` com os contatos da pessoa
- **THEN** a resposta da rota contém `contatos` com os contatos devolvidos pela API externa

#### Scenario: Pessoa sem contatos
- **WHEN** um usuário consulta `GET /api/ambrosio/pessoa/[id]` e a API externa retorna `contatos` ausente ou vazio
- **THEN** a resposta da rota contém `contatos` como array vazio

### Requirement: Cadastrar contato de pessoa via POST
O sistema SHALL expor a rota `POST /api/ambrosio/pessoa/[id]/contato` que repassa a criação para `POST {ambrosio}/pessoas/:id/contato`, enviando no body os campos da interface `PessoaContato` — `tipoTelefone` e `telefone` (obrigatórios), `email`, `observacao` e `contatoPrincipal` (opcionais) — com `tipoTelefone` restrito aos valores `CELULAR`, `RESIDENCIAL` ou `COMERCIAL`, e refletir o status e a mensagem retornados pela API externa.

#### Scenario: Cadastro bem-sucedido
- **WHEN** um usuário envia `POST /api/ambrosio/pessoa/[id]/contato` com `tipoTelefone` (um dos valores do enum), `telefone` e os demais campos da `PessoaContato` e a API externa aceita com sucesso
- **THEN** a rota responde com sucesso, confirmando a criação do contato

#### Scenario: E-mail com formato inválido
- **WHEN** um usuário envia `POST /api/ambrosio/pessoa/[id]/contato` com `email` que não é um e-mail válido
- **THEN** a rota responde com erro de requisição inválida (400) e não chama a API externa

#### Scenario: Tipo de telefone inválido
- **WHEN** um usuário envia `POST /api/ambrosio/pessoa/[id]/contato` com `tipoTelefone` que não é `CELULAR`, `RESIDENCIAL` ou `COMERCIAL`
- **THEN** a rota responde com erro de requisição inválida (400) e não chama a API externa

#### Scenario: Pessoa não encontrada na API externa
- **WHEN** um usuário envia `POST /api/ambrosio/pessoa/[id]/contato` e a API externa responde 404
- **THEN** a rota responde com 404 indicando que a pessoa não foi encontrada

#### Scenario: Erro da API externa
- **WHEN** a API externa responde com outro status de erro para a criação do contato
- **THEN** a rota responde com esse status e a mensagem de erro retornada pela API externa

### Requirement: Exibir card de contatos na página da pessoa
O sistema SHALL exibir na página `/dashboard/pessoas/[id]` um card "Contatos" que, quando a pessoa possui contatos, lista os contatos retornados pelo GET (telefone com seu tipo, e-mail e observação de cada contato, com indicação do contato principal) e oferece a ação de cadastro e a ação de edição por contato; quando a pessoa não possui contatos, o card SHALL exibir a mensagem "Contatos dessa pessoa nao foi informada" mantendo a ação de cadastro disponível.

#### Scenario: Pessoa com contatos cadastrados
- **WHEN** um usuário abre a página de uma pessoa que possui contatos em `contatos`
- **THEN** o card lista cada contato com seu telefone (e tipo), e-mail e observação, indicando o contato principal quando houver, e oferece a ação de cadastrar um novo contato e a ação de editar cada contato listado

#### Scenario: Pessoa sem contatos cadastrados
- **WHEN** um usuário abre a página de uma pessoa com `contatos` vazio
- **THEN** o card exibe a mensagem "Contatos dessa pessoa nao foi informada" e mantém a ação de cadastro disponível

### Requirement: Cadastrar contato pelo dialog na página da pessoa
O sistema SHALL permitir realizar o cadastro de contato por um dialog aberto a partir do card "Contatos" da página `/dashboard/pessoas/[id]`, com o formulário de campos `tipoTelefone` (select com `CELULAR`, `RESIDENCIAL` e `COMERCIAL`), `telefone`, `email`, `observacao` e `contatoPrincipal`, validando o formato do e-mail e o `tipoTelefone`, enviando `POST /api/ambrosio/pessoa/[id]/contato` ao submeter e exibindo feedback de sucesso ou erro via toast.

#### Scenario: Cadastro realizado com sucesso
- **WHEN** um usuário abre o dialog, preenche o formulário com dados válidos e submete
- **THEN** o sistema envia o POST com os campos preenchidos e, em caso de sucesso, exibe um toast de sucesso, fecha o dialog e atualiza a listagem do card com o novo contato

#### Scenario: E-mail inválido no formulário
- **WHEN** um usuário informa um `email` em formato inválido e tenta submeter o formulário
- **THEN** o formulário exibe erro de validação no campo de e-mail e não envia nenhuma requisição

#### Scenario: Erro ao cadastrar contato
- **WHEN** a criação responde com erro
- **THEN** o dialog exibe um toast de erro com a mensagem retornada e permanece aberto, mantendo os dados preenchidos para nova tentativa

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

### Requirement: Selecionar DDI/país no dialog de contato
O sistema SHALL exibir no dialog de contato um combobox de país/DDI com busca, listando todos os países disponíveis, iniciando com Brasil (DDI `55`) selecionado por padrão e permitindo trocar o país antes de informar o telefone.

#### Scenario: Brasil selecionado por padrão
- **WHEN** um usuário abre o dialog de cadastro de contato
- **THEN** o combobox de DDI exibe o Brasil (`+55`) selecionado

#### Scenario: Trocar o país
- **WHEN** um usuário seleciona outro país no combobox de DDI
- **THEN** o combobox passa a exibir o país e o DDI escolhidos e o input de telefone passa a ser formatado conforme esse país

#### Scenario: Buscar país pelo nome ou DDI
- **WHEN** um usuário digita o nome de um país ou o seu DDI no combobox
- **THEN** a lista é filtrada para os países correspondentes

### Requirement: Formatar e persistir telefone com o DDI selecionado
O sistema SHALL formatar o número nacional conforme o país selecionado enquanto o usuário digita e, ao salvar, enviar `telefone` como a concatenação dos dígitos do DDI selecionado com os dígitos do número nacional, sem `+` (ex.: `5511987654321`). Ao editar, SHALL separar o `telefone` persistido em país/DDI e número nacional, assumindo Brasil quando o valor não indicar outro país.

#### Scenario: Salvar com o Brasil
- **WHEN** um usuário mantém o Brasil selecionado e informa o número nacional `11987654321` e submete
- **THEN** o campo `telefone` enviado é `5511987654321`

#### Scenario: Salvar com outro país
- **WHEN** um usuário seleciona um país com DDI `351` e informa um número nacional válido e submete
- **THEN** o campo `telefone` enviado é a concatenação `351` + dígitos do número nacional

#### Scenario: Editar contato salvo sem DDI (legado)
- **WHEN** um usuário abre a edição de um contato cujo `telefone` persistido é `11987654321`
- **THEN** o combobox exibe o Brasil e o input mostra o número nacional formatado a partir de `11987654321`

#### Scenario: Editar contato salvo com DDI
- **WHEN** um usuário abre a edição de um contato cujo `telefone` persistido é `5511987654321`
- **THEN** o combobox exibe o Brasil e o input mostra o número nacional `11987654321` formatado

#### Scenario: Limite de dígitos do número nacional
- **WHEN** um usuário tenta digitar mais dígitos do que o tamanho máximo do número nacional do país selecionado
- **THEN** o input não aceita os dígitos excedentes

#### Scenario: Telefone obrigatório
- **WHEN** um usuário tenta submeter o dialog com o número de telefone vazio
- **THEN** o formulário exibe erro de validação no campo de telefone e não envia nenhuma requisição
