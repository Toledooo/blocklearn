# Regras de Desenvolvimento: Motor Lógico (Core)

## 1. Escopo e Responsabilidade
Este contexto aplica-se exclusivamente aos arquivos localizados no diretório `src/core/`. Aqui reside o motor da aplicação educacional: as estruturas de dados fundamentais, os algoritmos de criptografia e a mecânica de validação da Blockchain.

## 2. Restrições Arquiteturais
* **Isolamento de Interface:** É estritamente proibido importar bibliotecas de renderização ou animação (React, hooks, Framer Motion) nestes arquivos.
* **Linguagem:** JavaScript (ES6+).
* **Independência Ambiental:** As classes e módulos devem ser projetados para rodar independentemente, podendo ser executados e testados em um ambiente Node.js puro, sem depender do navegador ou de eventos da DOM.

## 3. Padrões de Código e Imutabilidade
* **Funções Puras:** Sempre que aplicável, construa funções puras que recebem os dados necessários via parâmetros e retornam um novo valor sem alterar o estado externo.
* **Imutabilidade de Estruturas:** O conceito de imutabilidade da Blockchain deve refletir no código. Ao validar e adicionar um novo bloco, não altere o *array* original da cadeia diretamente (evite métodos como `.push()`). Em vez disso, retorne uma nova instância do *array* atualizado. Essa prática é fundamental para garantir a reatividade sem falhas na camada visual do React.

## 4. Implementações Criptográficas e de Consenso
* **Algoritmo de Hash:** A geração de assinaturas deve utilizar obrigatoriamente o SHA-256. Como a simulação ocorre no lado do cliente (SPA), utilize a Web Crypto API nativa do navegador (`crypto.subtle.digest`) ou uma biblioteca cliente de baixo peso, como o `crypto-js`.
* **Proof-of-Work (PoW):** O mecanismo de consenso deve ser simulado por um laço de repetição responsável por incrementar o *Nonce* até que o *hash* resultante satisfaça a dificuldade estipulada pela rede. Este laço deve ser encapsulado no método de mineração da classe do Bloco.

## 5. Requisitos Didáticos e Documentação
Sendo o núcleo de um projeto acadêmico de cunho educacional, a clareza do código é tão importante quanto o seu funcionamento.
* **Comentários de Contexto:** Cada método principal e atributo de classe (ex: `previousHash`, `timestamp`, `nonce`) deve ser documentado.
* **Explicação do Porquê:** Os comentários devem explicar não apenas a mecânica computacional da função, mas o **motivo** de sua existência no ecossistema de uma rede descentralizada, auxiliando qualquer desenvolvedor ou professor que for consultar o repositório aberto.