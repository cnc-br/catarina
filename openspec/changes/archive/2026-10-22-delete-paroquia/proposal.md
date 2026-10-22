# Proposal

## Why

O dashboard hoje permite visualizar e editar paróquias, mas não permite excluí-las. Quando uma paróquia precisa ser removida do sistema, o administrador não tem como fazê-lo pela interface, ficando dependente de ação manual na API externa.

## What Changes

- Adicionar handler `DELETE` à rota `src/app/api/ambrosio/paroquia/[id]/route.ts` (hoje a rota só expõe `GET` e `PATCH`), repassando a operação para `DELETE {ambrosio}/paroquia/:id` com autenticação Bearer e tratamento de erros consistente com as demais rotas.
- Adicionar um botão "Excluir paróquia" na página `/dashboard/paroquias/[id]` (arquivo `src/app/dashboard/(pontos-fisicos)/paroquias/[id]/page.tsx`) com diálogo de confirmação, feedback via toast em caso de sucesso/erro e redirecionamento para a listagem após a exclusão bem-sucedida.

## Capabilities

### New Capabilities
- `paroquias`: gestão do ciclo de vida de paróquias no dashboard (visualizar, cadastrar, editar e excluir). Esta capability surge com a exclusão de paróquia e deverá absorver requisitos futuros de CRUD de paróquias.

### Modified Capabilities
- Nenhuma. A capability existente `user-paroquias` trata apenas da atribuição de paróquias a usuários e não tem comportamento alterado por esta mudança.

## Impact

- **API**: `src/app/api/ambrosio/paroquia/[id]/route.ts` — novo handler `DELETE` que proxifica para a API externa Ambrosio (`DELETE {AmbrosioBaseUrl}/paroquia/:id`).
- **UI**: `src/app/dashboard/(pontos-fisicos)/paroquias/[id]/page.tsx` — novo botão de exclusão com confirmação, usando o componente já existente `src/components/ui/alert-dialog.tsx` (shadcn/ui AlertDialog, atualmente sem usos).
- **Dependência externa**: endpoint `DELETE /paroquia/:id` da API Ambrosio (assumido existente; ver design.md).
- **Sem quebras**: mudança aditiva, não altera `GET`/`PATCH` nem outras rotas.
