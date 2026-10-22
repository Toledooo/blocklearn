# Task: Arquitetura da Tela de Transação e Blocos

## 1. Objetivo da Tela
Esta é o início da simulação na plataforma educacional. Ela deve cumprir dois papéis fundamentais: 
1. Apresentar o propósito do simulador de forma clara e convidativa.
2. Coletar os dados iniciais que darão o gatilho para o "Guided Tour" da Blockchain.
3. Se necessário, adicionar mais textos explicativos.
Utilize como base as telas https://www.figma.com/design/nyd8EQ4TGDNha7Z9TgeEI9/Blockchain?node-id=3-174&t=C1XIR2Zw02nRje2m-4 e https://www.figma.com/design/nyd8EQ4TGDNha7Z9TgeEI9/Blockchain?node-id=9-299&t=C1XIR2Zw02nRje2m-4

## 2. Elementos Visuais e Estrutura (UI)
A interface deve ser dividida em duas áreas ou *cards* centrais para manter o foco do usuário:

* **Área de Introdução (Hero Section):**
  * Título principal: "Entenda a Blockchain na Prática". Obs: O título deve mudar posteriormente para "Transação e Blocos" para explicar essas partes.
  * Subtítulo didático explicando brevemente que o usuário irá simular a criação, mineração e validação de um bloco de transações.
* **Formulário de Interação (Gatilho da Simulação):**
  * Campo de Entrada 1: **Nome do Remetente** (ex: "De: Alice").
  * Campo de Entrada 2: **Valor da Transação** (ex: "Quantia: 50 moedas").
  * Campo de Entrada 3: **Nome do Destinatário** (ex: "Para: Bob").
  * Botão de Ação Primária: **"Enviar e Iniciar Simulação"**.

## 3. Comportamentos e Animações (UX)
* **Entrada (Framer Motion):** Os elementos da tela devem surgir de forma suave (*fade-in* de invisível, desenbaçando para totalmente visível) logo após os textos serem digitados na tela.
* **Validação de Inputs:** O botão "Enviar" deve aparecer após os campos serem preenchidos ou exibir um alerta visual amigável até que os três campos obrigatórios sejam preenchidos. Quando o último campo for ser preenchido, o texto de explicação deve ser apagado (com o cursor piscando acompanhando) e dar lugar a uma nova explicação. Ao fim da escrita, o botão de enviar deve aparecer suavemente (*fade-in* de invisível, desenbaçando para totalmente visível).
* **Transição de Saída:** Ao clicar em "Enviar", o formulário não deve simplesmente sumir. Ele deve se retrair suavemente, dando espaço para a animação da transação sendo enviada para o "Bloco Candidato" (próxima etapa do fluxo).

## 4. Integração com o Motor Lógico (Core)
* O estado do React deve capturar os três valores dos campos de input.
* Ao clicar no botão, disparar a função que cria o objeto de transação e o repassa para o componente do "Bloco", alterando o estado global da simulação para a Etapa 2.