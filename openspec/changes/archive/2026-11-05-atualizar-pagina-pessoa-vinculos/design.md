# Design

## Context

Ver `proposal.md` — Why. A página `/dashboard/pessoas/[id]` é um Client Component que carrega `Pessoa` em `useEffect` e mantém o resultado em estado local. O dialog de contato já resolve o mesmo problema com um callback opcional (`onContatoSalvo`), que a página usa para chamar `getPessoa` novamente. Os dialogs de cônjuge e de comunidade não expõem callback algum, por isso o estado local permanece desatualizado até um reload.

## Goals / Non-Goals

**Goals:**
- Reaproveitar o padrão de callback já existente na página para manter os cards sincronizados.
- Manter os dialogs reutilizáveis e independentes da página (callbacks opcionais).

**Non-Goals:**
- Alterar as rotas de API ou o contrato com o Ambrosio.
- Introduzir cache global, SWR ou React Query.
- Atualizar automaticamente outras páginas ou abas abertas.

## Decisions

### Callback opcional + refetch local, em vez de `router.refresh()`
A página é Client Component e busca os dados no navegador; `router.refresh()` reexecuta apenas Server Components e não refetcharia o estado local. Portanto, os dialogs recebem props opcionais (`onConjugueVinculado`, `onComunidadeVinculada`) e a página as implementa chamando `getPessoa(parseInt(id))` e atualizando `pessoa`.

Alternativa considerada: fazer o próprio dialog buscar a pessoa e repassá-la — rejeitada por acoplar o dialog ao formato de dados da página.

### Reutilizar o mesmo recarregamento dos contatos
Extrair um único `recarregarPessoa` na página e usá-lo nos três callbacks (contato, cônjuge, comunidade), evitando duplicação.

### Fechamento do dialog de cônjuge sem estado controlado
Após o refetch, `pessoa.conjugue` passa a existir e o bloco `!pessoa.conjugue` deixa de renderizar `DialogPessoaCasada`, removendo o dialog da árvore. Não é necessário controlar `open` nesse componente.

### Callback somente em sucesso
O callback é disparado depois da confirmação de sucesso da requisição (status ok); em erro, o fluxo atual de toast é mantido e nenhum refetch ocorre.

## Risks / Trade-offs

- **Requisição duplicada de `getPessoa`** ao usar `BASE_URL` em produção → mitigado reutilizando o helper existente e um único ponto de recarga.
- **Resposta do GET ainda em cache** → as rotas internas usam `fetch` do Next 16 (sem cache por padrão); se necessário, validar com uma chamada após o POST em teste manual.
- **Atualização do dialog de comunidade antes de fechar** → a sequência é: toast, `setOpen(false)`, `resetForm()`, callback; a ordem evita exibir dados antigos no dialog reaberto.
