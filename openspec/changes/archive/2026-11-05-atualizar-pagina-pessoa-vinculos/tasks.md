# Tasks

## 1. Dialog de cônjuge

- [x] 1.1 Adicionar prop opcional `onConjugueVinculado` a `DialogPessoaCasada` e dispará-la somente após resposta de sucesso do `POST /api/ambrosio/pessoa/conjugue`; verificar que TypeScript compila (`npm run build`) e que a prop é opcional (uso atual da página continua válido).
- [x] 1.2 Remover da mensagem de sucesso do dialog a instrução "Atualize a página para ver as mudanças"; verificar que o toast de sucesso não contém mais esse texto.

## 2. Dialog de comunidade

- [x] 2.1 Adicionar prop opcional `onComunidadeVinculada` a `PessoaComunidade` e dispará-la somente após sucesso do `POST /api/ambrosio/comunidade/{id}/pessoa/{pessoaId}`, depois de fechar o dialog e resetar o formulário; verificar que erros continuam exibindo toast e não disparam o callback.

## 3. Página de detalhe da pessoa

- [x] 3.1 Extrair em `src/app/dashboard/pessoas/[id]/page.tsx` uma função `recarregarPessoa` que chama `getPessoa(parseInt(id))` e atualiza o estado `pessoa`, reutilizada também pelo `handleContatoSalvo`; verificar que o comportamento do card de contatos permanece igual.
- [x] 3.2 Passar `onConjugueVinculado={recarregarPessoa}` ao `DialogPessoaCasada`; verificar manualmente que, após vincular cônjuge, o card "Conjugue" exibe o nome sem F5 e o botão de vincular desaparece.
- [x] 3.3 Passar `onComunidadeVinculada={recarregarPessoa}` ao `PessoaComunidade`; verificar manualmente que, após associar comunidade, o card "Comunidade" exibe os dados e o alerta "Sem comunidade" desaparece sem F5.

## 4. Verificação final

- [x] 4.1 Executar `npm run lint` e `npm run build` e verificar que ambos concluem sem erros.
- [x] 4.2 Executar `openspec validate atualizar-pagina-pessoa-vinculos --strict` e verificar que a validação passa.

## Workflow follow-up

- Arquivar a mudança após revisão e testes manuais dos dois fluxos.
