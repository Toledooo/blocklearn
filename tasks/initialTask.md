# Initial Task: Criação do Projeto + Tela Inicial (Design Figma)

## 1. Objetivo
Criar a base do projeto educativo Blockchain (simulador) e implementar a tela inicial conforme o design Figma (`node-id=3-284`): https://www.figma.com/design/nyd8EQ4TGDNha7Z9TgeEI9/Blockchain?node-id=3-284&t=HYzDGaHybABkLA53-4

## 2. Elementos do Design (Referência Visual)
- **Fundo:** preto (`#000000`).
- **Título:** "BlockLearn" — fonte `Rowdies:Bold`, cor `#b6ff2e` (verde neon), tamanho grande (`128px`).
- **Subtítulo:** "Um ambiente de simulação e explicação dos principais pilares de uma Blockchain." — fonte `Roboto Mono:Bold`, cor branca, tamanho menor (`24px`).
- **Botão Primário:** "Começar" com seta (`→`) — fundo `#b6ff2e`, texto preto (`Roboto Mono:Bold`, `32px`), borda arredondada (`10px`), posicionado no canto inferior direito (`right: 161px`, `top: 701px`).
- **Ícone:** seta SVG (`imgArrow1`) ao lado do texto no botão.

## 3. Estrutura do Projeto (Stack)
- React + Vite (`npm create vite`).
- Tailwind CSS (conforme design retornado pelo `get_design_context`).
- Framer Motion para animações de entrada (`fade-in` e deslizamento suave).
- Comentários didáticos em `pt-BR` (regras `AGENTS.md` / `CLAUDE.md`).
- Imutabilidade: estado React não deve usar `.push()` diretamente no array de blocos.

## 4. Tarefas do Desenvolvimento
1. Inicializar o projeto Vite com React (`npm create vite@latest`).
2. Instalar dependências: `tailwindcss`, `framer-motion`, `d3` (para visualizações futuras, embora esta tela inicial não use D3 ainda).
3. Criar `src/components/HomeScreen.jsx` replicando a estrutura do design Figma (`node-id=3-284`):
   - Container preto (`bg-black`, `size-full` / `h-screen`, `relative`).
   - `h1` com texto "BlockLearn" (`text-[#b6ff2e]`, `font-bold`).
   - `p` com subtítulo (`text-white`, `font-['Roboto_Mono:Bold']`).
   - Botão `<a>` ou `<button>` com classe `bg-[#b6ff2e]`, `rounded-[10px]`, `text-black`, contendo o texto "Começar" e o SVG da seta (`imgArrow1`).
4. Adicionar comentários `pt-BR` explicando por que a tela é a porta de entrada do simulador.
5. Verificar se o asset SVG (`imgArrow1`) está salvo localmente (`src/assets/`) para evitar URLs temporárias.

## 5. Critérios de Aceitação
- A tela deve ser visualmente idêntica ao design Figma (fundo preto, título verde neon, botão verde com seta no canto inferior direito).
- O botão deve ser funcional (mesmo que apenas como âncora para a próxima etapa no futuro).
- Nenhuma lógica de blockchain (`core/`) deve estar nesta tela inicial — apenas UI.
- Comentários didáticos presentes no componente.
