# Design

## Context

O componente `ParoquiasUsuario` (`src/components/custom/dashboard/usuarios/paroquias-usuario.tsx`) já estabelece o padrão de gestão por usuário: recebe `userId` e a lista atual, pré-seleciona os vínculos, carrega as opções pela API interna e persiste via `PATCH /api/ambrosio/user/[id]/paroquias`. A página `/dashboard/usuarios/[id]` é restrita a `ADMIN` e exibe o card de paróquias.

O backend Ambrosio está sendo migrado de `usuarioSetor` para `usuarioRegiao`, com a rota `PATCH /users/:id/regioes` recebendo `regiaoIds`. O `GET /users/:id` passará a devolver `regioes`. A rota interna `GET /api/ambrosio/regiao` já retorna as regiões no envelope `{ data: Regiao[] }`.

## Goals / Non-Goals

**Goals:**

- Atribuir regiões diretamente a um usuário `SECRETARIA_CNC` pela página de edição.
- Persistir `regiaoIds` na rota `PATCH /api/ambrosio/user/[id]/regioes`.
- Reutilizar o padrão visual e de interação de `ParoquiasUsuario`.
- Exibir o card e as regiões atribuídas somente para usuários `SECRETARIA_CNC`.

**Non-Goals:**

- Manter o vínculo por setor no frontend; a migração para região é responsabilidade do backend.
- Alterar o fluxo de gestão de paróquias.
- Alterar o formulário de dados gerais do usuário.

## Decisions

**1. Persistência direta por região.**
O card envia `regiaoIds` das regiões marcadas, sem mapear setores. Isso acompanha a migração do backend para `usuarioRegiao` e elimina a necessidade de carregar a lista de setores. Alternativa considerada: manter o mapeamento região → setores — descartada porque o backend está mudando o contrato.

**2. Novo componente `RegioesUsuario` espelhando `ParoquiasUsuario`.**
O componente recebe `userId`, `regioes` atuais e `onSalvo`, carrega as regiões disponíveis, controla a seleção e persiste via PATCH. A página apenas decide se o renderiza e repassa o callback de atualização. Alternativa considerada: estender `ParoquiasUsuario` com um modo região — descartada por misturar capacidades.

**3. Carregar as regiões disponíveis pela rota interna.**
O componente consome `GET /api/ambrosio/regiao`, lê o envelope `{ data: [...] }` e renderiza uma lista com caixas de seleção. Não há carregamento de setores. Alternativa considerada: receber as regiões por props da página — descartada para manter o componente autônomo, como o de paróquias.

**4. Pré-seleção com fallback.**
A pré-seleção usa o campo `regioes` do usuário quando disponível. Quando o campo não estiver disponível (`undefined`), o componente deriva as regiões das paróquias do usuário (cada paróquia traz `setor.regiao`). Se nenhuma fonte estiver disponível, nenhuma região é marcada. Para que o fallback funcione, a rota interna do GET omite o campo `regioes` quando a API externa não o devolve; um array vazio explícito significa "usuário sem regiões" e não aciona o fallback.

**5. Nova rota `PATCH /api/ambrosio/user/[id]/regioes`.**
A rota valida `regiaoIds` como array de inteiros, repassa para `PATCH {ambrosio}/users/:id/regioes` com o token do cookie e normaliza os erros 400/404/500. Alternativa considerada: reutilizar uma rota genérica de vínculos — descartada para manter o padrão de recursos por usuário.

**6. Renderização condicional pelo papel do usuário editado.**
A página compara `usuario.role` com `UserRoleEnum.SECRETARIA_CNC` (ou a constante `ROLE_SECRETARIA_CNC`) e só renderiza o card nesse caso. A página continua restrita a `ADMIN`.

**7. Tipo local para o usuário com regiões.**
O tipo `User` da lib `neocatecumenal` não possui `regioes`. Para evitar alterar a lib neste repositório, a página e o componente usam `UserComRegioes = User & { regioes?: Regiao[] }`.

**8. Atualização após salvar.**
O componente chama `onSalvo` após o sucesso; a página incrementa `refreshKey` e recarrega o usuário, mantendo o card de dados e a pré-seleção sincronizados.

## Risks / Trade-offs

- [Backend ainda não devolver `regioes` no GET] → A rota interna omite o campo e o componente usa as regiões das paróquias como fallback; a dependência fica registrada para quando o backend concluir a migração.
- [Regiões sem paróquias/setores] → A região continua listada e atribuível; a persistência é apenas o vínculo de região.
- [Salvar com nenhuma região selecionada] → O botão fica desabilitado, seguindo o padrão de `ParoquiasUsuario`; limpar todos os vínculos exigiria uma mudança futura de UX.
- [Vínculos antigos por setor] → A migração do backend deve converter ou remover os vínculos; o frontend não manipula `usuarioSetor`.
- [Dados desatualizados após salvar] → O callback `onSalvo` recarrega o usuário e a lista de regiões.

## Migration Plan

O frontend deve ser implantado depois que a rota `PATCH /users/:id/regioes` e o campo `regioes` no `GET /users/:id` estiverem disponíveis no backend. Não há migration de banco no frontend. Rollback consiste em remover o card e a rota interna; os vínculos de região permanecem no backend.
