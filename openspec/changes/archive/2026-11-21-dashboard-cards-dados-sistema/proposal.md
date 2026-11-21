# Proposal

## Why

A página inicial `/dashboard` hoje exibe apenas o card de boas-vindas, o alerta de perfil não identificado e os avisos. O usuário precisa navegar por cada listagem para descobrir o volume de pessoas, paróquias, comunidades e usuários cadastrados. O Ambrosio já expõe `GET /dashboard` com um resumo agregado do sistema; falta consumi-lo e transformar esse resumo em uma visão inicial útil.

## What Changes

- Consumir `GET {ambrosio}/dashboard` no Server Component de `/dashboard`, enviando o token do cookie `token` como Bearer, com `cache: "no-store"`.
- Reorganizar `/dashboard` em uma hierarquia clara: boas-vindas e avisos preservados no topo, seguidos da nova seção "Dados do sistema".
- Converter o card de boas-vindas em um cabeçalho compacto com `H1` "Bem-vindo!" e um subtítulo na mesma linha contendo e-mail e badge de perfil, reduzindo a distância até os indicadores.
- Adicionar seis cards de KPI para pessoas, paróquias, dioceses, comunidades, equipes e carismas, com detalhamento leve:
  - Pessoas: total, ativas/inativas e barra de proporção.
  - Carismas: total e vínculos.
- Adicionar dois cards de detalhamento: "Pessoas por situação" e "Usuários por papel", com barras e legenda numérica. O total de usuários e a distribuição por papel (`ADMIN`, `SECRETARIA_PAROQUIA`, `NAO_IDENTIFICADO`) ficam concentrados no card "Usuários por papel".
- Exibir os cards para todos os usuários autenticados; a autorização e o escopo dos números continuam sendo responsabilidade do Ambrosio.
- Tratar falha da API sem derrubar a página: manter boas-vindas e avisos e exibir um aviso compacto de indisponibilidade dos dados.
- Usar como referência visual o mockup gerado no OpenDesign para este change (projeto `cnc-dashboard-dados-sistema`), reproduzindo o resultado com os componentes shadcn/ui já existentes (`Card`, `Badge`, `Alert`, `Progress`).

## Capabilities

### New Capabilities

- `dashboard`: visão geral da página inicial do dashboard, incluindo o consumo do resumo agregado do Ambrosio, os cards de indicadores e o comportamento de fallback quando os dados não estão disponíveis.

### Modified Capabilities

Nenhuma. A mudança é aditiva e não altera requisitos de `users`, `paroquias`, `pessoa` ou das demais capabilities existentes.

## Impact

- **UI**: `src/app/dashboard/page.tsx` reorganizada e novos componentes de apresentação em `src/components/custom/dashboard/overview/`.
- **API externa**: novo consumo de `GET /dashboard` do Ambrosio com Bearer token da sessão. Nenhuma rota de proxy interna nova é necessária, pois a leitura ocorre no servidor.
- **Dependências**: nenhuma nova; usa `Card`, `Badge`, `Alert`, `Progress` e ícones `lucide-react` já instalados.
- **Sem quebras**: o bloco de boas-vindas mantém e-mail e papel do usuário, agora em cabeçalho compacto; o alerta de `NAO_IDENTIFICADO` e os avisos permanecem com o comportamento atual.
- **Fora de escopo**: filtros por paróquia/região, gráficos interativos, exportação de relatórios e qualquer alteração no endpoint do Ambrosio.
