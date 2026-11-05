# Design

## Context

A página `/dashboard/comunidades/{id}` é um client component que carrega a comunidade via hook `useComunidadeById`, que espalha a resposta da API sobre o tipo `Comunidade` da lib `neocatecumenal`. Esse tipo já expõe `carismas?: ComunidadeCarisma[]`, sem necessidade de novas chamadas ou normalização. O card "Carismas da comunidade" está no `CardContent` (linhas 182–186) e hoje exibe apenas o placeholder. Veja proposal.md – Why para a motivação.

Estrutura de dados relevante (`ComunidadeCarisma`):

- `id`, `descricao` (nome do carisma), `tipo`, `pessoas[]`, onde cada pessoa tem `nome`, `casal: boolean` e opcionalmente `conjugue?: { id, nome, externalId }`.

## Goals / Non-Goals

**Goals:**
- Renderizar os carismas de `comunidade.carismas` no card, com o nome do carisma em destaque e as pessoas abaixo.
- Agrupar sempre marido e mulher (pessoa + `conjugue`) na mesma linha.
- Exibir estado vazio quando a comunidade não tiver carismas.
- Manter a mudança apenas de UI, sem alterar a API nem a lib.

**Non-Goals:**
- Criar/editar/excluir carismas (o card é somente leitura nesta etapa).
- Normalizar ou transformar os dados de carismas no hook `useComunidadeById`.
- Exibir o tipo do carisma (`tipo`).

## Decisions

- **Renderização puramente derivada no componente da página.** Os carismas são derivados diretamente de `comunidade.carismas`. Como o arquivo já está em `"use client"` e os dados já estão disponíveis, não é preciso mexer no hook nem na lib.
  - Alternativa considerada: extrair um sub-componente `CarismasComunidade`. Rejeitada por simplicidade, dado o escopo de apenas exibir. Um componente separado pode ser extraído futuramente se o card crescer.
- **Agrupamento de casal pela presença de `conjugue`.** Para cada carisma, mapear `pessoas`: se a pessoa tem `conjugue`, renderizar na mesma linha a pessoa seguida do cônjuge (ex.: `Maria e José`); senão, renderizar a pessoa sozinha em uma linha.
  - A flag `casal` existe no tipo, mas a fonte autoritativa para exibir os dois nomes é `conjugue`; utilizamos a existência de `conjugue` para agrupar.
  - Alternativa considerada: confiar apenas na flag `casal`. Rejeitada porque a flag não carrega o nome do cônjuge.
- **Destaque do nome via estilos tipográficos do Tailwind** (ex.: `font-semibold`/`text-base`) para cada carisma, com as pessoas abaixo em itens de lista. Sem novos componentes UI; reutiliza os já importados (`Card`, `CardContent`) e primitivas do Tailwind.
- **Nomes clicáveis como links.** Cada nome de pessoa é um `Link` do Next.js para `/dashboard/pessoas/{id}`. Em casais, o nome da pessoa e o nome do cônjuge são links individuais (cada um com seu próprio `id`), separados por " e " na mesma linha. Estilo de link: `text-blue-600 hover:underline`.
- **Estado vazio** exibindo uma mensagem (ex.: "Nenhum carisma cadastrado para esta comunidade") quando `comunidade.carismas` for `undefined` ou array vazio.

## Risks / Trade-offs

- **`conjugue` ausente para pessoas de casal já cadastradas** → Mitigação: se não houver `conjugue`, a pessoa é renderizada sozinha; comportamento nunca quebra a página, apenas não agrupa.
- **Card pode ficar longo com muitas pessoas** → Mitigação: aceito nesta etapa (escopo somente leitura); ajustes de layout/rolagem podem ser feitos em mudanças futuras.