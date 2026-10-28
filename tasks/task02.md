# Task: Arquitetura da Tela de Hashing

## 1. Objetivo da Tela
Esta tela tem o objetivo de mostrar como o hashing funciona.
Se necessário, adicionar mais textos explicativos.
Utilize como base a tela https://www.figma.com/design/nyd8EQ4TGDNha7Z9TgeEI9/Blockchain?node-id=3-71&t=hYb7sCIZ9i8nLKbB-4

## 2. Elementos Visuais e Estrutura (UI)
Segue o frame `/hashing` do Figma (`3:71`) e reaproveita os componentes existentes (`StepIndicator`, `TextField`, `FadeIn`, `Typewriter`). É a etapa 3 da trilha (o frame do Figma destaca a etapa 2 porque foi desenhado antes da divisão em duas etapas da tela anterior; no app a trilha mostra a etapa 3).

* **Título:** "Geração de Hash", com o subtítulo "ou Mineração" logo abaixo, em verde neon, e a trilha de etapas na altura do título (mesmo layout da tela de Transação e Blocos).
* **Texto explicativo (coluna da esquerda):** o parágrafo do Figma, que explica o hash como "impressão digital" do bloco e quais dados entram nele (índice, transações, hash anterior e nonce), mais o SHA-256 como fórmula que gera um código de tamanho fixo. Pode ganhar um trecho extra, se necessário, para citar o que o aluno vê na tela.
* **Campos (coluna da direita), sob o texto "Teste alterar os dados:":**
  * **Nome do remetente**, **Valor** e **Nome do recebedor**, com o mesmo visual do Figma.
  * Já vêm **preenchidos com os dados digitados na tela anterior** (a transação enviada, guardada no `App`), não com placeholders vazios.
* **Campo Hash:** caixa com o rótulo "Hash" na borda, abaixo do texto e dos campos, mostrando o hash SHA-256 (64 caracteres hexadecimais) dos dados atuais do bloco. É somente leitura: o aluno não digita nele. O texto quebra de linha quando faltar espaço.
* **Botão "Alterar":** não existe de início. Aparece (fade-in com desfoque) quando o aluno começa a digitar e os dados passam a ser diferentes dos que estão no hash exibido; some de novo se os campos voltarem ao valor do hash exibido.
* **Botão "Próximo →"** (canto inferior direito, como no Figma): leva à etapa 4 (mineração). Não aparece de início: só surge depois que o aluno concluiu a interação (clicou em "Alterar" ao menos uma vez) **e** o segundo texto terminou de ser digitado (ver seção 3).
* Responsivo (regra 8): mobile-first, sem posições fixas em `px`, `min-h-dvh`, alvos de toque de 44px, `prefers-reduced-motion`.

## 3. Comportamentos e Animações (UX)
* **Entrada (Framer Motion):** título e texto explicativo são digitados (typewriter) e, ao fim, os campos, o hash e a trilha surgem com fade-in e desfoque, como nas outras telas.
* **Hash inicial:** ao abrir a tela, o hash dos dados da transação já aparece calculado, para o aluno ter um ponto de comparação.
* **Alterar os dados:** ao digitar em qualquer campo, o hash **ainda não muda**; só aparece o botão "Alterar". Isso separa a causa (mudar o dado) do efeito (o hash mudar).
* **Clique em "Alterar":** o hash é recalculado com os dados dos campos. A troca é visível (os caracteres do hash se renovam com uma animação curta) e o botão some. Nada é alterado na transação real enviada na etapa 2: a mudança vale só como teste nesta tela.
* **Texto de explicação trocado:** após o clique, a explicação atual é apagada (com o cursor piscando acompanhando) e dá lugar a uma nova, que conta o que aconteceu com o hash e por quê, citando o que está na tela. Exemplos de ideia (redigir no tom didático da regra 6):
  * Dados diferentes: "Você mudou só um detalhe e o hash ficou completamente diferente! É assim que a rede percebe qualquer adulteração: um selo novo não bate com o antigo."
  * Dados voltaram ao original: "Os dados voltaram ao que eram e o hash é exatamente o mesmo de antes: os mesmos dados sempre geram o mesmo hash."
* Cada novo clique em "Alterar" repete a troca de texto, conforme o resultado (diferente do original ou igual).
* **Aparição do "Próximo":** com o primeiro clique em "Alterar", o botão "Próximo" continua oculto durante o apagamento do texto antigo e a digitação do novo. Só ao fim da escrita ele surge, com fade-in e desfoque (mesmo padrão do botão "Continuar" da tela anterior, que espera `explained`). Depois de aparecer, permanece visível mesmo que o aluno altere os campos de novo; durante uma nova troca de texto ele pode ficar oculto até o fim da escrita.
* **Navegação:** a trilha permite voltar às etapas 1 e 2 (os dados digitados voltam preenchidos). Se o aluno mudar a transação lá, a etapa 3 passa a ser recalculada com os dados novos.

## 4. Integração com o Motor Lógico (Core)
* O cálculo do SHA-256 fica em `src/core/` (ex.: `sha256.js` com `sha256Hex(texto)` usando `crypto.subtle.digest`, assíncrona, executável em Node puro), com comentário didático do porquê e um teste com vetor conhecido (`"abc"` → `ba7816bf...`), rodado com `node`. A view e os componentes só chamam essa função, sem calcular hash.
* A entrada do hash é montada em `core/` a partir de: índice do bloco, dados da transação (remetente, valor, destinatário), hash do bloco anterior (valor fixo da simulação, ex.: 64 zeros) e nonce (0 nesta etapa; a mineração vem a seguir).
* O estado do React guarda: valores dos campos (iniciados com a transação do `App`), hash exibido e o texto de explicação atual. O hash antigo não pode "pular" para um resultado de digitação anterior: descartar respostas assíncronas antigas.
* Ao clicar em "Próximo", chama `onContinue` do `App`, que avança para a etapa 4 (`reached` passa a 4).
* Atualizar o `test:ui` (`scripts/check-ui.mjs`) com o fluxo: etapa 3 com campos preenchidos, digitar faz o botão "Alterar" aparecer, clicar muda o hash e o texto, "Próximo" só aparece depois do segundo texto terminar, voltar ao valor original e clicar mostra o mesmo hash, sem rolagem nos quatro tamanhos de tela.
