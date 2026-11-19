# Tasks

## 1. Rotas de proxy no BFF

- [x] 1.1 Em `src/app/api/ambrosio/(mapa)/setor/route.ts`, adicionar `POST` que lê o cookie `token`, valida `descricao` e `regiaoId` e repassa `{ descricao, regiao: { id: Number(regiaoId) }, ativo }` para `${AmbrosioBaseUrl}/setor`, normalizando `message` string/array; verificar com `npm run lint` e uma requisição local que o sucesso retorna `201` e o erro preserva status/mensagem.
- [x] 1.2 Criar `src/app/api/ambrosio/(mapa)/setor/[id]/route.ts` com `GET` (desembrulha `data.data`) e `PATCH` (corpo parcial com `descricao`, `regiao`, `ativo`), mapeando `404` para "Setor não encontrado" e `401`/`403` para mensagem de permissão; verificar com `npm run lint` e uma edição local que o `GET` retorna a região vinculada.
- [x] 1.3 Em `src/app/api/ambrosio/(mapa)/regiao/route.ts`, adicionar `POST` que valida `descricao` e `macroRegiaoId` e repassa `{ descricao, macroRegiao: { id: Number(macroRegiaoId) }, ativo }` para `${AmbrosioBaseUrl}/regiao` com Bearer token; verificar com `npm run lint` e um cadastro local bem-sucedido (`201`).
- [x] 1.4 Criar `src/app/api/ambrosio/(mapa)/regiao/[id]/route.ts` com `GET` (desembrulha `data.data`) e `PATCH` parcial, mapeando `404` para "Região não encontrada" e `401`/`403` para mensagem de permissão; verificar com `npm run lint` e uma edição local que a macro região vinculada é retornada.
- [x] 1.5 Em `src/app/api/ambrosio/(mapa)/macro-regiao/route.ts`, adicionar `POST` que valida `descricao` e repassa `{ descricao, ativo }` para `${AmbrosioBaseUrl}/macro-regiao` com Bearer token; verificar com `npm run lint` e um cadastro local bem-sucedido (`201`).
- [x] 1.6 Criar `src/app/api/ambrosio/(mapa)/macro-regiao/[id]/route.ts` com `GET` (desembrulha `data.data`) e `PATCH` parcial, mapeando `404` para "Macro região não encontrada" e `401`/`403` para mensagem de permissão; verificar com `npm run lint` e uma edição local bem-sucedida (`200`).

## 2. Formulários compartilhados

- [x] 2.1 Criar `src/components/custom/dashboard/setores/form-setor.tsx` com `react-hook-form` + `zod` (descrição 2–50, `regiaoId` obrigatório, `ativo` padrão `true`), Select de regiões carregado de `GET /api/ambrosio/regiao`, estados de loading/erro e fluxo POST/PATCH com toast e redirecionamento para `/dashboard/setores`; verificar via `npm run lint` e envio local de cadastro e edição.
- [x] 2.2 Criar `src/components/custom/dashboard/regiao/form-regiao.tsx` com schema (descrição 2–100, `macroRegiaoId` obrigatório, `ativo`), Select de macro regiões carregado de `GET /api/ambrosio/macro-regiao` e fluxo POST/PATCH com toast e redirecionamento para `/dashboard/regioes`; verificar via `npm run lint` e envio local de cadastro e edição.
- [x] 2.3 Criar `src/components/custom/dashboard/macro-regioes/form-macro-regiao.tsx` com schema (descrição 2–50, `ativo`) e fluxo POST/PATCH com toast e redirecionamento para `/dashboard/macro-regiao`; verificar via `npm run lint` e envio local de cadastro e edição.

## 3. Páginas de cadastro

