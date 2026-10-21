# Tasks

## 1. API — incluir paróquias no GET do usuário

- [x] 1.1 Modificar `GET` em `src/app/api/ambrosio/user/[id]/route.ts` para devolver `paroquias` (array com as paróquias do usuário, com fallback para array vazio quando ausente/vazio na resposta externa) e conferir via `npm run lint` que o build de tipos passa
- [ ] 1.2 Verificar manualmente que `GET /api/ambrosio/user/[id]` devolve `paroquias` com as paróquias do usuário (ex.: chamando a rota no navegador no modo admin ou via `curl` com o token do cookie)

## 2. API — rota PATCH de paróquias

- [x] 2.1 Criar `src/app/api/ambrosio/user/[id]/paroquias/route.ts` (método `PATCH` no mesmo padrão das rotas `ambrosio/*`: token do cookie `token`, `Authorization: Bearer`) que valida `paroquiaIds` como array de números inteiros (400 se ausente/inválido), faz proxy para `PATCH {ambrosio}/users/:id/paroquias` com body `{ paroquiaIds }`, trata 404 (usuário não encontrado), outros erros da externa e deixa `npm run lint` passar
- [ ] 2.2 Verificar manualmente a rota: chamar `PATCH /api/ambrosio/user/[id]/paroquias` com body `{ "paroquiaIds": [1, 11] }` e conferir resposta 200 de sucesso; repetir com body sem `paroquiaIds` e conferir 400

## 3. Front — página de edição do usuário

- [ ] 3.1 No card de dados do usuário em `src/app/dashboard/(configuracoes)/usuarios/[id]/page.tsx`, listar as paróquias do usuário a partir de `paroquias` (nome via `descricao`) e mostrar indicação quando o usuário não tem paróquia atribuída; conferir visualmente navegando até `/dashboard/usuarios/[id]` no modo admin
- [x] 3.2 Passar `userId` (o `id` da rota) e `paroquias` como props para o componente `ParoquiasUsuario` e conferir via `npm run lint`

## 4. Front — pré-seleção e salvamento das paróquias

- [ ] 4.1 Atualizar `src/components/custom/dashboard/usuarios/paroquias-usuario.tsx` para receber as novas props (`userId`, `usuarioParoquias`), inicializar `selectedIds` com as paróquias atuais via `useEffect` (mantendo a limpeza ao trocar de cidade) e conferir que as caixas já atribuídas aparecem marcadas ao abrir a página
- [x] 4.2 Implementar o handler do botão "Salvar" chamando `PATCH /api/ambrosio/user/[id]/paroquias` com `paroquiaIds` = `selectedIds`, com estado de carregamento (desabilitar o botão), feedback de sucesso/erro e manutenção do padrão de desabilitar com seleção vazia; conferir via `npm run lint`
- [ ] 4.3 Verificar manualmente o fluxo completo: marcar/desmarcar paróquias na tabela, clicar em "Salvar", conferir a mensagem de sucesso e que um novo `GET /api/ambrosio/user/[id]` devolve `usuarioParoquias` com a seleção salva

## 5. Integração

- [x] 5.1 Rodar `npm run lint` e conferir que não há erros de lint ou tipos em todo o projeto
- [x] 5.2 Rodar `npm run build` e conferir que o build do Next.js conclui sem erros

## Workflow follow-up

- Após a implementação, arquivar o change `salvar-paroquias-usuario` no OpenSpec.
- Conferir o resultado arquivado em `openspec/specs/user-paroquias/spec.md`.