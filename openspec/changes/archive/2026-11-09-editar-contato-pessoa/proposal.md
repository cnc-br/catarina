# Proposal

## Why

Hoje a página `/dashboard/pessoas/[id]` permite apenas cadastrar novos contatos de uma pessoa (via dialog), mas não permite corrigir ou atualizar um contato já existente. Para editar um dado (telefone, e-mail, observação, contato principal) o usuário precisa refletir manualmente a mudança, já que não há endpoint de atualização na rota local nem botão de edição no card "Contatos". A API externa Ambrosio já suporta a atualização via `PATCH {ambrosio}/pessoas/:id/contato/:contatoId`, mas nada no dashboard consome esse recurso.

## What Changes

- Adicionar a rota local `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` que faz proxy para `PATCH {ambrosio}/pessoas/:id/contato/:contatoId`, repassando o corpo de atualização seguindo a interface `PessoaContato` e aplicando as mesmas validações já usadas no `POST` (enum `tipoTelefone`, `telefone` obrigatório e formato de `email`).
- Reaproveitar o dialog existente (`DialogContato`) para edição: passar a aceitar um contato existente como prop opcional; quando presente, o dialog entra em modo edição — título "Editar contato", formulário pré-preenchido, e o envio usa `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` em vez do `POST`.
- Ajustar `ContatoForm` para aceitar um contato opcional e derivar o modo edição dele (mesmo padrão já usado no `AvisoFormDialog`).
- Adicionar um botão de edição por contato no card "Contatos" da página `/dashboard/pessoas/[id]`, abrindo o dialog em modo edição com os dados daquele contato.
- Ao salvar a edição, recarregar os dados da pessoa (mesmo fluxo do cadastro via `onContatoSalvo`) e exibir feedback de sucesso/erro via toast.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities
- `pessoa-contato`: a capacidade passa a cobrir a atualização (edição) de um contato de pessoa — nova rota `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` e ação de edição no card/dialog, além do cadastro (`POST`) e visualização já existentes.

## Impact

- `src/app/api/ambrosio/pessoa/[id]/contato/[contatoId]/route.ts`: nova rota de `PATCH` (proxy para a API externa), criada a partir do arquivo existente `contato/route.ts`. **Nota de framework:** para a rota `/pessoa/{id}/contato/{contatoId}`, o App Router do Next exige o arquivo na pasta `[contatoId]/` — o handler não pode viver em `contato/route.ts`, que casa apenas `/pessoa/[id]/contato`.
- `src/app/api/ambrosio/pessoa/[id]/contato/route.ts`: permanece apenas com o `POST` existente, inalterado.
- `src/components/custom/dashboard/pessoa/dialog-contato/dialog-contato.tsx`: dialog passa a aceitar `contato?` e suporta modo edição (título/descrição e envio PATCH).
- `src/components/custom/dashboard/pessoa/form-contato.tsx`: aceita contato opcional, pré-preenche o formulário e alterna entre POST e PATCH.
- `src/app/dashboard/pessoas/[id]/page.tsx`: botão de edição por contato no card "Contatos" abrindo o dialog em modo edição.
- API externa (Ambrosio): consumo de `PATCH {ambrosio}/pessoas/:id/contato/:contatoId` com corpo seguindo a interface `PessoaContato` (`tipoTelefone` ∈ {`CELULAR`, `RESIDENCIAL`, `COMERCIAL`}, `telefone`, `email`, `observacao`, `contatoPrincipal`).
