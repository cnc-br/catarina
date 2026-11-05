# Proposal

## Why

A página de detalhes de uma comunidade (`/dashboard/comunidades/{id}`) exibe o card "Carismas da comunidade" apenas com o texto placeholder "Em breve carismas da comunidade". O objeto `Comunidade` retornado pela lib `neocatecumenal` (via hook `useComunidadeById`) já traz os carismas da comunidade (`comunidade.carismas`), então os dados estão disponíveis sem mudanças de API, mas ainda não são renderizados. O usuário quer começar a exibir essas informações no card da página.

## What Changes

- Substituir o placeholder "Em breve carismas da comunidade" no card "Carismas da comunidade" da página `/dashboard/comunidades/{id}` pela exibição dos carismas retornados em `comunidade.carismas`.
- Para cada carisma, exibir o nome do carisma (`descricao`) em destaque e, abaixo dele, as pessoas/equipe associadas (`pessoas`).
- Renderizar sempre o marido e a mulher juntos na mesma linha: quando uma pessoa possui cônjuge (`conjugue`), exibi-los lado a lado (ex.: `Maria` e `José` na mesma linha); pessoas sem cônjuge aparecem sozinhas em sua linha.
- Tornar o nome de cada pessoa clicável, navegando para a página da pessoa (`/dashboard/pessoas/{id}`); no caso de casal, cada nome (pessoa e cônjuge) é um link individual para sua própria página.
- Exibir um estado vazio quando a comunidade não possuir carismas registrados (ex.: "Nenhum carisma cadastrado para esta comunidade").

## Capabilities

### New Capabilities
- `comunidade/carismas`: Capacidade de exibir os carismas de uma comunidade e seus respectivos membros/equipe no dashboard, garantindo que casais sejam renderizados juntos na mesma linha.

### Modified Capabilities
- Nenhuma alteração de requisito em capability existente. A capability `comunidade/etapas` permanece inalterada.

## Impact

- **Código afetado**: `src/app/dashboard/comunidades/[id]/page.tsx` (card "Carismas da comunidade").
- **Dependências usadas**: tipos da lib `neocatecumenal` — `Comunidade`, `ComunidadeCarisma` (já disponíveis via `useComunidadeById`).
- **Comportamento**: somente exibição/UI; nenhuma mudança de API, persistência ou contrato de dados, uma vez que a lib já retorna os carismas.