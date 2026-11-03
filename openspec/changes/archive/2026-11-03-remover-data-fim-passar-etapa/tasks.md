# Tasks

## 1. Remover dataFim do dialog

- [x] 1.1 Remover a entrada `dataFim: z.date().optional()` do schema `formSchema` em `src/components/custom/dashboard/comunidade/dialog-passar-etapa.tsx` e verificar que nenhum outro referência ao campo quebra (build/lint).
- [x] 1.2 Remover `dataFim: etapa?.dataFim ? new Date(etapa.dataFim) : undefined` dos `defaultValues` do `useForm` e verificar que o formulário inicializa sem erro.
- [x] 1.3 Remover o bloco `FormField` com `name="dataFim"` ("Data final etapa") do JSX e verificar que o dialog renderiza sem o campo (inspeção visual e build).

## 2. Remover dataFim do payload da API

- [x] 2.1 Remover a linha `dataFim: payload.dataFim,` do objeto `etapa` em `src/app/api/ambrosio/comunidade/[comunidadeId]/etapa/[etapaComunidadeId]/route.ts` (PATCH) e verificar que o PATCH passa a montar o corpo sem `dataFim`.
- [x] 2.2 Confirmar que `src/app/api/ambrosio/comunidade/[comunidadeId]/etapa/route.ts` (POST) já não envia `dataFim` no objeto `etapa` e verificar que o payload permanece sem o campo.

## 3. Remover leitura e exibição de dataFim

- [x] 3.1 Remover a linha `dataFim: ce?.dataFim ? new Date(ce.dataFim) : undefined,` da normalização em `src/hooks/useComunidadeById.ts` e verificar que o hook compila e carrega a comunidade sem erro de tipo.
- [x] 3.2 Remover `dataFim` da linha de exibição em `src/app/dashboard/comunidades/[id]/page.tsx` (exibir apenas `formatDate(ce.dataInicio)`) e verificar que a listagem renderiza sem o campo.

## 4. Verificação de integração

- [x] 4.1 Exercitar o fluxo completo pelo dialog (criar e editar etapa) verificando, via inspeção do request/request body nas ferramentas de rede do navegador, que o payload do POST e do PATCH não contém `dataFim`.
- [x] 4.2 Verificar que o build de produção (`next build` ou script equivalente) e o lint passam sem erros após as remoções, confirmando que não restam referências a `dataFim` no código do frontend.