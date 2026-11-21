# Design

## Context

Ver `proposal.md` — Why. A página `/dashboard` (`src/app/dashboard/page.tsx`) é um Server Component que hoje busca dois recursos diretamente no Ambrosio, sem proxy interno: `GET /users/me` (com Bearer do cookie `token`) e `GET /avisos` (sem autenticação). Ela já tolera falha de avisos retornando lista vazia. O layout do dashboard fornece sidebar, header e breadcrumb; a página só controla o conteúdo.

O Ambrosio expõe `GET /dashboard` com o resumo agregado. O payload não traz timestamp de atualização. O projeto usa shadcn/ui (`Card`, `Badge`, `Alert`, `Progress`), Tailwind v4 com tokens OKLCH em `src/app/globals.css` e `lucide-react`.

## Goals / Non-Goals

**Goals:**

- Consumir o resumo no servidor sem expor o token ao navegador.
- Manter a página resiliente: uma falha do novo endpoint não pode derrubar boas-vindas nem avisos.
- Entregar cards legíveis, responsivos e reproduzíveis com os componentes existentes.
- Centralizar a normalização do payload em um único módulo tipado e testável.

**Non-Goals:**

- Criar rota de proxy em `src/app/api/ambrosio/dashboard` — não há consumidor cliente nesta mudança.
- Adicionar biblioteca de gráficos, filtros, comparação temporal ou exportação.
- Alterar o endpoint ou o contrato do Ambrosio.
- Implementar estados de carregamento client-side; a página continua 100% server-rendered.

## Decisions

### 1. Busca direta no Ambrosio a partir do Server Component

`getSystemOverview()` fará `fetch(`${AmbrosioBaseUrl}/dashboard`, { headers: { Authorization: Bearer <token> }, cache: "no-store" })` em paralelo com `getAuthenticatedUser()` e `getAvisos()` dentro do mesmo `Promise.all`.

- **Por quê:** é o padrão já usado pela página para `/users/me`, mantém o token no servidor e evita um salto extra de rede.
- **Alternativas rejeitadas:** proxy interno (uma rota sem consumidor, com repasse de cookie e URL absoluta); fetch no cliente (exigiria expor o token ou criar o proxy e aumentaria o tempo de primeira pintura dos cards).

### 2. Normalização defensiva em um view model

Criar `src/components/custom/dashboard/overview/system-overview.ts` com:

- `SystemOverviewPayload` — o contrato exato do Ambrosio.
- `SystemOverview` — view model já normalizado, com arrays ordenados de métricas e distribuições, evitando condicionais duplicadas no JSX.
- `normalizeSystemOverview(payload)` — preenche campos ausentes com `0`, mantém papéis extras de `porPapel` e calcula percentuais com guarda de divisão por zero (`total > 0 ? valor / total : 0`).
- `formatNumber` / `formatPercent` — `Intl.NumberFormat("pt-BR")`.

O carregador retorna uma união discriminada `{ status: "ok", data } | { status: "error" }`, e nunca lança para a página. Respostas não-`2xx`, JSON inválido e exceções de rede caem em `error` com `console.error`, seguindo o padrão de `getAvisos`.

**Papéis:** exibir primeiro `ADMIN`, `SECRETARIA_PAROQUIA` e `NAO_IDENTIFICADO` nessa ordem (inclusive com valor `0`) e, depois, quaisquer papéis adicionais em ordem alfabética. Os rótulos são os valores crus do enum, como no card de perfil atual.

### 3. Composição da UI

