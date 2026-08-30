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
* **Consistência Visual:** Utilize a abordagem de CSS definida no projeto (CSS Modules ou Tailwind) de forma consistente.
* **Acessibilidade Básica:** Garanta contraste adequado e uso correto de *tags* semânticas. Os balões explicativos do fluxo educacional devem ser o ponto focal da tela quando ativados.

## 6. Conteúdo Didático e Textos Explicativos (Copywriting)
Como o objetivo do sistema é o ensino guiado de iniciantes, a IA deve gerar automaticamente os textos explicativos para cada interação, seguindo estas regras:
* **Tom de Voz:** Didático, encorajador e acessível. Evite jargões excessivos; quando usá-los (ex: Nonce, Hash), explique-os imediatamente de forma analógica.
* **Foco no "Porquê":** Cada balão explicativo que surgir na tela não deve apenas narrar o que está acontecendo (ex: "O hash foi calculado"), mas explicar o seu propósito na rede (ex: "O hash foi calculado para selar digitalmente este bloco. Qualquer alteração futura mudará este selo, alertando a rede").
* **Gatilhos Visuais:** O texto deve sempre referenciar o que está acontecendo visualmente na tela naquele exato momento (ex: "Observe como as transações foram agrupadas...").