- [x] 3.1 Criar `src/app/dashboard/(pontos-fisicos)/setores/novo/page.tsx` com `PageSubtitle` ("Cadastro de novo setor", botão Voltar para `/dashboard/setores`) e `SetorForm`; verificar no navegador que o formulário é exibido.
- [x] 3.2 Criar `src/app/dashboard/(pontos-fisicos)/regioes/novo/page.tsx` com título, botão Voltar para `/dashboard/regioes` e `RegiaoForm`; verificar no navegador que o formulário é exibido.
- [x] 3.3 Criar `src/app/dashboard/(pontos-fisicos)/macro-regiao/novo/page.tsx` com título, botão Voltar para `/dashboard/macro-regiao` e `MacroRegiaoForm`; verificar no navegador que o formulário é exibido.

## 4. Páginas de edição

- [x] 4.1 Criar `src/app/dashboard/(pontos-fisicos)/setores/[id]/page.tsx` que carrega `GET /api/ambrosio/setor/[id]`, exibe `SkeletonLoading` durante a busca, trata `404`/`401`/`403` com toast + redirecionamento e renderiza `SetorForm` com a entidade; verificar no navegador edição de setor existente e acesso a id inexistente.
- [x] 4.2 Criar `src/app/dashboard/(pontos-fisicos)/regioes/[id]/page.tsx` com o mesmo fluxo para `GET /api/ambrosio/regiao/[id]` e `RegiaoForm`; verificar no navegador edição de região existente e acesso a id inexistente.
- [x] 4.3 Criar `src/app/dashboard/(pontos-fisicos)/macro-regiao/[id]/page.tsx` com o mesmo fluxo para `GET /api/ambrosio/macro-regiao/[id]` e `MacroRegiaoForm`; verificar no navegador edição de macro região existente e acesso a id inexistente.

## 5. Listagens e navegação

- [x] 5.1 Em `src/app/dashboard/(pontos-fisicos)/setores/page.tsx`, habilitar o botão "Cadastrar" (`buttonShow: true`) e remover a observação de contato com o TI; verificar no navegador que o botão é exibido.
- [x] 5.2 Em `src/components/custom/dashboard/setores/list-setor.tsx`, substituir "Nenhuma ação" por um link "Editar" para `/dashboard/setores/[id]` e adicionar coluna "Situação" com `Badge` Ativo/Inativo; verificar no navegador que o link navega e o badge reflete o dado.
- [x] 5.3 Em `src/app/dashboard/(pontos-fisicos)/regioes/page.tsx`, habilitar o botão "Cadastrar"; verificar no navegador que o botão é exibido.
- [x] 5.4 Em `src/components/custom/dashboard/regiao/list-regiao.tsx`, corrigir o placeholder para "Digite o nome da região ...", substituir "Nenhuma ação" pelo link "Editar" para `/dashboard/regioes/[id]` e adicionar `Badge` de situação; verificar no navegador navegação e exibição.
- [x] 5.5 Em `src/app/dashboard/(pontos-fisicos)/macro-regiao/page.tsx`, habilitar o botão "Cadastrar"; verificar no navegador que o botão é exibido.
- [x] 5.6 Em `src/components/custom/dashboard/macro-regioes/list-macro-regiao.tsx`, substituir "Nenhuma ação" pelo link "Editar" para `/dashboard/macro-regiao/[id]` e adicionar `Badge` de situação; verificar no navegador navegação e exibição.

## 6. Integração e verificação final

- [x] 6.1 Executar `npm run lint` e `npm run build`; confirmar que ambos terminam sem erros relacionados às mudanças.
- [x] 6.2 Testar ponta a ponta no navegador: cadastrar e editar um setor, uma região e uma macro região válidos, conferindo toast, redirecionamento e atualização na listagem; testar validação local (campos vazios), erro da API (ex.: descrição duplicada/longa) e resposta `401/403` do backend ao tentar escrever sem permissão, confirmando que o formulário exibe o toast de falta de permissão.

## Workflow follow-up

- Revisar os artefatos e a implementação com o responsável de produto/backend.
- Arquivar a mudança após a validação em ambiente de desenvolvimento.
