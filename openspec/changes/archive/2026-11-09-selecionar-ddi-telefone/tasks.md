# Tasks

## 1. Dependência e utilitários de telefone

- [x] 1.1 Instalar `libphonenumber-js` com `npm install libphonenumber-js` e verificar que aparece em `package.json`
- [x] 1.2 Criar utilitários de DDI/telefone (países, DDI via `getCountryCallingCode`, formatação com `AsYouType`, e o parse de edição com prioridade Brasil) e verificar com um teste rápido de execução (node ou teste unitário) cobrindo `11987654321`, `5511987654321` e um número internacional
- [x] 1.3 Verificar com `npx tsc --noEmit` que os utilitários não introduzem erros de tipo

## 2. Combobox de DDI/país

- [x] 2.1 Criar o componente de combobox de DDI/país usando `ui/popover` + `ui/command`, com busca por nome do país e DDI, nomes via `Intl.DisplayNames` (fallback ISO) e Brasil como valor inicial, e verificar via typecheck e inspeção que a lista é pesquisável
- [x] 2.2 Verificar manualmente que o combobox abre, filtra ao digitar um país/DDI e emite o país selecionado

## 3. Integrar no formulário de contato

- [x] 3.1 Em `src/components/custom/dashboard/pessoa/form-contato.tsx`, adicionar `pais` ao estado/schema, renderizar o combobox ao lado do telefone e substituir o `IMaskInput` de máscara fixa por um `Input` controlado que exibe `AsYouType(pais)` e guarda apenas dígitos nacionais, e verificar via typecheck e inspeção
- [x] 3.2 No submit, montar `telefone` como `getCountryCallingCode(pais)` + dígitos nacionais (sem `+`) e verificar manualmente que salvar no Brasil envia `5511987654321` e salvar com outro país usa o DDI correspondente
- [x] 3.3 No preenchimento da edição, separar o `telefone` persistido em país + número nacional com a heurística de prioridade Brasil e verificar manualmente que `11987654321` e `5511987654321` abrem com Brasil e número formatado, e um número internacional abre com o país correto
- [x] 3.4 Verificar com `npx eslint` (sobre os arquivos alterados) e `npx tsc --noEmit` que não há erros, e fazer o teste manual de cadastro e edição pelo dialog (toast, fechamento e atualização do card)

## 4. Verificação de integração

- [x] 4.1 Verificar de ponta a ponta pelo dialog que trocar o país muda a formatação do número e que o valor persistido no card corresponde a `DDI + número` (somente dígitos)
