# Design

## Context

See proposal.md - Why. Hoje `src/components/custom/dashboard/pessoa/form-contato.tsx` usa `IMaskInput` (react-imask) com uma máscara fixa que já contém o literal `+55`, e helpers `removerDdi`/`adicionarDdi` que sempre assumem o DDI `55`. O estado do formulário (`react-hook-form`) guarda `telefone` como dígitos nacionais (sem DDI) e o `handleSubmit` prefixa `55` ao montar o payload — por isso o valor persistido hoje é somente dígitos (ex.: `5511987654321`). O backend (Ambrosio/São Pedro) grava `telefone` como dígitos, sem `+`, com `@MaxLength(20)`.

O repositório já possui `ui/popover` e `ui/command` (shadcn), mas não tem biblioteca de telefone/país. `Pais`/`IPais` é a entidade de nacionalidade da pessoa, não uma tabela de DDI.

## Goals / Non-Goals

**Goals:**
- DDI como combobox separado, todos os países, Brasil padrão.
- Máscara/formatação do número dependente do país selecionado.
- Persistência preservada: `telefone` = dígitos do DDI + dígitos do número, sem `+`.
- Edição de contatos existentes (com e sem DDI) sem quebra.

**Non-Goals:**
- Alterar a API local, o backend ou o schema de dados.
- Exibir o telefone formatado no card "Contatos" (continua mostrando o valor persistido cru).
- Validar estritamente se o número é válido/discável por país (`isValidPhoneNumber`); mantém-se apenas "obrigatório".
- Criar uma tabela própria de países/DDI — será usada a metadata do `libphonenumber-js`.

## Decisions

### 1. Usar `libphonenumber-js` como fonte de países, DDIs e formatação
**Decisão:** adicionar `libphonenumber-js` e usar `getCountries()`, `getCountryCallingCode(iso)` e `AsYouType(iso).input(digits)` para formatar, além de `parsePhoneNumberFromString` para o parse na edição.
**Alternativas:** (a) tabela estática de DDI + máscaras escritas à mão — vira manutenção inviável para "todos os países"; (b) `react-imask` por país — não há máscara pronta por país e a metadata do libphonenumber já resolve. O pacote padrão (`libphonenumber-js`, não `/max`) mantém o bundle razoável.

### 2. Separar o estado em país + número nacional (não concatenar antes de salvar)
**Decisão:** o formulário mantém dois valores: `pais` (código ISO, ex.: `BR`) e `telefone` (dígitos nacionais, sem DDI). O input exibe o número formatado via `AsYouType(pais)` e grava só os dígitos em `telefone`. No submit, monta-se `telefone = getCountryCallingCode(pais) + telefone`.
**Por quê:** concatenar o DDI no estado do input gera o problema de round-trip parcial já observado (valor `55` + número parcial sendo re-mascarado errado). Manter nacional e DDI separados no estado elimina essa classe de bug e deixa o combobox como única fonte do DDI.

### 3. Parse na edição com Brasil como prioridade para valores legados
**Decisão:** ao abrir a edição, a partir dos dígitos persistidos `digits`:
1. se `digits` tem 10 ou 11 dígitos e `isValidPhoneNumber(digits, "BR")` → país `BR`, nacional `digits`;
2. senão, se `parsePhoneNumberFromString("+" + digits)` for válido → usa `country` e `nationalNumber` retornados;
3. senão → país `BR` e nacional `digits` (fallback).
**Por quê / Alternativas:** valores legados (`11987654321`, sem DDI) são maioria e precisam abrir como Brasil; sem a prioridade brasileira, `"+" + "11987654321"` poderia ser lido como um número dos EUA/Canadá (`+1`). A ordem acima evita esse falso positivo para o caso comum. Limitação: um número internacional de 10–11 dígitos que também seja válido como brasileiro será lido como Brasil — o usuário pode corrigir no combobox.

Além do parse, o número nacional é normalizado ao salvar e ao carregar removendo DDI(s) repetido(s) quando o valor excede o tamanho máximo nacional (11 no Brasil; demais países pelo limite E.164). Isso torna o salvamento idempotente mesmo se o DDI tiver vazado para o campo (ex.: usuário colou `+55 ...`), sem remover um DDD que coincida com o DDI (ex.: DDD 55 no Brasil).

### 4. Combobox com `Popover` + `Command`
**Decisão:** novo componente de combobox usando `ui/popover` + `ui/command` (já instalados), com busca por nome do país e DDI, país padrão `BR`. Nome de exibição via `Intl.DisplayNames(["pt-BR"], { type: "region" })`, com fallback para o código ISO; bandeira opcional por emoji do ISO.
**Por quê / Alternativas:** um `Select` com ~200 itens é ruim de navegar; `Command` já traz busca e é o padrão shadcn de combobox. `Intl.DisplayNames` evita importar um dataset de nomes de países.

### 5. O estado do DDI fica no `ContatoForm`
**Decisão:** `pais` e `telefone` vivem no `ContatoForm`; `DialogContato` continua repassando apenas `contato`/`pessoaId`/`urlBase`. O `IMaskInput` é substituído por um `Input` controlado que formata via `AsYouType` e persiste apenas dígitos. O input limita a quantidade de dígitos ao tamanho máximo do número nacional do país selecionado, obtido da metadata do `libphonenumber-js` (`countries[iso][3]`; ex.: BR até 11, PT até 9).
**Por quê:** o dialog já é um wrapper fino; manter o estado no form preserva a reutilização de cadastro/edição e não exige novas props. O limite evita que o usuário digite dígitos além do permitido e impede que o DDI se acumule no campo.

## Risks / Trade-offs

- [Tamanho de bundle do `libphonenumber-js`] → Mitigação: importar o pacote padrão (não `/max`) e apenas as funções usadas.
- [Ambiguidade ao separar DDI de valores legados/internacionais de 10–11 dígitos] → Mitigação: heurística com prioridade Brasil e combobox editável; documentado como limitação.
- [`Intl.DisplayNames` indisponível em ambiente antigo] → Mitigação: fallback para o código ISO do país.
- [Formatação diverge do valor persistido] → Mitigação: `AsYouType` é só de exibição; o valor guardado/enviado é sempre `digits` (nacional) e `DDI + digits` no submit.
- [Número internacional concatenado pode crescer] → Mitigação: números E.164 têm no máximo ~15 dígitos, abaixo do `@MaxLength(20)` do backend.
- [DDI colado no campo de telefone] → Mitigação: normalização remove DDI(s) excedente(s) ao carregar e ao salvar (limite de 11 dígitos no Brasil; E.164 nos demais), evitando duplicação a cada edição. Contatos já corrompidos por salvamentos anteriores precisam ter o número re-digitado uma vez.

## Migration Plan

Sem migração de dados. Contatos existentes continuam válidos e editáveis (parse com prioridade Brasil). Deploy conjunto de dependência + formulário no mesmo build do Next. Rollback: reverter o commit; valores já salvos como `DDI + número` continuam legíveis pelo comportamento anterior (que assume Brasil), desde que sejam brasileiros.
