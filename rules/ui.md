# Regras de Desenvolvimento: Interface e Animações (UI)

## 1. Escopo e Responsabilidade
Este contexto aplica-se aos arquivos localizados nos diretórios `src/components/` e `src/views/`. O objetivo aqui é construir a interface visual do protótipo, gerenciar o estado da aplicação e orquestrar o "Guided Tour" (simulação passo a passo) para o usuário.

## 2. Restrições Arquiteturais e Lógicas
* **Separação de Preocupações:** É estritamente proibido implementar lógica criptográfica (como cálculo de hashes ou laços de mineração) nestes componentes. O React deve apenas importar as instâncias de `src/core/`, chamar seus métodos e refletir o resultado no estado visual.
* **Isolamento do D3.js:** Não misture lógica de desenho do D3.js dentro de componentes padrão do React. A visualização de rede/cadeia será tratada em um contexto separado. Foque aqui apenas na interface de usuário tradicional (formulários, botões, modais e balões explicativos).

## 3. Padrões de Componentização
* **Componentes Funcionais e Hooks:** Utilize exclusivamente componentes funcionais e *React Hooks* (`useState`, `useEffect`, `useCallback`, etc.).
* **Granularidade:** Mantenha os componentes pequenos, puros e focados. Um componente de botão de mineração não deve saber como o bloco inteiro funciona, apenas receber a função de clique via *props*.

## 4. Animações e Transições (Framer Motion)
* **Biblioteca Padrão:** Toda animação de layout, entrada (mount) e saída (unmount) de componentes deve ser feita obrigatoriamente com o `Framer Motion` (utilizando `<motion.div>`, `<AnimatePresence>`, etc.).
* **Física e Fluidez:** Priorize transições suaves (ex: `type: "spring"`) para dar uma sensação tátil à interface. Quando uma transação for alocada em um bloco, o movimento deve ser visível para que o aluno entenda o agrupamento dos dados.
* **Timing Didático:** As animações não podem ser instantâneas a ponto de o usuário perder a ação, nem lentas a ponto de entediar. Se um bloco está sendo minerado, forneça um *feedback* visual claro (como um *spinner* ou contador de tentativas falsas) para simular o esforço computacional antes de revelar o hash final.

## 5. Estilização
* **Consistência Visual:** Utilize exclusivamente o Tailwind CSS para estilização, de forma consistente. Não use CSS Modules.
* **Acessibilidade Básica:** Garanta contraste adequado e uso correto de *tags* semânticas. Os balões explicativos do fluxo educacional devem ser o ponto focal da tela quando ativados.

## 6. Conteúdo Didático e Textos Explicativos (Copywriting)
Como o objetivo do sistema é o ensino guiado de iniciantes, a IA deve gerar automaticamente os textos explicativos para cada interação, seguindo estas regras:
* **Tom de Voz:** Didático, encorajador e acessível. Evite jargões excessivos; quando usá-los (ex: Nonce, Hash), explique-os imediatamente de forma analógica.
* **Foco no "Porquê":** Cada balão explicativo que surgir na tela não deve apenas narrar o que está acontecendo (ex: "O hash foi calculado"), mas explicar o seu propósito na rede (ex: "O hash foi calculado para selar digitalmente este bloco. Qualquer alteração futura mudará este selo, alertando a rede").
* **Gatilhos Visuais:** O texto deve sempre referenciar o que está acontecendo visualmente na tela naquele exato momento (ex: "Observe como as transações foram agrupadas...").

## 7. Animação de Texto Digitado (Typewriter)
* Todo texto didático e títulos principais devem aparecer como se fossem digitados (typewriter) com um cursor/blink indicador de campo de texto, reforçando a analogia de "entrada de dados" em uma Blockchain.
* Implementação: usar Framer Motion com transição de texto por caractere + indicador visual de cursor (|) piscante após o texto completo.
* Aplicar em balões explicativos e títulos de seção.

## 8. Design Responsivo
* **Mobile-first:** Escreva os estilos base para telas pequenas e use os breakpoints do Tailwind (`sm:`, `md:`, `lg:`, `xl:`) para ampliar o layout. Toda tela deve funcionar de 360px até desktop largo, sem rolagem horizontal.
* **Medidas fluidas:** Evite larguras e posições fixas em `px` (ex: `right-[161px]`, `top-[701px]` vindos do Figma). Converta-as para layouts com flex/grid, `max-w-*`, `w-full`, espaçamentos e `clamp()`/classes responsivas. Tamanhos de fonte grandes (ex: título de 128px) devem escalar por breakpoint (ex: `text-5xl md:text-8xl lg:text-[128px]`).
* **Altura da tela:** Prefira `min-h-screen`/`min-h-dvh` a `h-screen`, para que o conteúdo não seja cortado em telas baixas ou com teclado virtual aberto.
* **Alvos de toque:** Botões e campos devem ter no mínimo 44x44px em telas de toque.
* **Animações:** Balões explicativos, modais e o diagrama D3 (usar `viewBox` e largura 100% no SVG) devem se adaptar à largura disponível; respeite `prefers-reduced-motion` (`useReducedMotion` do Framer Motion).
* **Fidelidade ao Figma:** O design do Figma é a referência para o desktop; nos demais tamanhos, preserve a hierarquia visual, as cores e a tipografia, adaptando apenas o layout.
