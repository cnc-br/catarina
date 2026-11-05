<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Manual de Operação de Agentes IA (Catarina)

Este documento orienta todos os agentes de IA (Antigravity/Gemini, GitHub Copilot, OpenSpec/OpenCode, Cursor, Claude Code e Hermes) operando no repositório `catarina`.

---

## 1. Contexto do Repositório
- **Papel**: Frontend Web SPA/SSR responsivo do sistema CNC-Gestão.
- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI / Shadcn, Cypress.
- **Porta Local**: `3000`. **Produção**: Roteado pelo Nginx em `/` e `/api/catarina/`.
- **Governança Canônica**: [gestao-devsecops/specs/003-frontend-catarina/SPEC.md](https://github.com/cnc-br/gestao-devsecops/blob/main/specs/003-frontend-catarina/SPEC.md).

---

## 2. Princípios Mandatórios de Interface & Engenharia

### 2.1 React Server Components (RSC)
- Adote Server Components por padrão em páginas, layouts e componentes de exibição de dados.
- Utilize `'use client'` exclusivamente em folhas da árvore que exijam eventos de mouse/teclado, hooks de ciclo de vida (`useState`, `useEffect`) ou APIs do navegador.

### 2.2 Servidor MCP Shadcn (`.mcp.json`)
- Para descobrir ou injetar novos componentes da biblioteca Shadcn/Radix, utilize as ferramentas fornecidas pelo MCP `shadcn` (`npx shadcn@latest mcp`).

### 2.3 Formulários & Validação
- Todos os formulários devem ser geridos via `react-hook-form` e validados via schemas declarativos `zod`.

### 2.4 Fluxos OpenSpec (`.opencode/commands/`)
- Ao propor uma alteração (`opsx-propose`), gere apenas os artefatos de planejamento (`proposal.md`, `specs/`, `design.md`, `tasks.md`).
- **NÃO** edite código de produção durante o passo de proposta. A implementação ocorre exclusivamente no comando `opsx-apply`.

---

## 3. Agent Skills & Issue Tracker

### Issue Tracker via GitHub CLI (`gh`)
- As issues deste repositório vivem no GitHub. Veja [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).
- Operações de wayfinding com labels `wayfinder:map` e dependências `blocked_by`.

### Triage Labels
Usa os 5 papéis canônicos de triagem: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Veja [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).

### Domain Docs & Glossário Ubíquo
Consulte [`docs/agents/domain.md`](docs/agents/domain.md) e [`CONTEXT.md`](CONTEXT.md). Use estritamente:
- **Usuário**: Credencial de acesso (email, WhatsApp, papel).
- **Pessoa**: Fiel cadastrado na base (schema `saopedro`).
- **Papel**: Nível de autorização (`ADMIN`, `SECRETARIA_CNC`, `NAO_IDENTIFICADO`).
