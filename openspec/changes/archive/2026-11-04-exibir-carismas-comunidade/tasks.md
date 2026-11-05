# Tasks

## 1. Exibir carismas no card

- [x] 1.1 No arquivo `src/app/dashboard/comunidades/[id]/page.tsx`, substituir o placeholder "Em breve carismas da comunidade" no `CardContent` do card "Carismas da comunidade" pela renderização derivada de `comunidade.carismas`, e verificar (`npm run build`) que o arquivo compila sem erros de tipagem
- [x] 1.2 Implementar o estado vazio: quando `comunidade.carismas` for `undefined` ou array vazio, exibir uma mensagem ("Nenhum carisma cadastrado para esta comunidade"), e verificar manualmente em `/dashboard/comunidades/{id}` de uma comunidade sem carismas que a mensagem é exibida
- [x] 1.3 Para cada carisma, renderizar o nome (`descricao`) em destaque (ex.: `font-semibold`) e abaixo a lista de `pessoas`, e verificar manualmente que o nome de cada carisma aparece em destaque seguido dos membros

## 2. Agrupamento de casal na mesma linha

- [x] 2.1 Para cada pessoa de um carisma que possua `conjugue`, renderizar o nome da pessoa e o nome do cônjuge na mesma linha (ex.: `Maria e José`); pessoas sem `conjugue` aparecem sozinhas em uma linha, e verificar manualmente para uma comunidade com carismas que marido e mulher ficam juntos na mesma linha e solteiros em linha própria
- [x] 2.2 Tornar o nome de cada pessoa um link clicável para `/dashboard/pessoas/{id}` (usando `next/link`), incluindo o nome do cônjuge como link individual na linha do casal, e verificar (`npm run build`) que o arquivo compila sem erros de tipagem

## 3. Integração

- [x] 3.1 Rodar `npm run lint` e `npm run build` e confirmar que passam sem erros, validando a renderização dos carismas no card de uma comunidade com e sem carismas

## Workflow follow-up

- Archivear a mudança após os critérios de revisão serem atendidos.
- Verificar o resultado arquivado.