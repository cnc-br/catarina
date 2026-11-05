# pessoa-vinculos Specification

## Purpose

Define como a página de detalhe da pessoa reflete, sem recarregamento manual, os vínculos de cônjuge e de comunidade criados a partir dos seus próprios cards.

## Requirements

### Requirement: Atualizar dados da pessoa após vincular cônjuge
O sistema SHALL recarregar os dados da pessoa na página `/dashboard/pessoas/[id]` após o vínculo de cônjuge ser concluído com sucesso, exibindo o nome do cônjuge no card "Conjugue" sem exigir recarregamento manual da página.

#### Scenario: Vínculo de cônjuge realizado com sucesso
- **WHEN** o usuário vincula um cônjuge pelo dialog do card "Conjugue" e a requisição responde com sucesso
- **THEN** o sistema recarrega os dados da pessoa
- **AND** o card "Conjugue" passa a exibir o nome do cônjuge vinculado
- **AND** a ação de vincular cônjuge deixa de ser exibida nesse card

#### Scenario: Mensagem de sucesso sem instrução de recarregamento
- **WHEN** o vínculo de cônjuge é concluído com sucesso
- **THEN** a mensagem de sucesso exibida ao usuário não instrui a atualizar a página

### Requirement: Atualizar dados da pessoa após associar comunidade
O sistema SHALL recarregar os dados da pessoa na página `/dashboard/pessoas/[id]` após a associação a uma comunidade ser concluída com sucesso, exibindo os dados da comunidade no card "Comunidade" sem exigir recarregamento manual da página.

#### Scenario: Associação a comunidade realizada com sucesso
- **WHEN** o usuário associa a pessoa a uma comunidade pelo dialog "Informar comunidade" e a requisição responde com sucesso
- **THEN** o sistema recarrega os dados da pessoa
- **AND** o card "Comunidade" passa a exibir a comunidade associada com paróquia, cidade e região
- **AND** o alerta "Sem comunidade" deixa de ser exibido

### Requirement: Preservar estado atual em caso de falha
O sistema SHALL NOT recarregar os dados da pessoa quando o vínculo de cônjuge ou a associação a comunidade falhar, mantendo os dados exibidos e apresentando o erro ao usuário.

#### Scenario: Falha ao vincular cônjuge
- **WHEN** o usuário tenta vincular um cônjuge e a requisição responde com erro
- **THEN** o sistema exibe um toast de erro
- **AND** os dados atuais do card "Conjugue" permanecem inalterados
- **AND** nenhuma recarga dos dados da pessoa é disparada

#### Scenario: Falha ao associar comunidade
- **WHEN** o usuário tenta associar a pessoa a uma comunidade e a requisição responde com erro
- **THEN** o sistema exibe um toast de erro
- **AND** os dados atuais do card "Comunidade" permanecem inalterados
- **AND** nenhuma recarga dos dados da pessoa é disparada
