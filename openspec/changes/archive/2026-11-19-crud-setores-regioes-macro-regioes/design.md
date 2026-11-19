# Design

## Context

Ver proposal.md - Why. O `catarina` atua como BFF autenticado do Ambrosio: cada arquivo em `src/app/api/ambrosio/*` repassa a chamada para `${AmbrosioBaseUrl}/<recurso>` usando o token do cookie `token`. Hoje as rotas do grupo `(mapa)` só expõem `GET` de listagem, e esse `GET` retorna o envelope padrão do Ambrosio (`{ server, total, page, limit, data }`). O backend já implementa `POST /setor`, `PATCH /setor/:id`, `GET /setor/:id` e equivalentes para `regiao` e `macro-regiao`, exigindo os papéis `ADMIN` ou `SECRETARIA_CNC`. Na UI, as três listagens são client components que buscam a lista no mount, e as páginas de diocese/paróquia já estabelecem o padrão de formulário (`react-hook-form` + `zod`) e de página `novo`/`[id]`.

## Goals / Non-Goals

**Goals:**

- Expor no BFF as operações de escrita e leitura individual dos três recursos, com autenticação e mensagens de erro consistentes.
- Reaproveitar um único formulário por recurso entre cadastro e edição.
- Manter o padrão de página já usado em diocese/paróquia (`novo` e `[id]`), com listagem, formulário e navegação previsíveis.
- Exibir as ações de escrita a todos os usuários, deixando a autorização para o backend.

**Non-Goals:**

- Exclusão dos recursos: o Ambrosio não expõe `DELETE` para setor, região ou macro região.
- Edição inline na listagem ou em diálogo; a mudança usa páginas dedicadas.
- Alterar o contrato do `GET` de listagem existente ou o comportamento das demais capabilities.
- Seleção de pai a partir de uma página de detalhe do pai (a seleção acontece no próprio formulário).

## Decisions

1. **Criar `[id]/route.ts` com `GET` + `PATCH` e adicionar `POST` ao `route.ts` existente** em `src/app/api/ambrosio/(mapa)/{setor,regiao,macro-regiao}/`.
   - Por quê: mantém a coesão por recurso e segue o padrão de `diocese/route.ts` + `diocese/[id]/route.ts`.
   - Alternativa considerada: uma única rota dinâmica `[...path]` — rejeitada por fugir do padrão do repositório e dificultar a tipagem/leitura.
   - O `GET /[id]` repassa o envelope do Ambrosio desembrulhando `data.data`, como faz `diocese/[id]`; assim a página de edição recebe o objeto diretamente.

2. **Formulários enviam campos planos (`regiaoId` / `macroRegiaoId`) e o proxy monta o corpo aninhado** exigido pelo backend (`regiao: { id }`, `macroRegiao: { id }`).
   - Por quê: é exatamente o padrão de `diocese` (que envia `tipoDiocese` como string e o proxy converte para objeto) e evita que a UI conheça o shape do Ambrosio.
   - O proxy converte ids com `Number(...)` e omite chaves `undefined` no `PATCH`, permitindo atualização parcial real. O formulário, por simplicidade, envia sempre o conjunto completo de campos que edita.
   - Alternativa considerada: o formulário enviar o objeto aninhado — rejeitada por duplicar o contrato externo na UI.

3. **Usar `PATCH` (não `PUT`) e normalizar mensagens de erro de forma robusta** (`Array.isArray(message) ? message.join(", ") : message`, com fallback por status).
   - Por quê: o backend expõe `PATCH`, e o filtro de exceções/validação alterna `message` entre string e array de strings.
   - O sucesso repassa o status do Ambrosio (`201` no create, `200` no update) e o corpo recebido; o formulário decide o fluxo apenas pelo status.

