# Tasks

## 1. Contrato e rota de regiões

- [x] 1.1 Adicionar `regioes` ao retorno de `GET /api/ambrosio/user/[id]`, normalizando o envelope da API externa e omitindo o campo quando estiver ausente (para acionar o fallback pelas paróquias); verificar com `npm run lint` e inspeção do retorno da rota
- [x] 1.2 Criar `src/app/api/ambrosio/user/[id]/regioes/route.ts` com `PATCH`, validando `regiaoIds` como array de inteiros e repassando para `PATCH {ambrosio}/users/:id/regioes`; verificar com chamada local e inspeção dos status 400/404/500
- [x] 1.3 Adicionar a constante `ROLE_SECRETARIA_CNC` em `src/constants.ts` (ou usar `UserRoleEnum.SECRETARIA_CNC` diretamente); verificar com `npm run build`

## 2. Componente de gestão de regiões

- [x] 2.1 Criar `src/components/custom/dashboard/usuarios/regioes-usuario.tsx` carregando `GET /api/ambrosio/regiao` (envelope `{ data }`), renderizando as regiões com caixas de seleção e controlando o estado de seleção; verificar com renderização manual e `npm run lint`
- [x] 2.2 Implementar a pré-seleção a partir de `regioes` do usuário e, como fallback, das regiões das `paroquias`; verificar com um usuário com regiões, um usuário com apenas paróquias e um usuário sem vínculos
- [x] 2.3 Implementar o salvamento via `PATCH /api/ambrosio/user/[id]/regioes` com `regiaoIds`, feedback de sucesso/erro e estado de carregamento; verificar com teste manual e inspeção da requisição no DevTools
- [x] 2.4 Tratar estados de carregamento, erro e lista vazia de regiões; verificar que o botão "Salvar" fica desabilitado quando não há regiões ou quando nenhuma está selecionada

## 3. Integração na página de usuário

- [x] 3.1 Renderizar `RegioesUsuario` somente quando `usuario.role === ROLE_SECRETARIA_CNC`, repassando `userId`, `regioes`, `paroquias` e o callback `onSalvo`; verificar com login `ADMIN` editando um usuário `SECRETARIA_CNC` e um usuário de outro papel
- [x] 3.2 Exibir as regiões atribuídas no card de dados do usuário `SECRETARIA_CNC`, com fallback pelas paróquias; verificar visualmente
- [x] 3.3 Garantir que o card de paróquias continue funcionando para todos os papéis; verificar com login `ADMIN` editando um usuário com paróquias

## 4. Tipos e validação final

- [x] 4.1 Definir o tipo local `UserComRegioes = User & { regioes?: Regiao[] }` e usá-lo na página e no componente; verificar com `npm run build`
- [x] 4.2 Executar `npm run lint` e `npm run build`, corrigindo os erros encontrados; verificar que ambos terminam com sucesso

## 5. Testes de integração

- [ ] 5.1 Adicionar `cypress/e2e/usuarios-regioes.cy.ts` com login, interceptação de `GET /api/ambrosio/regiao` e verificação de que o card "Regiões" aparece apenas para usuário `SECRETARIA_CNC`; verificar com `npx cypress run --spec cypress/e2e/usuarios-regioes.cy.ts`
- [ ] 5.2 Adicionar cenário no mesmo teste interceptando `PATCH /api/ambrosio/user/*/regioes` e verificando o corpo `{ regiaoIds: [...] }`; verificar com `npx cypress run --spec cypress/e2e/usuarios-regioes.cy.ts`

## Workflow follow-up

- Arquivar a mudança após a revisão do projeto.
- Sincronizar a spec `user-regioes` no arquivo de specs principal.
