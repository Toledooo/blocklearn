# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

BlockLearn: SPA educacional (React 19 + Vite 8, JavaScript, sem TypeScript) que ensina Blockchain a iniciantes por meio de uma "Simulação Guiada". Todo texto de UI, comentários e documentação são em **pt-BR**.

## Comandos

- `npm run dev` — servidor de desenvolvimento Vite
- `npm run build` — build de produção
- `npm run preview` — serve o build
- `npm run lint` — Oxlint (config em `.oxlintrc.json`; não é ESLint)

Não há framework de testes configurado. O código de `src/core/` deve ser executável em Node puro (ver regras abaixo), então pode ser verificado com `node` diretamente.

## Arquitetura

Estilização: **somente Tailwind CSS v4** (plugin `@tailwindcss/vite`); CSS Modules é proibido. Animações de UI: Framer Motion. D3 é usado apenas para o diagrama da corrente de blocos.

Separação de camadas (detalhes nas regras importadas abaixo):

- `src/core/` — motor da blockchain (SHA-256, Block, Proof-of-Work). Funções/classes puras, **sem** React/Framer/D3, sem DOM; nunca mutar o array da cadeia (retornar novo array, sem `.push()`).
- `src/components/` e `src/views/` — UI e orquestração do estado da simulação; proibido calcular hashes ou minerar aqui, apenas chamar `core/`.
- D3 integra-se ao React somente via `ref` + `useEffect` (React guarda o estado, D3 apenas desenha o SVG, com cleanup no unmount).
- Fluxo linear do tour: transação → bloco candidato → dificuldade (nonce) → mineração visual → validação/acoplamento à corrente.
- Textos didáticos e títulos usam o efeito typewriter (`src/components/Typewriter.jsx`) e explicam o "porquê", não só o "o quê".

## Estado atual

Existem apenas `src/App.jsx` (renderiza `HomeScreen`), `src/components/HomeScreen.jsx` e `Typewriter.jsx`. Os diretórios `core/`, `views/` e `utils/` ainda não foram criados. As especificações das telas ficam em `tasks/` (`initialTask.md`: tela inicial fiel ao Figma; `task01.md`: tela de boas-vindas com formulário de transação).

## Regras detalhadas

@rules/architecture.md
@rules/core.md
@rules/d3.md
@rules/ui.md
