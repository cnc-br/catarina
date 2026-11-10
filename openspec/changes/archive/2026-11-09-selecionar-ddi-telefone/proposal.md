# Proposal

## Why

Hoje o input de telefone do dialog de contato (`ContatoForm`) usa uma máscara fixa com o DDI `+55` embutido e o número sempre é tratado como brasileiro. Isso impede registrar contatos de outros países. Além disso, o DDI não é uma escolha explícita do usuário — ele está codificado na máscara e concatenado automaticamente ao salvar.

## What Changes

- Adicionar um **combobox separado para o DDI/país** ao lado do input de telefone no dialog de contato, com busca por país/DDI, **Brasil (`+55`) como padrão** e suporte a todos os países.
- Ajustar a máscara do input de telefone para depender do país selecionado: o número nacional é formatado conforme o país (via `libphonenumber-js`), e o `+55` deixa de ser um literal fixo da máscara.
- Ao salvar, **juntar** o DDI selecionado (somente dígitos) ao número nacional (somente dígitos) no campo `telefone`, mantendo o formato atual já persistido (ex.: `5511987654321`), sem `+`.
- Ao editar um contato existente, **separar** o `telefone` persistido em país/DDI + número nacional para pré-preencher o combobox e o input. Valores legados sem DDI (10/11 dígitos válidos como brasileiro) são interpretados como Brasil.
- Adicionar a dependência `libphonenumber-js` para obter a lista de países, os códigos de DDI e a formatação/parse por país.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities
- `pessoa-contato`: o dialog de contato passa a ter um combobox de DDI/país (padrão Brasil) e uma máscara de telefone que se adapta ao país selecionado, com o valor persistido em `telefone` como DDI + número (somente dígitos, sem `+`). Ajusta o comportamento de entrada/salvamento de telefone descrito nas ações de cadastro e edição de contato.

## Impact

- `package.json`: nova dependência `libphonenumber-js`.
- `src/components/custom/dashboard/pessoa/form-contato.tsx`: input de telefone deixa de usar a máscara fixa com `+55`; passa a ter estado de país/DDI, formatação por país e concatenação DDI + número no submit.
- Novo componente de combobox de DDI/país (usando `ui/popover` + `ui/command` já instalados), provavelmente em `src/components/custom/dashboard/pessoa/`.
- `src/components/custom/dashboard/pessoa/dialog-contato/dialog-contato.tsx`: sem mudança de props esperada (o estado do DDI vive no `ContatoForm`).
- API local (`/api/ambrosio/pessoa/[id]/contato` e `.../contato/[contatoId]`) e backend Ambrosio: **sem alteração**. O `telefone` continua sendo enviado como string de dígitos; a validação existente (`telefone` obrigatório, `@MaxLength(20)`) permanece compatível.
- Dados existentes: contatos já salvos continuam editáveis; a separação DDI/número usa heurística com Brasil como padrão.
