# Proposal

## Why

As telas de Setores, Regiões e Macro Regiões hoje apenas listam registros: os botões "Cadastrar" estão ocultos e a coluna "Ações" não oferece nenhuma operação. O backend Ambrosio já expõe `POST` e `PATCH` para os três recursos, mas o frontend não possui formulários nem rotas de proxy para consumi-los, de modo que qualquer inclusão ou correção exige acesso direto à API externa. Esta mudança fecha essa lacuna e devolve autonomia operacional ao usuário administrativo.

## What Changes

- Adicionar `POST` às rotas internas `src/app/api/ambrosio/(mapa)/setor/route.ts`, `.../regiao/route.ts` e `.../macro-regiao/route.ts`, e criar rotas `[id]/route.ts` com `GET` e `PATCH` para cada recurso, seguindo o padrão de proxy autenticado já usado em diocese e paróquia.
- Criar formulários com `react-hook-form` + `zod` para os três recursos: descrição e vínculo com o pai obrigatório (Setor → Região, Região → Macro Região) e alternador "Ativo".
- Criar páginas de cadastro (`/dashboard/setores/novo`, `/dashboard/regioes/novo`, `/dashboard/macro-regiao/novo`) e de edição (`/dashboard/setores/[id]`, `/dashboard/regioes/[id]`, `/dashboard/macro-regiao/[id]`).
- Habilitar o botão "Cadastrar" nas três listagens e substituir "Nenhuma ação" por um link "Editar" por linha; exibir a situação (Ativo/Inativo).
- Exibir as ações de escrita para todos os usuários autenticados; a autorização é responsabilidade do Ambrosio, que responde `401/403` e o frontend apenas exibe a mensagem retornada.
- Corrigir detalhes das telas atuais: placeholder de busca de Regiões e observação desatualizada da tela de Setores.

## Capabilities

### New Capabilities

- `setores`: cadastro e edição de setores no dashboard, incluindo o vínculo obrigatório com uma região.
- `regioes`: cadastro e edição de regiões no dashboard, incluindo o vínculo obrigatório com uma macro região.
- `macro-regioes`: cadastro e edição de macro regiões no dashboard.

### Modified Capabilities

Nenhuma. Não há specs existentes para esses recursos e as mudanças não alteram requisitos de `paroquias`, `users` ou das demais capabilities.

## Impact

- **API interna (proxy)**: novos `POST` em `src/app/api/ambrosio/(mapa)/{setor,regiao,macro-regiao}/route.ts` e novos arquivos `[id]/route.ts` com `GET` e `PATCH`.
- **API externa**: consumo de `POST /setor`, `PATCH /setor/:id`, `GET /setor/:id`, `POST /regiao`, `PATCH /regiao/:id`, `GET /regiao/:id`, `POST /macro-regiao`, `PATCH /macro-regiao/:id` e `GET /macro-regiao/:id` do Ambrosio, com Bearer token do cookie de sessão.
- **UI**: páginas em `src/app/dashboard/(pontos-fisicos)/{setores,regioes,macro-regiao}/`, novos componentes de formulário em `src/components/custom/dashboard/{setores,regiao,macro-regioes}/` e ajustes nas listagens existentes.
- **Sem quebras**: mudanças aditivas; `GET` das listagens e demais recursos permanecem inalterados.
- **Fora de escopo**: exclusão de setores, regiões e macro regiões (o backend não expõe `DELETE`) e operações em lote.