# Design

## Context

A página `/dashboard/pessoas/[id]` (arquivo `src/app/dashboard/pessoas/[id]/page.tsx`) renderiza cards em grid; o card "Endereços" lista `pessoa.enderecos` e tem o botão "Cadastrar endereços" que leva a `/dashboard/pessoas/[id]/enderecos`. Para contatos o desenho é diferente: o card "Contatos" sempre oferece o cadastro em um dialog shadcn (sem página de cadastro separada); quando não há contatos ele exibe a mensagem "Contatos dessa pessoa nao foi informada" junto da ação, e quando há, lista os contatos além da ação.

A rota `src/app/api/ambrosio/pessoa/[id]/route.ts` faz proxy para `{ambrosio}/pessoas/:id`, autenticando via cookie `token`; o GET atual constrói o payload como `any` (objeto serializável) e não devolve `contatos`. A lib `neocatecumenal` (v2.6.5) já declara a interface `PessoaContato` (`id`, `pessoaId`, `tipoTelefone`, `telefone`, `email?`, `observacao?`, `contatoPrincipal`) e `Pessoa.contatos?: PessoaContato[]`, exportadas do pacote raiz. A API externa expõe `POST {ambrosio}/pessoas/:id/contato` (ver `proposal.md`).

## Goals / Non-Goals

**Goals:**
- `GET /api/ambrosio/pessoa/[id]` devolve `contatos` sem quebrar o payload atual nem o tipo `Pessoa` da lib.
- Nova rota local `POST /api/ambrosio/pessoa/[id]/contato` que apenas faz proxy para a API externa, validando `tipoTelefone` (enum) e o e-mail no body.
- Card "Contatos" na página da pessoa lista os contatos quando existem, exibe a mensagem no estado vazio, e faz o cadastro em dialog com feedback de sucesso/erro via toast.

**Non-Goals:**
- Editar ou excluir contatos (o DTO e a rota informada são de criação; fica para mudança futura).
- Alterar o fluxo de endereços nem o restante do GET/PATCH de pessoa.
- Criar uma página de cadastro separada (`/dashboard/pessoas/[id]/contatos` não existe — o cadastro é feito em dialog no card).
- Validar regras de negócio exclusivas da API externa (ex.: unicidade de `contatoPrincipal`) — a rota repassa a resposta externa.

## Decisions

**1. Nova rota `POST /api/ambrosio/pessoa/[id]/contato` espelhando o caminho da API externa.**
O recurso informado é `{ambrosio}/pessoas/:id/contato`; uma rota própria em `src/app/api/ambrosio/pessoa/[id]/contato/route.ts` espelha esse caminho e mantém o PATCH/GET da pessoa intactos. Alternativa considerada: rota plana `/api/ambrosio/contato` (como o `endereco` atual) — descartada por não refletir que o contato é um sub-recurso de pessoa e por divergir do caminho externo informado.

**2. GET `/api/ambrosio/pessoa/[id]` adiciona `contatos` com fallback para array vazio.**
Como o payload é `any`, basta incluir `contatos: data.contatos || []` preservando todos os demais campos. Como a lib `neocatecumenal` já declara `contatos?: PessoaContato[]` em `Pessoa`, a página acessa `pessoa.contatos` diretamente com tipagem da lib, sem casts nem interfaces locais.

**3. `PessoaContato` da lib `neocatecumenal` como modelo único — leitura e criação alinhadas, nenhuma interface local nova.**
A lib exporta `PessoaContato` (named export `import { Pessoa, PessoaContato } from "neocatecumenal"`) com `id`, `pessoaId`, `tipoTelefone`, `telefone`, `email?`, `observacao?` e `contatoPrincipal`. O card e o campo `contatos` do GET usam esse tipo diretamente, e o corpo do `POST /pessoas/:id/contato` segue o mesmo modelo (`tipoTelefone`, `telefone`, `email?`, `observacao?`, `contatoPrincipal`). O DTO de criação passa a seguir `PessoaContato` (os campos `telefoneResidencial`/`telefoneCelular`/`ativo` deixam de existir). `id` e `pessoaId` não entram no body: o `id` é gerado pela API e o `pessoaId` já vai no caminho da rota.

**4. Formulário react-hook-form + zod, no padrão de `form-endereco.tsx`.**
`ContatoForm` valida com zod: `tipoTelefone` e `telefone` obrigatórios, `email` com `.email()` apenas quando preenchido e `observacao` como texto livre (textarea). `tipoTelefone` vira um Select fixo com os valores `CELULAR`, `RESIDENCIAL` e `COMERCIAL`; `contatoPrincipal` (default `false`) como checkbox nativo (`input type="checkbox"`), o mesmo padrão já usado em `form-usuario.tsx` — o projeto não tem componente Checkbox/Switch no ui. No submit, monta o body com os campos da `PessoaContato` e chama `POST /api/ambrosio/pessoa/[id]/contato`.

**5. Card "Contatos" com cadastro em dialog.**
No card "Contatos" de `page.tsx`, a ação de cadastro (botão que abre o `DialogContato`) está presente em ambos os estados. Quando `pessoa.contatos` está vazio, o corpo do card exibe a mensagem "Contatos dessa pessoa nao foi informada" e mantém o botão. Quando há contatos, o corpo lista `pessoa.contatos` (cada entrada com `tipoTelefone`, `telefone`, `email`, `observacao` — omitidos quando `null` — e badge de `contatoPrincipal`) e o botão. O cadastro é feito em um dialog shadcn (`ui/dialog`, já instalado) em componente separado `DialogContato` (`dialog-contato/dialog-contato.tsx`), reutilizando o `ContatoForm`. O dialog controla `open` via estado; ao salvar com sucesso, o `ContatoForm` dispara `onContatoSalvo`, o dialog fecha e a página refaz `getPessoa(id)` (callback `handleContatoSalvo`) para atualizar a listagem do card.

**6. Autenticação da rota de proxy via cookie.**
`POST /api/ambrosio/pessoa/[id]/contato` lê o token do cookie `token` e envia `Authorization: Bearer`, seguindo o padrão das rotas que exigem identidade (`pessoa/[id]`, `user/*`). Sem lógica própria de autenticação.

## Risks / Trade-offs

- [Formato de `contatos` do GET divergir do esperado pela página] → Normalizar no GET com fallback de array vazio; exibir apenas os campos conhecidos da `PessoaContato`; cenário cobre ausência/vazio.
- [A API externa impor regras além do DTO (ex.: apenas um `contatoPrincipal`, e-mail duplicado)] → A rota repassa status e mensagem da API externa; o dialog exibe toast de erro com essa mensagem e permanece aberto, mantendo os dados preenchidos.
- [Inconsistência entre o padrão de token da rota `endereco` (sem token) e esta rota (com token)] → Mantém-se o padrão com token, que é o correto para recurso autenticado; a rota de endereço não faz parte deste escopo.

## Migration Plan

Sem migração de dados: a persistência é responsabilidade da API externa. Deploy das rotas locais e do card (com o formulário embutido) é atômico com o resto da mudança (sem passos intermediários). Rollback: reverter o commit — não há estado local a reconciliar.
