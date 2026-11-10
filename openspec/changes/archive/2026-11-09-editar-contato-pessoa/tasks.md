# Tasks

## 1. Rota PATCH

- [x] 1.1 Criar `src/app/api/ambrosio/pessoa/[id]/contato/[contatoId]/route.ts` com `export async function PATCH(req, ctx)` lendo `contatoId` de `ctx.params` e verificar que o arquivo foi criado no caminho esperado
- [x] 1.2 Validar o body no PATCH com as mesmas regras do POST (`tipoTelefone` ∈ {CELULAR, RESIDENCIAL, COMERCIAL}, `telefone` obrigatório não vazio, `email` opcional com regex) e verificar que cada validação responde 400 sem chamar a API externa
- [x] 1.3 Repassar o `PATCH` para `{AmbrosioBaseUrl}/pessoa/{id}/contato/{contatoId}` com `Authorization: Bearer <token>` (cookie `token`), refletindo status e mensagem da API externa (404 e demais erros), e verificar com `npm run dev` + requisição local que o PATCH responde conforme a API externa
- [x] 1.4 Rodar `npx tsc --noEmit` (ou o script de typecheck do projeto) e verificar que a nova rota não introduz erros de tipo

## 2. Formulário com modo edição

- [x] 2.1 Adicionar prop opcional `contato?: PessoaContato` em `ContatoForm` (`src/components/custom/dashboard/pessoa/form-contato.tsx`), derivar `isEditing = !!contato` e verificar via typecheck que `PessoaContato` é importado de `neocatecumenal`
- [x] 2.2 Pré-preencher o formulário com `form.reset(...)` via `useEffect` (padrão `AvisoFormDialog`) usando os valores do contato (incluindo `contatoPrincipal`) e verificar que os campos aparecem preenchidos ao abrir com um contato e limpos ao abrir sem contato
- [x] 2.3 No submit, alternar para `PATCH /api/ambrosio/pessoa/{pessoaId}/contato/{contatoId}` quando editando (mantendo o POST atual caso contrário), com toasts de sucesso "Contato atualizado" e erros via mensagem do payload, e verificar manualmente que criar continua igual e editar envia PATCH com os dados do contato

## 3. Dialog e página da pessoa

- [x] 3.1 Adicionar prop opcional `contato?: PessoaContato` em `DialogContato` (`src/components/custom/dashboard/pessoa/dialog-contato/dialog-contato.tsx`) repassando ao `ContatoForm`, com título/descrição alternando para edição, e verificar via typecheck e inspeção que o dialog renderiza o form com o contato
- [x] 3.2 No card "Contatos" de `src/app/dashboard/pessoas/[id]/page.tsx`, adicionar por contato listado um botão de edição (ícone `Pencil`, `variant="outline"`, `size="sm"`) que abre `DialogContato` com `contato={contato}` e `onContatoSalvo={recarregarPessoa}`, e verificar manualmente que o botão aparece para cada contato e abre o dialog pré-preenchido
- [x] 3.3 Verificar de ponta a ponta (`npm run dev` ou build + teste manual) que editar um contato salva via PATCH, fecha o dialog, exibe toast de sucesso e atualiza a listagem do card com os novos dados
