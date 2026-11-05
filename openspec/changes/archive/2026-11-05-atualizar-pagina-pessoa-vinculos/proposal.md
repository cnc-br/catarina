# Proposal

## Why

Ao vincular um cônjuge ou associar uma pessoa a uma comunidade na página de detalhe da pessoa (`/dashboard/pessoas/[id]`), os cards continuam exibindo o estado anterior. O usuário precisa recarregar a página manualmente (F5) para enxergar o vínculo recém-criado, o que gera dúvida sobre o sucesso da operação — a própria mensagem de sucesso do dialog de casal orienta a atualizar a página.

## What Changes

- O dialog "Vincular cônjuge" (`DialogPessoaCasada`) passa a notificar a página após um vínculo bem-sucedido, por meio de um callback opcional, seguindo o padrão já usado pelo dialog de contatos.
- O dialog "Informar comunidade" (`PessoaComunidade`) passa a notificar a página após associar a pessoa a uma comunidade com sucesso, também via callback opcional.
- A página `/dashboard/pessoas/[id]` passa a recarregar os dados da pessoa (`getPessoa`) ao receber essas notificações, atualizando os cards de Comunidade e Cônjuge sem reload.
- A mensagem de sucesso do vínculo de casal deixa de instruir o usuário a atualizar a página.
- Falhas de vínculo mantêm o comportamento atual: nenhum callback é disparado e o erro é exibido via toast.

## Capabilities

### New Capabilities

- `pessoa-vinculos`: comportamento da página de detalhe da pessoa ao vincular cônjuge e ao associar comunidade, incluindo atualização automática dos dados exibidos após sucesso.

### Modified Capabilities

<!-- Nenhuma capability existente tem requisito alterado. -->

## Impact

- `src/app/dashboard/pessoas/[id]/page.tsx`
- `src/components/custom/dashboard/pessoa/dialog-casal/dialog-casal.tsx`
- `src/components/custom/dashboard/pessoa/comunidade/pessoaComunidade.tsx`
- Reutiliza `getPessoa` de `src/lib/api/pessoa.ts`
- Sem alterações em rotas de API, dependências ou contratos externos.
