# Design

## Context

Ver proposal.md - Why. O dashboard (`catarina`) é uma camada de proxy autenticada para a API externa Ambrosio: cada rota em `src/app/api/ambrosio/*` repassa a chamada a `${AmbrosioBaseUrl}/<recurso>`, anexando o token da sessão (cookie `token`) no header `Authorization: Bearer ...`. A rota `src/app/api/ambrosio/paroquia/[id]/route.ts` hoje expõe apenas `GET` e `PATCH`. A página `/dashboard/paroquias/[id]` permite visualizar e editar. O componente `src/components/ui/alert-dialog.tsx` (shadcn/ui) já existe, mas ainda não é usado em nenhuma tela — é o padrão natural para a confirmação de exclusão.

## Goals / Non-Goals

**Goals:**
- Adicionar `DELETE` à rota interna existente `src/app/api/ambrosio/paroquia/[id]/route.ts`, seguindo o mesmo padrão de proxy das demais rotas.
- Oferecer exclusão na página de detalhes da paróquia com confirmação, feedback e redirecionamento, conforme specs/paroquias.

**Non-Goals:**
- Não alterar `GET`/`PATCH` da rota nem outros recursos.
- Sem controle de permissões por papel no frontend (segue o comportamento atual: a API externa decide 401/403).
- Sem exclusão em lote/na listagem; apenas exclusão individual pela tela de detalhes.
- Não tratar soft-delete ou histórico de auditoria — a API externa é a fonte de verdade.

## Decisions

1. **Adicionar `DELETE` no arquivo de rota existente** (`src/app/api/ambrosio/paroquia/[id]/route.ts`), em vez de criar um arquivo novo.
   - Por quê: mantém a rota coesa (`/[id]` já contém `GET` e `PATCH`) e segue o padrão do projeto (ex.: `diocese/[id]`, `comunidade/[comunidadeId]`).
   - Alternativa considerada: arquivo separado `route.ts` com apenas DELETE — rejeitada por ser incoerente com a organização atual.

2. **Proxificar diretamente para `DELETE ${AmbrosioBaseUrl}/paroquia/:id`** com o token do cookie.
   - Por quê: é exatamente o que `GET`/`PATCH` já fazem; zero estado adicional no proxy.
   - Tratamento de status espelhando o `GET` existente: `404` → "Paróquia não encontrada"; `401`/`403` → mensagem de permissão; demais erros → repassa status e mensagem; sucesso (2xx) → repassa status e corpo.

3. **Extrair a mensagem de erro de forma robusta.**
   - A API Ambrosio ora retorna `message` como array (o `PATCH` usa `resData.message[0]`), ora como string (a rota de comunidade usa `data.message`). A leitura deve aceitar ambos: `Array.isArray(msg) ? msg[0] : msg`.
   - Por quê: evita exibir `undefined` no toast caso o shape varie no `DELETE`.

4. **Usar o `AlertDialog` do projeto para confirmação**, com estado de carregamento no botão de ação.
   - Adicionar botão "Excluir paróquia" (`variant="destructive"`) no `CardFooter` da página, ao lado de "Editar paróquia".
   - Ao confirmar: `fetch(BASE_URL/api/ambrosio/paroquia/${id}, { method: "DELETE" })`. Sucesso → toast de sucesso + `router.push("/dashboard/paroquias")`. Erro → toast destrutivo com a mensagem e permanece na página. Desabilitar o botão enquanto a requisição está em andamento.
   - Por quê: usa componente já presente no repositório (sem nova dependência) e dá UX segura contra exclusão acidental.
   - Alternativa considerada: `window.confirm()` — rejeitada por não seguir o design system do projeto.

## Risks / Trade-offs

- **Endpoint externo pode não existir** → A API externa (Ambrosio) precisa expor `DELETE /paroquia/:id`; o caminho é assumido a partir do padrão REST observado. Mitigação: validar com uma chamada real antes de fechar a tarefa; se não existir, alinhar com o backend.
- **Shape da resposta de erro pode variar** → A leitura de `message` aceita array e string (Decisão 3), então o toast nunca quebra mesmo se o shape divergir entre rotas.
- **Exclusão irreversível** → A confirmação via diálogo (Decisão 4) é a única proteção; não há soft-delete. Mitigação: depender do backend se ele oferecer auditoria/restrições (ex.: paróquia com vínculos).
- **Requisito de redirecionar após sucesso** → A página já usa `useRouter`, então o redirecionamento para `/dashboard/paroquias` segue o padrão existente na aplicação.

## Migration Plan

- Mudança aditiva e local; sem migração de dados ou schema.
- Rollback: reverter o handler `DELETE` e o botão da página em um único PR.