4. **Um componente de formulário por recurso, reutilizado em `novo` e `[id]`**, recebendo `urlBase` e a entidade opcional (mesma assinatura de `DioceseForm`).
   - Setor: `descricao`, `regiaoId` (Select alimentado por `GET /api/ambrosio/regiao`), `ativo` (Switch, padrão `true`).
   - Região: `descricao`, `macroRegiaoId` (Select alimentado por `GET /api/ambrosio/macro-regiao`), `ativo`.
   - Macro região: `descricao`, `ativo`.
   - Schemas `zod` limitam a descrição aos mesmos tamanhos do backend (50 para setor/macro região, 100 para região) e exigem o pai quando aplicável.
   - Por quê: replicar o padrão de `DioceseForm` reduz surpresa e reaproveita `Form`, `Select`, `Switch` e os toasts já existentes.

5. **Páginas `novo` renderizam o formulário direto; páginas `[id]` buscam a entidade e mostram `SkeletonLoading` até carregar.**
   - `404`/`401`/`403` na carga da entidade geram toast e redirecionamento para a listagem, evitando formulário vazio ou edição de recurso inexistente.
   - Após sucesso (create ou edit), o formulário exibe toast e redireciona para a listagem (`/dashboard/setores`, `/dashboard/regioes`, `/dashboard/macro-regiao`), que recarrega os dados no mount. Isso evita título/estado desatualizado na própria página de edição e é o mesmo destino já usado no cadastro de diocese/paróquia.
   - Alternativa considerada: permanecer na página após editar (como diocese) — rejeitada porque, com formulário simples, a lista é o feedback mais claro do resultado.

6. **Exibir as ações de escrita para todos os usuários**, sem gate de permissão no frontend.
   - Listagens: o botão "Cadastrar" e o link "Editar" aparecem sempre; páginas `novo` e `[id]` renderizam o formulário diretamente.
   - Por quê: o backend já rejeita escrita sem papel autorizado com `401/403`; duplicar a regra no frontend cria acoplamento desnecessário e risco de divergência. O formulário trata `401/403` com toast informando a falta de permissão.
   - Alternativa considerada: ocultar ações por papel no frontend — rejeitada por replicar uma regra de autorização que pertence ao backend.

7. **Exibir a situação (`ativo`) como `Badge` na listagem** (`Ativo`/`Inativo`) e permitir alterá-la no formulário.
   - Por quê: o campo existe no backend e passa a ser editável; sem indicador na lista o usuário não consegue perceber o efeito da alteração.
   - Alternativa considerada: não expor `ativo` — rejeitada porque o `PATCH` padrão do backend já o suporta e a edição ficaria incompleta.

8. **Correções pontuais nos arquivos tocados**: placeholder da busca de regiões passa a "Digite o nome da região ..." e a observação "Para cadastro de novos setores entrar em contato com o TI" é removida da tela de setores, já que o cadastro passa a ser self-service.

## Risks / Trade-offs

- **Ambrosio retorna envelope em `GET /:id` e corpo cru em `POST`/`PATCH`** → O proxy desembrulha `data.data` apenas no `GET /[id]`; nos writes repassa o corpo como recebido (o front só usa o status). Mitigação: validar os três endpoints no ambiente local durante a implementação.
- **Mensagens de erro variam entre string e array** → Normalização centralizada nos proxies e leitura tolerante no formulário (`data.message`), evitando toast com `undefined`.
- **Usuário sem papel autorizado** → O formulário permanece acessível, mas a requisição de escrita retorna `401/403` do backend e o frontend exibe o toast de falta de permissão, sem persistir dados.
- **Listas usam `slice(0, 10)`** e não há paginação → Um cadastro novo pode não aparecer na lista se houver mais de 10 registros. Fora de escopo mudar a paginação; o toast e o redirecionamento continuam sendo o feedback principal.
- **Sem `DELETE` no backend** → Não será oferecida exclusão; registros indesejados devem ser inativados via `ativo`.

## Migration Plan

- Mudança aditiva, sem migração de dados ou alteração de schema.
- Deploy pode ocorrer em qualquer ordem em relação ao backend, desde que os endpoints `POST`/`PATCH` do Ambrosio já estejam publicados (premissa informada).
- Rollback: reverter as rotas de proxy, os formulários/páginas e os ajustes de listagem em um único PR; nada persiste no frontend.