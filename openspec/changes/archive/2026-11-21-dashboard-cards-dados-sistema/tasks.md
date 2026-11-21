# Tasks

## 1. Contrato e normalização do resumo

- [x] 1.1 Criar `src/components/custom/dashboard/overview/system-overview.ts` com `SystemOverviewPayload`, `SystemOverview`, `normalizeSystemOverview`, `formatNumber` e `formatPercent`, incluindo JSDoc do contrato do `GET /dashboard`; verificar com `npx tsc --noEmit`.
- [x] 1.2 Criar `src/components/custom/dashboard/overview/system-overview.test.mjs` cobrindo payload completo, todos os totais zerados, campos ausentes, papel adicional em `porPapel` e cálculo de percentual com total `0`; verificar com `node --test src/components/custom/dashboard/overview/system-overview.test.mjs`.
- [x] 1.3 Confirmar que a ordem dos papéis é `ADMIN`, `SECRETARIA_PAROQUIA`, `NAO_IDENTIFICADO` e depois extras em ordem alfabética, com um caso no teste; verificar rodando o teste de 1.2.

## 2. Cards e integração na página

- [x] 2.1 Criar `src/components/custom/dashboard/overview/metric-card.tsx` com ícone, rótulo, valor em `tabular-nums`, detalhe secundário opcional e `Card`/`CardContent` do projeto; verificar com `npm run lint`.
- [x] 2.2 Criar `src/components/custom/dashboard/overview/distribution-card.tsx` com lista de linhas (`label`, valor, percentual) usando `Progress` e uma barra empilhada para "Pessoas por situação", sem biblioteca de gráficos; verificar com `npm run lint`.
- [x] 2.3 Criar `src/components/custom/dashboard/overview/system-overview-section.tsx` como Server Component que recebe o view model, renderiza a seção "Dados do sistema" com grid `1 → sm:2 → xl:3` e os cards de detalhamento em `lg:grid-cols-2`; verificar com `npm run lint`.
- [x] 2.4 Adicionar `getSystemOverview()` em `src/app/dashboard/page.tsx` usando Bearer do cookie, `cache: "no-store"` e retorno `{ status: "ok" | "error" }`, executando em paralelo com usuário e avisos; verificar com `npx tsc --noEmit`.
- [x] 2.5 Reorganizar o JSX de `/dashboard` na ordem boas-vindas → alerta de perfil → avisos → "Dados do sistema", exibindo o `Alert` de indisponibilidade quando o carregador retornar `error`; verificar que o build de produção conclui com `npm run build`.

## 3. Validação visual e de resiliência

- [x] 3.1 Comparar a implementação com o mockup de referência do OpenDesign (projeto `cnc-dashboard-dados-sistema`, `index.html`) e ajustar espaçamento, hierarquia tipográfica e cores aos tokens de `globals.css`; verificar abrindo `/dashboard` a 1440px no navegador.
- [x] 3.2 Verificar a grade responsiva em 375px, 768px e 1440px, sem rolagem horizontal, sobreposição de rótulos ou corte dos números; verificar com o modo responsivo do navegador.
- [x] 3.3 Verificar o fallback apontando `NEXT_PUBLIC_AMBROSIO_URL` para uma URL indisponível em `.env.local` e confirmando que boas-vindas e avisos continuam visíveis e o aviso de indisponibilidade aparece; restaurar o `.env.local` ao final.
- [x] 3.4 Verificar o caminho feliz com o Ambrosio disponível, confirmando os seis totais, o total de usuários no card "Usuários por papel" e as duas distribuições exatamente com o payload de exemplo; verificar comparando a tela com o payload documentado no teste de 1.2.

## Workflow follow-up

- Arquivar a mudança após a revisão do projeto e a implementação aprovada.
- Verificar o resultado arquivado com `openspec validate --change dashboard-cards-dados-sistema` antes de arquivar.
