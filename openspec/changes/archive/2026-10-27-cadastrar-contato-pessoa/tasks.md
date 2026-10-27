# Tasks

## 1. Rota de proxy

- [x] 1.1 Adicionar `contatos: data.contatos || []` ao payload do `GET` em `src/app/api/ambrosio/pessoa/[id]/route.ts`, preservando todos os demais campos, e verificar a rota devolvendo `contatos` (array vazio quando ausente) pela resposta JSON.
- [x] 1.2 Criar `src/app/api/ambrosio/pessoa/[id]/contato/route.ts` com `POST` que valida `tipoTelefone` (um dos valores `CELULAR`, `RESIDENCIAL`, `COMERCIAL`) e `telefone` (presentes) e o `email` (quando presente, e-mail válido), monta o body com os campos da `PessoaContato` (`tipoTelefone`, `telefone`, `email`, `observacao`, `contatoPrincipal`), repassa para `{ambrosio}/pessoas/:id/contato` com `Authorization: Bearer` (token do cookie) e reflete o status/mensagem da API externa; verificar com POST de teste: sucesso → resposta de sucesso; `tipoTelefone` inválido ou `email` inválido → 400 sem chamar a externa; 404 da externa → 404.

## 2. Formulário de cadastro

- [x] 2.1 Criar `src/components/custom/dashboard/pessoa/form-contato.tsx` com react-hook-form + zod (`tipoTelefone` e `telefone` obrigatórios; `tipoTelefone` como Select fixo com `CELULAR`, `RESIDENCIAL` e `COMERCIAL`; `email` validado com `.email()`; `observacao` como textarea; `contatoPrincipal` default `false` como checkbox no padrão do projeto), submeter `POST /api/ambrosio/pessoa/[id]/contato`, exibir toast de sucesso, limpar os campos e notificar a página para atualizar a listagem (callback), ou toast de erro mantendo os dados preenchidos em falha.
- [x] 2.2 Verificar o formulário manualmente no card da página da pessoa: submeter com dados válidos (toast de sucesso, campos limpos e contato novo na listagem) e com `email` inválido (erro de validação no campo, nenhuma requisição enviada).

## 3. Card na página da pessoa

- [x] 3.1 Adicionar o card "Contatos" em `src/app/dashboard/pessoas/[id]/page.tsx`: sem contatos, exibir "Contatos dessa pessoa nao foi informada" mantendo o botão de cadastro; com contatos, listar `pessoa.contatos` (tipo de telefone, telefone, e-mail, observação — omitidos quando vazios — e badge de contato principal). O cadastro abre em um dialog shadcn (componente separado `DialogContato` com o `ContatoForm`), que fecha e notifica a página (`onContatoSalvo`) após salvar.
- [x] 3.2 Verificar na página da pessoa que o card lista os contatos cadastrados e que, ao salvar um novo contato, a listagem do card é atualizada sem recarregar a página (a página re-executa `getPessoa(id)` após o callback do formulário).

## 4. Verificação de integração

- [x] 4.1 Rodar `npm run lint` e `npm run build` e verificar que passam sem erros novos.
