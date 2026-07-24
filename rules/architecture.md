# Instruções de Arquitetura e Regras de Desenvolvimento (Projeto: Protótipo Blockchain Educacional)

## 1. Contexto do Projeto
Você está atuando como Engenheiro Front-end e Desenvolvedor React para construir um protótipo de Aplicação de Página Única (SPA). O objetivo do sistema é atuar como uma ferramenta educacional interativa de "Simulação Guiada" para ensinar os conceitos da tecnologia Blockchain (Hashes, Mineração/Proof-of-Work, Encadeamento e Imutabilidade) a estudantes iniciantes. O foco principal é a clareza didática, a visualização de dados e a interatividade responsiva.

## 2. Stack Tecnológico Obrigatório
* **Framework Principal:** React inicializado via Vite.
* **Linguagem:** JavaScript (ES6+).
* **Animações e Transições:** Framer Motion (para interface, balões explicativos e transições de estado).
* **Visualização de Dados:** D3.js (estritamente para a renderização do diagrama da rede e ligações criptográficas da corrente de blocos).
* **Estilização:** CSS Modules ou Tailwind CSS (manter consistência na escolha aplicada no repositório).

## 3. Arquitetura de Diretórios e Responsabilidades
O projeto adota uma separação rigorosa de responsabilidades. A lógica matemática/criptográfica não deve se misturar com a renderização de componentes visuais. Siga a estrutura abaixo para o diretório `src/`:

| Diretório | Responsabilidade Principal | Regras de Implementação |
| :--- | :--- | :--- |
| `core/` | Motor Lógico da Blockchain. | Conter classes e funções puras (ex: `Block.js`, `sha256.js`). Nenhuma dependência do React deve ser importada aqui. |
| `components/` | Elementos de Interface reutilizáveis. | Conter botões, formulários de transação, modais e balões explicativos. Usar Framer Motion para entrada/saída. |
| `views/` | Páginas e orquestração da simulação. | Gerenciar o estado global da simulação (Hooks) e conectar o `core/` aos `components/`. |
| `assets/` | Arquivos estáticos. | Imagens, ícones e fontes. |
| `utils/` | Funções de auxílio geral. | Formatadores de data, validadores de strings, etc. |

## 4. Diretrizes e Padrões de Código
* **Separação de Preocupações:** O cálculo do hash (SHA-256) e o laço de repetição do Proof-of-Work devem ocorrer exclusivamente nos arquivos do diretório `core/`. O React apenas instanciará essas classes e reagirá às mudanças de estado.
* **Componentização:** Mantenha os componentes pequenos e focados em uma única responsabilidade.
* **Framer Motion:** Utilize a tag `<motion.div>` para animar a entrada de novos blocos ou a alocação de transações, focando em uma física fluida que transmita a sensação de "encaixe".
* **Imutabilidade de Estado:** Trate os estados do React como estritamente imutáveis. Ao adicionar um novo bloco, retorne um novo array de blocos em vez de alterar o array existente.
* **Comentários Didáticos:** Como se trata de um projeto educacional open-source, todo código complexo (especialmente no motor criptográfico) deve conter comentários breves explicando o *porquê* daquela função existir no contexto de uma Blockchain.

## 5. Fluxo de Execução da Simulação (Guided Tour)
Qualquer nova implementação de interface deve suportar o fluxo linear:
1. Inserção de dados de transação pelo usuário.
2. Formação do Bloco Candidato.
3. Configuração da Dificuldade (Nonce).
4. Execução Visual da Mineração (feedback de carregamento/tentativas).
5. Validação e Acoplamento à Corrente (com visualização via D3.js).