# Design

## Context

A página `/dashboard/comunidades/{id}` (`src/app/dashboard/comunidades/[id]/page.tsx`) é um client component que carrega a comunidade via hook `useComunidadeById` e renderiza o card "Carismas da comunidade" (linhas 178–231). Ela já importa `Link` de `next/link` e `Button`. O cadastro de pessoa (`/dashboard/pessoas/novo`) é um client component que carrega as situações religiosas e renderiza o `PessoaForm` (`src/components/custom/dashboard/pessoa/form-pessoa.tsx`), cujo `handleSubmit` monta a URL `{urlBase}/api/ambrosio/pessoa` para o `POST` de criação (linhas 106–122). Veja proposal.md – Why para a motivação.

Como a criação de pessoa opcionalmente carrega `comunidadeId`, e o frontend já resolve as URLs via query param, não há mudança de dados persistida no lado do frontend: o parâmetro é apenas repassado à API.

## Goals / Non-Goals

**Goals:**
- Adicionar um botão "Cadastrar pessoa" no card "Carismas da comunidade", presente com ou sem carismas.
- Redirecionar para `/dashboard/pessoas/novo?comunidadeId={id}` ao clicar no botão.
- Ler o query param `comunidadeId` na página de novo cadastro e repassá-lo ao `PessoaForm`.
- Enviar o `comunidadeId` como query param no `POST` de criação de pessoa à API ambrosio, quando presente.
- Preservar integralmente o fluxo de cadastro atual quando não há `comunidadeId`.

**Non-Goals:**
- Alterar o contrato de dados da lib `neocatecumenal` ou o formato do request body de `Pessoa` (a associação é feita via query param, não no body).
- Modificar behavior/requisitos de capabilities existentes (`pessoa-vinculos`).
- Adicionar vínculo automático local no frontend: a real associação à comunidade é responsabilidade do backend ambrosio ao receber o query param.

## Decisions

- **Botão via `Link` para `/dashboard/pessoas/novo` com query param.** No card "Carismas da comunidade", adicionar um `Button` (do Shadcn, já importado) envolvido por `Link href={`/dashboard/pessoas/novo?comunidadeId=${id}`}`. Colocado fora do condicional de carismas vazios, de modo a aparecer com ou sem carismas.
  - Alternativa considerada: usar `router.push` com handler. Rejeitada por desnecessário — `Link` é suficiente para navegação estática e mais simples.
- **Leitura do query param com `useSearchParams` na página `/dashboard/pessoas/novo`.** Como a página é client component (`"use client"`), usar `useSearchParams` e ler `comunidadeId`. Como o formulário é montado de forma condicional (após o `isLoading`), é seguro renderizar o `PessoaForm` já com o `comunidadeId` resolvido — evita disparar suspensão do `useSearchParams` no cliente ao passar o valor como prop em vez de usá-lo em texto renderizado.
  - Alternativa considerada: ler no próprio `PessoaForm`. Rejeitada por coesão — a página `novo` é quem conhece a query string; o `PessoaForm` apenas recebe o valor opcional.
- **`PessoaForm` ganha prop opcional `comunidadeId?: string`.** Ao montar a URL de criação, se `comunidadeId` estiver presente, anexá-lo como query param: `${url}?comunidadeId=${comunidadeId}`. A URL permanece como hoje quando ausente.
  - Alternativa considerada: enviar no body. Rejeitada porque o requisito e a API esperam um query param, e o body de `Pessoa` permanece inalterado.
- **Único ponto de montagem da URL de criação.** Modificar apenas o trecho do `POST` (criação) no `handleSubmit`; o `PATCH` de edição não recebe esse param, pois o fluxo de cadastro-a-partir-comunidade sempre cria uma pessoa nova.
- **Repasse no proxy da API (/api/ambrosio/pessoa).** O frontend aponta `POST` para a rota proxy `src/app/api/ambrosio/pessoa/route.ts`, que autentica via cookie e repassa ao backend ambrosio. O handler `POST` dessa rota extrai `comunidadeId` da requisição recebida (`new URL(req.url).searchParams`) e, quando presente, o anexa na URL do `fetch` de criação ao backend (`${url}?comunidadeId={comunidadeId}`). Sem o param, a URL repassada permanece como hoje.

## Risks / Trade-offs

- **`comunidadeId` ausente/indefinido** → Mitigação: URL sem query param e comportamento idêntico ao atual; nenhuma dependência.
- **`useSearchParams` e compatibilidade de build** → Mitigação: passar `comunidadeId` como prop ao `PessoaForm` (valor lido na página) evita dependência de suspensão no cliente; compilação validada via `npm run build`.
- **Backend não aceitar o query param** → Mitigação: fora do escopo deste frontend; a associação real é responsabilidade da API ambrosio. Se a API ignorar o param, o cadastro continua funcionando como antes (apenas sem pré-vínculo).