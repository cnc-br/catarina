# Proposal

## Why

Hoje a página de dados da pessoa (`/dashboard/pessoas/[id]`) não permite registrar dados de contato (telefones, e-mail, observação, contato principal). Não existe card nem rota de cadastro no dashboard para isso. A API externa Ambrosio já expõe `POST /pessoas/:id/contato`, mas nada no dashboard consome esse recurso.

## What Changes

- Adicionar o campo `contatos` ao retorno do `GET /api/ambrosio/pessoa/[id]` (proxy para `GET {ambrosio}/pessoas/:id`), com fallback para array vazio quando ausente, seguindo o mesmo padrão já usado para `paroquias` no `GET /api/ambrosio/user/[id]`.
- Adicionar o card "Contatos" na página `/dashboard/pessoas/[id]`: quando não há contatos, exibir a mensagem "Contatos dessa pessoa nao foi informada"; quando há, listar os contatos (telefone com tipo, e-mail, observação e contato principal). Em ambos os casos o card oferece a ação de cadastro — campos `tipoTelefone` (select com `CELULAR`, `RESIDENCIAL` e `COMERCIAL`), `telefone`, `email`, `observacao` e `contatoPrincipal` — em um dialog shadcn (componente separado `DialogContato`, `ui/dialog` já instalado).
- Criar a rota local `POST /api/ambrosio/pessoa/[id]/contato` que faz proxy para `POST {ambrosio}/pessoas/:id/contato`, repassando o corpo de criação seguindo a interface `PessoaContato` da lib (`tipoTelefone`, `telefone`, `email`, `observacao`, `contatoPrincipal`), validando `tipoTelefone` como um dos valores do enum.
- Usar a interface `PessoaContato` da lib `neocatecumenal` (que já declara `Pessoa.contatos?: PessoaContato[]`) como modelo de leitura da listagem e do campo `contatos` do GET — nenhuma interface local nova.

## Capabilities

### New Capabilities
- `pessoa-contato`: capacidade de cadastrar e visualizar os dados de contato de uma pessoa no dashboard, consumindo a API externa Ambrosio via a rota `{ambrosio}/pessoas/:id/contato`.

### Modified Capabilities

Nenhuma. Não existem specs de pessoas/contatos/endereços neste repositório (`openspec/specs/` cobre apenas `users`, `paroquias` e `user-paroquias`).

## Impact

- `src/app/api/ambrosio/pessoa/[id]/route.ts`: `GET` passa a devolver `contatos` no payload; o `PATCH` existente permanece inalterado.
- `src/app/api/ambrosio/pessoa/[id]/contato/route.ts`: nova rota de `POST` (proxy para a API externa).
- `neocatecumenal` (lib): expõe `PessoaContato` e já declara `Pessoa.contatos?: PessoaContato[]`, usados na listagem do card e no campo `contatos` do GET — sem criar interface local.
- `src/app/dashboard/pessoas/[id]/page.tsx`: card "Contatos" — mensagem "Contatos dessa pessoa nao foi informada" quando não há contatos; listagem quando há; em ambos os casos, botão que abre o cadastro em dialog.
- `src/components/custom/dashboard/pessoa/dialog-contato/dialog-contato.tsx`: novo dialog shadcn de cadastro (usa o `ui/dialog` já instalado).
- `src/components/custom/dashboard/pessoa/form-contato.tsx`: formulário de cadastro, renderizado dentro do dialog.
- API externa (Ambrosio): consuma `POST {ambrosio}/pessoas/:id/contato` com o corpo seguindo a interface `PessoaContato` (`tipoTelefone` ∈ {`CELULAR`, `RESIDENCIAL`, `COMERCIAL`}, `telefone`, `email`, `observacao`, `contatoPrincipal`).
