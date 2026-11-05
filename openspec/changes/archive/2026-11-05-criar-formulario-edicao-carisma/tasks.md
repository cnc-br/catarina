# Tasks

## 1. Contrato de atualização no backend

- [x] 1.1 Confirmar no backend `AmbrosioBaseUrl/carismas/{id}` qual método (`PATCH` ou `PUT`) e payload (`descricao`, `tipo`, `casalAndaJunto`) são aceitos; registrar o resultado no design.md. Verificação: uma requisição manual (curl/Insomnia) de atualização em um carisma de teste retorna 2xx e reflete os campos alterados.
- [x] 1.2 Criar `src/app/api/ambrosio/configuracoes/carismas/[id]/route.ts` com handler `PATCH` que lê o cookie `token`, repassa o body para `${AmbrosioBaseUrl}/carismas/${id}` com `Authorization: Bearer` e `Content-Type: application/json`, e devolve status/body reais do backend. Verificação: `curl -X PATCH /api/ambrosio/configuracoes/carismas/1` com body válido retorna o status esperado e não mascara erros.

## 2. Componente de formulário e Dialog

- [x] 2.1 Criar schema `zod` para o formulário (`descricao` string não vazia, `tipo` enum `TipoCarismaEnum`, `casalAndaJunto` boolean) em `src/components/custom/dashboard/carismas/` e verificar que ele rejeita `descricao` vazia em um teste unitário ou chamada direta de `safeParse`.
- [x] 2.2 Criar o componente de Dialog de edição (`CarismaEditDialog`) usando `src/components/ui/dialog.tsx`, com `react-hook-form` + `zodResolver`, campos `descricao` (Input), `tipo` (Select dos `TipoCarismaEnum`) e `casalAndaJunto` (Switch). Verificação: renderizar o Dialog com um `Carisma` de teste exibe os valores atuais preenchidos.
- [x] 2.3 Implementar o submit do Dialog chamando `PATCH /api/ambrosio/configuracoes/carismas/{id}`, exibindo estado de loading, mensagem de erro em falha e fechando em sucesso. Verificação: em dev, salvar um carisma mostra o Dialog fechando e a mensagem de sucesso; simular falha (id inválido) mantém o Dialog aberto com erro visível.

## 3. Integração na listagem

- [x] 3.1 Extrair o `fetchCarismas` do `useEffect` em `src/app/dashboard/(configuracoes)/carismas/page.tsx` para uma função reutilizável acionada por um `refreshKey` e adicionar estado `carismaEmEdicao: Carisma | null`. Verificação: `npm run lint` e `npm run build` (ou `tsc --noEmit`) passam sem erros de tipo.
- [x] 3.2 Adicionar botão de edição (ícone `Pencil`) por item em `ListagemDeCarismas` via prop `onEdit?: (c: Carisma) => void`, renderizando o botão apenas quando `onEdit` é fornecido. Verificação: a seção de carismas reais mostra o botão e a seção de "Situações Religiosas" não mostra.
- [x] 3.3 Conectar o `onEdit` da listagem ao estado da página, montar o `CarismaEditDialog` na página e chamar `fetchCarismas` após sucesso. Verificação: editar um carisma atualiza a listagem sem recarregar a página; conferir também que a marcação "(Casal anda junto)" aparece/desaparece conforme o toggle.
- [x] 3.4 Resolver o risco de cache do `GET` (`revalidate: 30`) após o update — usar `revalidate: 0`/`cache: "no-store"` no GET de configuração ou `router.refresh()` após o PATCH. Verificação: salvar um carisma e confirmar que a listagem reflete a alteração imediatamente.

## 4. Verificação final

- [x] 4.1 Executar lint, typecheck e build do projeto e confirmar que passam. Verificação: comandos do `package.json` concluem sem erros.
- [x] 4.2 Validar a change com `openspec validate criar-formulario-edicao-carisma --strict`. Verificação: comando retorna sucesso sem warnings.

## Workflow follow-up

- Arquivar a change após a implementação e revisão.
