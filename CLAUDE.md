# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

BlockLearn: SPA educacional (React 19 + Vite 8, JavaScript, sem TypeScript) que ensina Blockchain a iniciantes por meio de uma "Simulação Guiada". Todo texto de UI, comentários e documentação são em **pt-BR**.

## Comandos

- `npm run dev` — servidor de desenvolvimento Vite
- `npm run build` — build de produção
- `npm run preview` — serve o build
- `npm run lint` — Oxlint (config em `.oxlintrc.json`; não é ESLint)
- `npm run test:ui` — teste no Chrome real (`scripts/check-ui.mjs`, usa `puppeteer-core`; `CHROME_PATH` se o Chrome estiver em outro caminho): título, rolagem, trilha de etapas e posição dos campos

Não há framework de testes; `src/core/` é verificado com `node` e a UI com `npm run test:ui`. O código de `src/core/` deve ser executável em Node puro (ver regras abaixo), então pode ser verificado com `node` diretamente.

## Arquitetura

Estilização: **somente Tailwind CSS v4** (plugin `@tailwindcss/vite`); CSS Modules é proibido. Animações de UI: Framer Motion. D3 é usado apenas para o diagrama da corrente de blocos.

Separação de camadas (detalhes nas regras importadas abaixo):

- `src/core/` — motor da blockchain (SHA-256, Block, Proof-of-Work). Funções/classes puras, **sem** React/Framer/D3, sem DOM; nunca mutar o array da cadeia (retornar novo array, sem `.push()`).
- `src/components/` e `src/views/` — UI e orquestração do estado da simulação; proibido calcular hashes ou minerar aqui, apenas chamar `core/`.
- D3 integra-se ao React somente via `ref` + `useEffect` (React guarda o estado, D3 apenas desenha o SVG, com cleanup no unmount).
- Fluxo linear do tour: transação → bloco candidato → dificuldade (nonce) → mineração visual → validação/acoplamento à corrente.
- Textos didáticos e títulos usam o efeito typewriter (`src/components/Typewriter.jsx`) e explicam o "porquê", não só o "o quê".

## Estado atual

Existem `src/App.jsx` (dono do progresso do tour (`step`, `reached`, a transação) e da trilha de etapas, única e sempre visível fora da tela inicial; alterna `HomeScreen` -> `views/TransactionView` (etapa 1, com 3 subtelas: introdução, explicação e transação enviada; botão "Continuar") -> `views/HashView` (etapa 2, Geração de Hash, 2 subtelas) -> `views/MiningView` (etapa 3, Proof of Work, 3 subtelas: escolha da dificuldade 1 a 3, roleta de caracteres e nonce subindo; guarda o resultado no `App`) -> `views/ImmutabilityView` (etapa 4, Imutabilidade: o aluno altera dados de um bloco da corrente de exemplo e vê o bloco e os seguintes ficarem vermelhos e as ligações quebrarem, 2 subtelas; a corrente guarda-se no `App`); a trilha mostra bolinhas clicáveis de subtela sob a etapa atual: cada view informa `onSub({count, index, max})` e atende `jump`), `src/views/TransactionView.jsx` (Etapa 1 do tour, com trilha clicável só para etapas já concluídas), `src/core/` (`Transaction.js`, `sha256.js`, `Block.js` com `hashBlock` e `mineBlock`, `Chain.js` com `buildChain`, `editBlock` e `validateChain`; testes `*.test.js` rodam com `node`) e os componentes `HomeScreen`, `Typewriter`, `FadeIn`, `StepIndicator`, `TextField`, `BlockRow`, `ChainBlock`, `ChainLink`, `HashField`, `SpinHash` (roleta do hash) e `BottomBar` em `src/components/`. Os diretórios `utils/` ainda não foram criados.

## Agent skills

### Issue tracker

Issues no GitHub Issues do repo (`Toledooo/blockchain`), via CLI `gh`. Ver `docs/agents/issue-tracker.md`.

### Triage labels

Vocabulário padrão: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. Ver `docs/agents/triage-labels.md`.

### Domain docs

Single-context: um `CONTEXT.md` + `docs/adr/` na raiz. Ver `docs/agents/domain.md`.

## Regras detalhadas

@rules/architecture.md
@rules/core.md
@rules/d3.md
@rules/ui.md
