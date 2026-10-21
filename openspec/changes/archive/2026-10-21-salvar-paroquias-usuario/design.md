# Design

## Context

A rota `src/app/api/ambrosio/user/[id]/route.ts` já faz proxy para a API externa (Ambrosio) para `GET` e `PATCH {ambrosio}/users/:id`, autenticando via cookie `token`. O `GET` atual filtra a resposta e não devolve `paroquias`. O componente `ParoquiasUsuario` (`paroquias-usuario.tsx`) carrega cidades e paróquias da API local, mantém `selectedIds` em estado, mas o botão "Salvar" está sem handler e o componente não recebe o `userId`. A página `src/app/dashboard/(configuracoes)/usuarios/[id]/page.tsx` renderiza esse componente sem props. O card de dados do usuário (coluna esquerda) exibe email/whatsapp/role/status.

A API externa já expõe `GET {ambrosio}/users/:id` retornando `paroquias: [{ id, descricao }]` e `PATCH {ambrosio}/users/:id/paroquias` aceitando `{ paroquiaIds: number[] }`.

## Goals / Non-Goals

**Goals:**
- `GET /api/ambrosio/user/[id]` devolve `paroquias` sem quebrar o contrato atual do `User` (lib `neocatecumenal`).
- Nova rota `PATCH /api/ambrosio/user/[id]/paroquias` apenas faz proxy, validando o body localmente.
- O card de dados do usuário lista as paróquias atuais.
- `ParoquiasUsuario` pré-seleciona o estado atual e salva via PATCH, com feedback de sucesso/erro e estado de carregamento.

**Non-Goals:**
- Gerenciar cidades/paróquias consultáveis (a listagem já existe).
- Alterar o fluxo de edição dos demais dados do usuário (`email`, `whatsapp`, `active`, `role`).
- Autenticação/autorização da rota de PATCH de paróquias (segue o padrão das demais rotas `ambrosio/*`, que só repassam o token do cookie).

## Decisions

**1. Nova rota separada `/api/ambrosio/user/[id]/paroquias/route.ts` em vez de estender o PATCH existente.**
A proposta aponta `PATCH {ambrosio}/users/:id/paroquias`, um recurso distinto. Uma rota própria espelha o caminho da API externa e mantém o PATCH existente de dados gerais intacto (a página de edição segue dependendo dele). Alternativa considerada: misturar no mesmo `route.ts` com controle de path — descartada por acoplar dois recursos distintos.

**2. `ParoquiasUsuario` recebe `userId` e as paróquias atuais via props, mas mantém a lista de cidades/paróquias autônoma.**
A página passa `userId` e `paroquias` (do estado `usuario`). O componente inicializa `selectedIds` a partir de `paroquias` (efeito quando a prop muda, já que o fetch do usuário é assíncrono) e pré-marca as caixas correspondentes. Não há consulta extra ao GET do usuário dentro do componente — evita duplicar o fetch que a página já faz. Alternativa considerada: o componente buscar o usuário sozinho — descartada por duplicação de chamada e por acoplar o componente ao estado de carregamento da página.

**3. GET `/api/ambrosio/user/[id]` devolve `paroquias` normalizado como `{ id, descricao }[]`.**
O campo já chega nesse formato da API externa; apenas se garante o fallback para array vazio. Os demais campos do response atual são preservados para não quebrar o tipo `User` da lib `neocatecumenal` (usado em `form-usuario.tsx` e na página).

**4. Auth compartilhada com o token de cookie.**
A nova rota reutiliza o mesmo padrão das rotas existentes: lê o token do cookie `token` e envia `Authorization: Bearer`, sem lógica própria de autenticação. Consistente com todos os outros proxies `ambrosio/*`.

**5. Premissa registrada sobre onde listar as paróquias.**
Foi assumido que a listagem das paróquias atuais fica no card de dados do usuário (coluna esquerda), conforme a proposta ("No card que mostra os dados do usuario"). O `ParoquiasUsuario` exibe as paróquias para atribuição.

## Risks / Trade-offs

- [Formato de `paroquias` divergir entre GET e o retorno esperado pela página] → Normalizar no GET local e tipar o retorno; cenário cobre array vazio/ausente.
- [A API externa rejeitar `paroquiaIds` vazio] → O botão fica desabilitado com seleção vazia, então nunca enviamos array vazio pela UI; a rota ainda valida o formato do array.
- [Conflito entre o estado local de `selectedIds` e carga assíncrona do usuário] → Inicializar `selectedIds` via `useEffect` dependente de `paroquias`, limpo ao trocar de cidade (comportamento já existente no componente).
- [Falha no PATCH externo] → Exibir mensagem de erro amigável e não navegar; o usuário pode tentar novamente.

## Migration Plan

Sem migração de dados: a persistência é responsabilidade da API externa. Deploy da rota local e dos componentes é atômico com o resto da mudança (sem passos intermediários).