# Spec Delta

## ADDED Requirements

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