- `src/app/dashboard/page.tsx` continua orquestrando as três buscas e decide o que renderizar.
- `src/components/custom/dashboard/overview/system-overview-section.tsx` — Server Component que recebe `data: SystemOverview` e renderiza a seção `<section aria-labelledby="dados-sistema">` com título, subtítulo e timestamp de renderização. O nome difere do módulo de dados (`system-overview.ts`) para evitar colisão de resolução entre `.ts` e `.tsx`.
- `src/components/custom/dashboard/overview/metric-card.tsx` — card de KPI reutilizável: ícone (`lucide-react`), rótulo, valor grande (`tabular-nums`) e linha secundária opcional (`children`/prop `detail`), usando `Card`/`CardHeader`/`CardContent`.
- `src/components/custom/dashboard/overview/distribution-card.tsx` — card de detalhamento com lista de linhas (`label`, `value`, `percent`, cor) e barras. Usa `Progress` para cada linha e um par de barras empilhadas CSS para "Pessoas por situação", sem biblioteca de charts.
- Ícones: `Users`, `Church`, `MapPin`, `Home`, `UsersRound`, `Flame`, `ShieldCheck` (ajustáveis na implementação desde que mantenham o sentido).

**Grid:** `grid gap-4 sm:grid-cols-2 xl:grid-cols-3`; os dois cards de detalhamento em `grid items-start gap-4 lg:grid-cols-2`. São seis cards de KPI; o total de usuários aparece na descrição do card "Usuários por papel" (ex.: "5 usuários no total"), evitando um sétimo card que repetiria a informação. O antigo card de boas-vindas vira um cabeçalho à esquerda: `H1` "Bem-vindo!" e, na linha seguinte, e-mail e badge de perfil, o que reduz a altura da primeira dobra. A ordem permanece: boas-vindas → alerta de perfil → avisos → "Dados do sistema".

### 4. Fallback de erro visível, mas não destrutivo

Se a busca falhar, a seção "Dados do sistema" é substituída por um `Alert variant="destructive"` compacto com ícone `CircleAlert` e o texto "Não foi possível carregar os dados do sistema agora. Tente novamente mais tarde.". Boas-vindas, alerta de perfil e avisos permanecem intactos.

- **Por quê:** o resumo é complementar; não deve bloquear a página nem simular zeros, o que seria enganoso.
- **Alternativa rejeitada:** exibir cards com `0` — confundiria indisponibilidade com ausência real de cadastros.

### 5. Mockup de referência no OpenDesign

O layout foi especificado a partir dos tokens reais do projeto e gerado no OpenDesign no projeto `cnc-dashboard-dados-sistema`. O artefato de entrada é `index.html` (raiz do projeto; diretório local `/home/leonardo/Github/open-design/.od/projects/cnc-dashboard-dados-sistema`), com um comentário no topo mapeando cada bloco para `Card`, `Badge`, `Alert` e `Progress`. O mockup é referência visual, não código de produção; a implementação usa os componentes shadcn/ui do repositório e os tokens de `globals.css`.

## Risks / Trade-offs

- **Payload do Ambrosio divergir do contrato** → a normalização trata campos ausentes como `0`; campos com tipo inesperado devem ser convertidos com `Number.isFinite` e, se o corpo não for um objeto, o carregador retorna `error`. Testes unitários cobrem payload completo, zerado e incompleto.
- **`cache: "no-store"` a cada visita** → aceitável para um painel administrativo de baixo tráfego; se o endpoint ficar caro, a evolução natural é um proxy com revalidação curta, sem mudar o contrato da UI.
- **Exibir `NAO_IDENTIFICADO: 0` pode parecer ruído** → exigido pela spec para dar visibilidade ao papel; a linha fica visualmente atenuada quando o valor é `0`.
- **Muitos cards na primeira dobra em notebooks** → grid progressivo (`1 → 2 → 3` colunas) e cards compactos; o bloco de boas-vindas foi convertido em cabeçalho para não competir com os indicadores.
- **Divisão por zero nas barras** → percentuais calculados apenas quando `total > 0`; barras ficam vazias caso contrário.

## Migration Plan

Mudança aditiva e somente frontend. Deploy normal do Next.js; nenhuma migração de dados. Rollback = reverter `src/app/dashboard/page.tsx` e remover os componentes novos. O endpoint do Ambrosio precisa estar disponível em produção antes do deploy para que os cards apareçam; caso contrário, o fallback é exibido.

## Open Questions

Nenhuma pendente. O formato do payload foi fornecido e o comportamento de erro/zero foi decidido acima.
