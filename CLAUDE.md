# CLAUDE.md — Diretrizes para Claude Code (Catarina)

## Comandos Essenciais
```bash
# Executar servidor de desenvolvimento Next.js
npm run dev

# Executar linter e checagem de tipos
npm run lint
npx tsc --noEmit

# Executar build de produção
npm run build

# Executar testes E2E
npm run test:e2e
```

## Regras Críticas
1. **Next.js App Router**: Consulte `node_modules/next/dist/docs/` para padrões modernos.
2. **Server Components (RSC)**: Evite adicionar `'use client'` indiscriminadamente.
3. **OpenSpec Workflows**: Respeite os comandos em `.opencode/commands/` (`opsx-propose` vs `opsx-apply`).
