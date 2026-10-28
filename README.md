# BlockLearn

Simulação guiada e interativa para aprender **Blockchain** do zero. O aluno não lê sobre a tecnologia: ele cria uma transação, vê o bloco se formar, gera hashes e (nas próximas etapas) minera e valida um bloco, sempre com um texto que explica o **porquê** de cada passo.

## Objetivo

Ensinar a estudantes iniciantes os conceitos centrais da tecnologia:

- **Transações e blocos:** como os dados são agrupados em um bloco.
- **Hashes (SHA-256):** a "impressão digital" que sela um bloco.
- **Mineração e Proof-of-Work:** o esforço computacional que protege a rede.
- **Encadeamento e imutabilidade:** por que alterar um bloco antigo quebra a corrente.

O foco é a clareza didática, a visualização dos dados e a interatividade, em qualquer tamanho de tela (de 360px até desktop largo).

## Como funciona

O aluno percorre uma trilha linear de etapas, indicada por uma linha do tempo no topo. Ele pode voltar a qualquer etapa já concluída para rever ou alterar os dados, e mudar um dado invalida as etapas seguintes, como numa blockchain de verdade.

1. **Transação:** preenche remetente, valor e destinatário.
2. **Bloco candidato:** envia a transação e a vê entrar em um bloco ainda provisório, ligado ao bloco anterior.
3. **Geração de Hash:** altera os dados da transação e vê o hash SHA-256 do bloco ser refeito.
4. **Proof of Work:** escolhe a dificuldade (1 a 3 zeros) e vê o minerador testar nonces, com o hash "girando" posição por posição, até achar um hash válido.
5. **Validação:** *(planejada)* acoplamento do bloco minerado à corrente.

Os textos explicativos aparecem como se fossem digitados (efeito *typewriter*) e sempre referenciam o que está acontecendo na tela.

### Estado atual

| Parte | Situação |
| :--- | :--- |
| Tela inicial | Pronta |
| Transação e Blocos (etapas 1 e 2) | Pronta |
| Geração de Hash (etapa 3) | Pronta |
| Proof of Work (etapa 4) | Pronta |
| Validação (esqueleto) e diagrama da corrente (D3) | A fazer |

## Tecnologias

- React 19 e Vite 8 (JavaScript, sem TypeScript)
- Tailwind CSS v4 (única forma de estilização)
- Framer Motion (animações e transições)
- D3.js (reservado ao diagrama da corrente de blocos)

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

| Comando | O que faz |
| :--- | :--- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Serve o build |
| `npm run lint` | Análise estática (Oxlint) |
| `npm run test:ui` | Teste no Chrome real (usa o Chrome instalado; defina `CHROME_PATH` se ele estiver em outro caminho) |
| `node src/core/Transaction.test.js`, `node src/core/sha256.test.js` e `node src/core/Block.test.js` | Testes do motor lógico, em Node puro |

## Estrutura

```
src/
├── core/        Motor da blockchain: funções puras, sem React, Framer ou D3
├── components/  Elementos de interface reutilizáveis
├── views/       Telas e orquestração da simulação
└── assets/      Imagens e ícones
rules/           Regras de arquitetura, core, D3 e UI do projeto
docs/agents/     Configuração das skills de agentes
```

A lógica criptográfica (hashes, mineração) vive somente em `src/core/`; a interface apenas chama o motor e reflete o resultado. O estado do progresso do tour fica no `App`. Detalhes e convenções em [`CLAUDE.md`](CLAUDE.md) e em [`rules/`](rules).

## Projeto acadêmico

BlockLearn é um projeto educacional de código aberto. Todo texto de interface, comentário e documentação é em português do Brasil.
