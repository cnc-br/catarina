# Design

## Context

Ver proposal.md - Why. Segue o mesmo padrão aplicado em `delete-paroquia`: o dashboard é um proxy autenticado para a API externa Ambrosio; cada rota em `src/app/api/ambrosio/*` repassa a chamada a `${AmbrosioBaseUrl}/<recurso>` com o token da sessão no header `Authorization: Bearer ...`. A rota `src/app/api/ambrosio/user/[id]/route.ts` já expõe `GET` e `PATCH` (com validações próprias: `400` para id ausente, `404` "Usuário não encontrado", repasse de mensagem de erro). A página `/dashboard/usuarios/[id]` carrega o usuário via `useParams` + `use`, é restrita a `ROLE_ADMIN` via `useUser()`, e já usa `useRouter`. O componente `AlertDialog` (shadcn/ui) já existe no projeto.

## Goals / Non-Goals

**Goals:**
- Adicionar `DELETE` à rota interna existente `src/app/api/ambrosio/user/[id]/route.ts`, seguindo o padrão de proxy e o estilo de erros já usados nesse arquivo.
- Oferecer exclusão na página de detalhes do usuário com confirmação, feedback e redirecionamento, conforme specs/users.
- Bloquear a exclusão do próprio usuário logado (guarda de auto-exclusão).

**Non-Goals:**
- Não alterar `GET`/`PATCH` nem outras rotas.
- Sem exclusão em lote; apenas exclusão individual pela página.
- Sem soft-delete/histórico — a API externa é a fonte de verdade (a desativação por `active: false` continua existindo via PATCH).
- A guarda de auto-exclusão é de UX na interface; a permissão efetiva continua sendo decidida pela API externa/Ambrosio.

## Decisions

1. **Adicionar `DELETE` no arquivo de rota existente** (`src/app/api/ambrosio/user/[id]/route.ts`), seguindo o mesmo estilo do `PATCH` (try/catch, `NextResponse.json`, validação de `id` ausente).
   - Por quê: mantém a rota coesa e consistente com `delete-paroquia`.
   - Alternativa considerada: arquivo separado — rejeitada por incoerência com a organização atual.

2. **Proxificar para `DELETE ${AmbrosioBaseUrl}/users/:id`** com Bearer token.
   - Mapeamento de erros espelhando o `GET`/`PATCH` existentes: `400` "ID do usuário é obrigatório" (id ausente), `404` "Usuário não encontrado", `401`/`403` mensagem de permissão. Sucesso (2xx) repassa status e corpo; `204` retorna resposta vazia com o mesmo status. Outros erros extraem `errorData.message` (quando o corpo existe) com fallback genérico "Erro ao excluir usuário".
   - Por quê: reutiliza o vocabulário de erros já apresentado ao usuário nas outras operações.

3. **Extrair a mensagem de erro de forma robusta** — a API Ambrosio varia entre `message` como array ou string; usar `Array.isArray(msg) ? msg[0] : msg` com fallback.
   - Por quê: evita exibir `undefined` no toast.

4. **Usar o `AlertDialog` do projeto para confirmação**, com estado de carregamento.
   - Botão "Excluir usuário" (`variant="destructive"`) no `CardFooter` do card de dados do usuário, abaixo/ao lado das ações atuais ("Editar dados" e "Conferir pessoa"). Layout: uma linha destrutiva de largura total abaixo dos dois botões existentes.
   - Ao confirmar: `fetch(/api/ambrosio/user/${id}, { method: "DELETE" })`. Sucesso → toast + `router.push(ROUTE_LIST)`. Erro → toast destrutivo com a mensagem e permanece na página. `disabled` enquanto a requisição está em andamento; diálogo fecha ao concluir.
   - Por quê: mesma UX segura adotada em `delete-paroquia`, sem nova dependência.

5. **Guarda de auto-exclusão** — comparar o `id` do usuário exibido (`usuario.id`, string) com o `id` do usuário logado (`user.id` de `useUser()`, string). Quando iguais, não renderizar a ação "Excluir usuário".
   - Por quê: decisão de produto confirmada pelo dono (impede o admin de excluir a própria conta e perder o acesso).
   - Limitação: é uma proteção de interface; a API externa permanece a autoridade para permissões.

## Risks / Trade-offs

- **Endpoint externo pode não existir** → A API externa (Ambrosio) precisa expor `DELETE /users/:id`; assumido do padrão REST observado. Mitigação: validar com uma chamada real durante a implementação; se não existir, alinhar com o backend.
- **Usuário com vínculos (pessoa, paróquias) pode ser rejeitado na exclusão** → O backend pode responder conflito (ex.: `409`/`400`). Mitigação: a página repassa a mensagem de erro da API externa no toast, deixando claro o motivo.
- **Guarda de auto-exclusão é contornável chamando a API diretamente** → Aceito: é UX de proteção; a permissão efetiva é do backend. Registrado como comportamento especificado (specs/users).
- **Exclusão irreversível** → O diálogo de confirmação é a única proteção; sem soft-delete. Mitigação: backend como fonte de verdade para auditoria/restrições.

## Migration Plan

- Mudança aditiva e local; sem migração de dados ou schema.
- Rollback: reverter o handler `DELETE` e o botão da página em um único PR.
