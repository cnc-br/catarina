# Tasks

## 1. Botão de cadastro no card "Carismas da comunidade"

- [x] 1.1 Em `src/app/dashboard/comunidades/[id]/page.tsx`, adicionar um `Button` "Cadastrar pessoa" dentro do card "Carismas da comunidade" (fora do condicional de carismas), envolvido por um `Link` para `/dashboard/pessoas/novo?comunidadeId=${id}`, e verificar (`npm run build`) que o arquivo compila sem erros de tipagem
- [x] 1.2 Verificar manualmente em `/dashboard/comunidades/{id}` que o botão aparece tanto para comunidades com carismas quanto para comunidades sem carismas, e que o clique navega para `/dashboard/pessoas/novo?comunidadeId={id}`

## 2. Repasse do comunidadeId ao formulário

- [x] 2.1 Em `src/app/dashboard/pessoas/novo/page.tsx`, ler o query param `comunidadeId` com `useSearchParams` e passá-lo como prop opcional `comunidadeId` ao `<PessoaForm>`, e verificar que, em `/dashboard/pessoas/novo?comunidadeId=123`, o param é recebido no componente
- [x] 2.2 Atualizar a interface `PessoaFormProps` em `src/components/custom/dashboard/pessoa/form-pessoa.tsx` para incluir `comunidadeId?: string` e desestruturá-lo, e verificar (`npm run build`) que a tipagem compila

## 3. Envio do comunidadeId à API ambrosio

- [x] 3.1 Em `form-pessoa.tsx`, no `handleSubmit`, montar a URL de criação (`POST ${urlBase}/api/ambrosio/pessoa`) anexando `?comunidadeId={comunidadeId}` quando a prop estiver presente (manter a URL atual quando ausente; não alterar o `PATCH` de edição), e verificar (`npm run build`) que o arquivo compila
- [x] 3.2 Em `src/app/api/ambrosio/pessoa/route.ts`, no handler `POST`, extrair o query param `comunidadeId` da requisição recebida (`new URL(req.url).searchParams.get("comunidadeId")`) e, quando presente, repassá-lo na URL do `fetch` ao backend ambrosio (`${url}?comunidadeId={comunidadeId}`), mantendo a URL atual quando ausente, e verificar (`npm run build`) que o arquivo compila
- [x] 3.3 Verificar manualmente o fluxo de cadastro a partir da comunidade: criar uma pessoa via `/dashboard/pessoas/novo?comunidadeId={id}` e confirmar que a requisição `POST` e o repasse ao backend incluem o query param `comunidadeId` e a pessoa é associada à comunidade
- [x] 3.4 Verificar a regressão: cadastrar uma pessoa pelo fluxo normal (`/dashboard/pessoas/novo` sem query param) e confirmar que a requisição `POST` e o repasse ao backend não incluem `comunidadeId` e o comportamento permanece o mesmo de antes

## 4. Integração

- [x] 4.1 Rodar `npm run lint` e `npm run build` e confirmar que passam sem erros, validando o fluxo completo de cadastro de pessoa (com e sem `comunidadeId`)

## Workflow follow-up

- Archivear a mudança após os critérios de revisão serem atendidos.
- Verificar o resultado arquivado.