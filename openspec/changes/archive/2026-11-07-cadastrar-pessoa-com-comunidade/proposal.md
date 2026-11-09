# Proposal

## Why

Hoje, para cadastrar um membro (pessoa) de uma comunidade é preciso navegar até o cadastro de pessoas e, depois, associá-lo à comunidade em um passo separado. O usuário quer poder cadastrar uma pessoa diretamente a partir da página da comunidade (`/dashboard/comunidades/{id}`, card "Carismas da comunidade"), já incluindo essa pessoa na comunidade no momento do cadastro, no mesmo fluxo.

## What Changes

- Adicionar um botão "Cadastrar pessoa" no card "Carismas da comunidade" da página `/dashboard/comunidades/{id}`.
- Ao clicar, o botão redireciona para a página de novo cadastro de pessoa (`/dashboard/pessoas/novo`) passando o query param `comunidadeId`.
- Na página `/dashboard/pessoas/novo`, ler o query param `comunidadeId` (quando presente) e repassá-lo ao formulário de cadastro de pessoa.
- No `PessoaForm`, quando houver `comunidadeId`, incluir esse valor como query param na requisição `POST` ao endpoint `{urlBase}/api/ambrosio/pessoa`.
- O cadastro de pessoa existente permanece inalterado em comportamento: o fluxo normal (sem `comunidadeId`) continua funcionando como hoje. O query param é opcional.

## Capabilities

### New Capabilities
- `comunidade/pessoa`: Capacidade de cadastrar uma pessoa a partir da página da comunidade, redirecionando ao cadastro de pessoa com o `comunidadeId` e repassando esse parâmetro à API ambrosio para que a pessoa já seja associada à comunidade.

### Modified Capabilities
- Nenhuma capability existente tem requisitos alterados. A capability `pessoa-vinculos` (associação de pessoa a comunidade) permanece com seus requisitos atuais; aqui apenas a criação de pessoa opcionalmente carrega o `comunidadeId`.

## Impact

- **Código afetado**:
  - `src/app/dashboard/comunidades/[id]/page.tsx` (botão "Cadastrar pessoa" no card "Carismas da comunidade").
  - `src/app/dashboard/pessoas/novo/page.tsx` (leitura do query param `comunidadeId`).
  - `src/components/custom/dashboard/pessoa/form-pessoa.tsx` (`PessoaForm` recebe `comunidadeId` e o envia como query param no `POST`).
- **API**: a chamada `POST /api/ambrosio/pessoa` passa a aceitar opcionalmente o query param `comunidadeId`. Sem ele, o endpoint se comporta como hoje.
- **Dependências**: nenhuma nova dependência; usa `useSearchParams` do Next.js (App Router).
- **Comportamento**: fluxo padrão de cadastro de pessoa preservado (backward compatible).