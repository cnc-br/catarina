# Spec Delta

## Purpose

Exibe na página inicial do dashboard uma visão agregada do cadastro do sistema, consumida do Ambrosio, para que o usuário autenticado entenda o volume de pessoas, paróquias, comunidades, equipes, carismas e usuários sem navegar por cada listagem.

## ADDED Requirements

### Requirement: Carregar o resumo agregado do sistema
A página `/dashboard` SHALL, durante a renderização no servidor, requisitar `GET {ambrosio}/dashboard` com o token do cookie `token` no header `Authorization` como Bearer e sem cache, e usar o corpo da resposta como fonte dos indicadores.

#### Scenario: Resumo carregado com sucesso
- **WHEN** a página `/dashboard` é renderizada e o Ambrosio responde `200` com o payload de resumo
- **THEN** a seção "Dados do sistema" é exibida com os valores retornados

#### Scenario: Sessão sem token
- **WHEN** a página `/dashboard` é renderizada sem cookie `token`
- **THEN** a seção "Dados do sistema" não é exibida e a página mantém boas-vindas e avisos

#### Scenario: Resposta de erro do Ambrosio
- **WHEN** o Ambrosio responde com status diferente de `2xx` ou a requisição falha
- **THEN** a página exibe um aviso de indisponibilidade dos dados do sistema e permanece funcional

### Requirement: Exibir cards de indicadores totais
A seção "Dados do sistema" SHALL exibir um card para cada indicador do payload — pessoas, paróquias, dioceses, comunidades, equipes e carismas — mostrando o número total com rótulo em português e ícone correspondente, para todos os usuários autenticados. O total de usuários é exibido no card "Usuários por papel", não em um card de KPI próprio.

#### Scenario: Seis indicadores presentes
- **WHEN** o payload contém `pessoas.total = 100`, `paroquias = 12`, `dioceses = 2`, `comunidades = 30`, `equipes = 8` e `carismas.total = 4`
- **THEN** são exibidos seis cards com os valores 100, 12, 2, 30, 8 e 4, respectivamente

#### Scenario: Total de usuários visível na distribuição
- **WHEN** o payload contém `usuarios.total = 5`
- **THEN** o card "Usuários por papel" exibe "5 usuários no total", sem um card de KPI separado para usuários

#### Scenario: Indicador zerado
- **WHEN** um indicador do payload é `0`
- **THEN** o card correspondente exibe `0` em vez de ocultar o card ou mostrar valor vazio

### Requirement: Detalhar pessoas por situação
O card de pessoas SHALL exibir, além do total, as quantidades de pessoas ativas e inativas e uma barra de proporção entre as duas situações.

#### Scenario: Pessoas ativas e inativas
- **WHEN** o payload contém `pessoas = { total: 100, ativas: 90, inativas: 10 }`
- **THEN** o card exibe "100" como total e "90 ativas · 10 inativas", com a barra proporcional a 90% e 10%

#### Scenario: Nenhuma pessoa cadastrada
- **WHEN** o payload contém `pessoas = { total: 0, ativas: 0, inativas: 0 }`
- **THEN** o card exibe `0` e a barra de proporção fica vazia, sem erro de divisão por zero

### Requirement: Detalhar carismas e vínculos
O card de carismas SHALL exibir o total de carismas e a quantidade de vínculos informada em `carismas.vinculos`.

#### Scenario: Carismas com vínculos
- **WHEN** o payload contém `carismas = { total: 4, vinculos: 15 }`
- **THEN** o card exibe "4" como total e "15 vínculos" como informação secundária

### Requirement: Exibir distribuição de usuários por papel
O card "Usuários por papel" SHALL exibir o total de usuários e a quantidade de usuários para cada papel retornado em `usuarios.porPapel`, incluindo papéis com valor `0`, usando os rótulos `ADMIN`, `SECRETARIA_PAROQUIA` e `NAO_IDENTIFICADO`.

#### Scenario: Distribuição completa
- **WHEN** o payload contém `usuarios = { total: 5, porPapel: { ADMIN: 3, SECRETARIA_PAROQUIA: 2, NAO_IDENTIFICADO: 0 } }`
- **THEN** o card exibe "5 usuários no total" e uma linha por papel com as quantidades "3 ADMIN", "2 SECRETARIA_PAROQUIA" e "0 NAO_IDENTIFICADO"

#### Scenario: Papel adicional no payload
- **WHEN** `usuarios.porPapel` contém um papel além dos três conhecidos
- **THEN** o card exibe o papel adicional com seu respectivo valor, sem descartar os demais

### Requirement: Exibir cards de detalhamento
A página `/dashboard` SHALL exibir, abaixo dos cards de indicadores, os cards "Pessoas por situação" e "Usuários por papel", com barras, valores absolutos e percentuais quando aplicáveis.

#### Scenario: Detalhamento de pessoas
- **WHEN** existem pessoas ativas e inativas no payload
- **THEN** o card "Pessoas por situação" exibe barra segmentada com legenda contendo quantidade e percentual de cada situação

#### Scenario: Detalhamento de usuários
- **WHEN** o payload informa `usuarios.porPapel`
- **THEN** o card "Usuários por papel" exibe uma linha por papel, com nome, quantidade e barra proporcional ao total

### Requirement: Preservar o conteúdo atual da página inicial
A reorganização de `/dashboard` SHALL manter o bloco de boas-vindas com o título "Bem-vindo!", o e-mail e o papel do usuário, o alerta de perfil `NAO_IDENTIFICADO` e a listagem de avisos com data de validade, sem alterar seus critérios de exibição.

#### Scenario: Boas-vindas em cabeçalho compacto
- **WHEN** a página `/dashboard` é renderizada para um usuário autenticado
- **THEN** o bloco de boas-vindas é exibido como um `H1` "Bem-vindo!" seguido, na linha abaixo, do e-mail e do badge com o perfil do usuário

#### Scenario: Usuário administrador com avisos
- **WHEN** o usuário autenticado possui papel `ADMIN` e existem avisos vigentes
- **THEN** a página exibe boas-vindas, os avisos e a seção "Dados do sistema", sem o alerta de perfil não identificado

#### Scenario: Usuário não identificado
- **WHEN** o usuário autenticado possui papel `NAO_IDENTIFICADO`
- **THEN** a página exibe o alerta "Atenção!" com a orientação para aguardar autorização, além dos demais blocos aplicáveis

### Requirement: Apresentar a seção sem quebrar em telas pequenas
A seção "Dados do sistema" SHALL organizar os cards em grade responsiva, com uma coluna em telas pequenas e múltiplas colunas em telas maiores, sem overflow horizontal ou sobreposição de texto.

#### Scenario: Visualização em tela pequena
- **WHEN** a página é exibida em largura inferior a 640px
- **THEN** os cards são empilhados em uma coluna e os números e rótulos permanecem legíveis sem rolagem horizontal

#### Scenario: Visualização em desktop
- **WHEN** a página é exibida em largura igual ou superior a 1280px
- **THEN** os cards ocupam uma grade de múltiplas colunas na mesma linha ou em poucas linhas
