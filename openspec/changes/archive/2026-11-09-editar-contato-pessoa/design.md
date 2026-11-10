# Design

## Context

See proposal.md - Why. The dashboard already cadastra contatos de pessoa via `POST /api/ambrosio/pessoa/[id]/contato` (rota local em `src/app/api/ambrosio/pessoa/[id]/contato/route.ts`) e os exibe no card "Contatos" de `/dashboard/pessoas/[id]`. Não existe edição. O repositório já tem um padrão de dialog que alterna entre criar/editar no `AvisoFormDialog` (`src/components/custom/dashboard/avisos/aviso-form-dialog.tsx`): prop opcional da entidade, `isEditing = !!entidade`, `form.reset` ao abrir, e troca do método entre POST e PATCH conforme o modo. A API externa Ambrosio oferece `PATCH {ambrosio}/pessoas/:id/contato/:contatoId`.

## Goals / Non-Goals

**Goals:**
- Expor a rota `PATCH /api/ambrosio/pessoa/[id]/contato/[contatoId]` com as mesmas validações do POST existente.
- Reaproveitar `DialogContato` e `ContatoForm` para edição, sem duplicar o formulário.
- Botão de edição por contato no card "Contatos", recarregando a pessoa após salvar.

**Non-Goals:**
- Exclusão (DELETE) de contatos — o card "Endereços" já tem um botão de lixeira desabilitado como precedente de ação futura, mas excluir contato fica fora deste change.
- Alterar o `POST` existente ou o GET da pessoa.
- Refatorar a rota para um handler compartilhado com o `[id]/route.ts` (o padrão atual é uma rota por arquivo; manter).

## Decisions

### 1. Novo arquivo de rota `[contatoId]/route.ts`, não PATCH dentro de `contato/route.ts`
**Decisão:** criar `src/app/api/ambrosio/pessoa/[id]/contato/[contatoId]/route.ts` com `export async function PATCH`.
**Por quê / Alternativas:** no App Router, uma rota só casa os segmentos dinâmicos declarados na própria árvore de pastas do arquivo. `contato/route.ts` casa apenas `/pessoa/[id]/contato` (sem `contatoId`), então um PATCH lá não receberia o parâmetro. A alternativa (rotear tudo em uma `route.ts` única com `[...]`) foi descartada por fugir do padrão de uma rota por arquivo usado em todo `src/app/api/ambrosio`. A duplicação da validação entre POST e PATCH é pequena (três checagens) e segue o padrão atual de cada rota ser autocontida.

### 2. Compartilhar a validação copiando a lógica do POST
**Decisão:** replicar no PATCH as mesmas validações do POST: enum `tipoTelefone` (CELULAR/RESIDENCIAL/COMERCIAL), `telefone` obrigatório não-vazio, e `email` opcional validado por regex quando presente.
**Por quê / Alternativas:** extrair um helper compartilhado reduziria duplicação, mas adicionaria um módulo novo para três checagens; o POST atual já repete `TIPOS_TELEFONE` e `EMAIL_REGEX` no topo do arquivo com dois imports (`AmbrosioBaseUrl`, `cookies`). Manter a rota autocontida é mais consistente com o padrão do `src/app/api/ambrosio`. Se no futuro houver um terceiro verbo, um helper vale a pena.

### 3. `ContatoForm` ganha prop opcional `contato` e deriva o modo edição
**Decisão:** `ContatoForm` passa a aceitar `contato?: PessoaContato`. `isEditing = !!contato`. Com `useEffect` no mount/`contato` (padrão do `AvisoFormDialog`), `form.reset(...)` pré-preenche com os valores do contato (inclusive `contatoPrincipal`, que o schema já modela como boolean). No submit, a URL é `.../contato/${contato.id}` com método `PATCH` quando editando, senão o POST atual.
**Por quê / Alternativas:** o formulário atual só tem defaultValues fixos e não resetaria com dados do contato; sem o reset, abrir a edição de um segundo contato manteria dados do anterior. `useEffect` + reset resolve isso e é o mesmo padrão já validado no `AvisoFormDialog`.

### 4. `DialogContato` aceita `contato?` e alterna título/descrição
**Decisão:** `DialogContato` ganha `contato?: PessoaContato` (além dos props atuais `pessoaId`, `urlBase`, `onContatoSalvo`). Título/descrição mudam para "Editar contato" / "Atualize os dados de contato dessa pessoa" quando editando, e o trigger continua sendo um `Button`. O card da página usará o mesmo dialog com `contato={contato}` por contato listado.
**Por quê / Alternativas:** é o reaproveitamento pedido — o dialog não sabe se cria ou edita, apenas repassa o `contato` opcional para o form. Uma alternativa (novo componente `DialogEditarContato`) duplicaria o wrapper do dialog à toa.

### 5. Botão de edição por contato no card "Contatos"
**Decisão:** no mapa de `pessoa.contatos` em `src/app/dashboard/pessoas/[id]/page.tsx`, adicionar um `Button` de edição (ícone `Pencil`, `variant="outline"`, `size="sm"`) por contato, que abre `DialogContato` com `contato={contato}`. O `onContatoSalvo` existente (`recarregarPessoa`) já recarrega a pessoa após salvar — reutilizar direto.
**Por quê / Alternativas:** mantém a página como orquestradora do estado (mesmo papel que já exerce para o dialog de cadastro) e não exige novo estado local de "contato em edição" porque cada dialog é instanciado dentro do próprio item do mapa, com seu próprio trigger.

## Risks / Trade-offs

- [Duplicação das validações entre POST e PATCH] → Mitigação: as três checagens são idênticas e pequenas; se divergirem no futuro, extrair helper e reutilizar nas duas rotas.
- [Pré-preenchimento do form depende do `useEffect`; em edição o submit abre com URL do contato] → Mitigação: seguir estritamente o padrão do `AvisoFormDialog` (reset no open/`contato`, método e URL derivados de `isEditing`), com teste manual de "editar contato A, cancelar, editar contato B".
- [Rota 404 do PATCH na API externa pode significar contato da pessoa ou pessoa inexistente] → Mitigação: repassar o status/envio da API externa (mesmo comportamento de espelhamento do POST), evitando inferir sem dados da API.

## Migration Plan

Sem migração de dados. Deploy padrão: a rota nova entra junto com o frontend no mesmo deploy do Next. Rollback: reverter o commit; o POST e o GET continuam funcionando sem a rota PATCH (a edição simplesmente deixa de abrir o dialog em modo edição se os botões forem revertidos juntos).
