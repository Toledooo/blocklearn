import { GENESIS_HASH, hashBlock, mineBlock } from './Block.js'

// Corrente de blocos: cada bloco guarda o hash do anterior, então todos ficam presos uns aos outros.
// Um bloco da corrente é { index, from, amount, to, previousHash, nonce, hash }.
// A corrente é sempre tratada como imutável: toda função devolve uma lista nova, nunca altera a recebida.

// Monta a corrente a partir do bloco já minerado pelo aluno e das transações dos blocos seguintes.
// Cada novo bloco é minerado com o hash do anterior em `previousHash`, que é a "ligação" da corrente.
export async function buildChain(first, transactions, difficulty, { signal } = {}) {
  let blocks = [first]
  for (const { from, amount, to } of transactions) {
    const previous = blocks[blocks.length - 1]
    const data = { index: previous.index + 1, from, amount, to, previousHash: previous.hash }
    const { nonce, hash } = await mineBlock(data, difficulty, { signal })
    blocks = [...blocks, { ...data, nonce, hash }]
  }
  return blocks
}

// Simula a fraude: muda os dados da transação do bloco `index`, mas deixa o nonce e o hash gravados como
// estavam, que é o que um adulterador deixaria para trás (os hashes antigos continuam escritos no bloco).
export function editBlock(chain, index, patch) {
  return chain.map((block) => (block.index === index ? { ...block, ...patch } : block))
}

// Confere a corrente como a rede faria, bloco a bloco, refazendo cada hash a partir dos dados atuais:
//   altered: o hash refeito não é o gravado (ou perdeu os zeros do Proof of Work), ou seja, os dados mudaram;
//   broken:  o bloco em si está certo, mas não está mais preso a uma corrente válida (o hash do bloco anterior
//            não bate com o que ele guarda, ou algum bloco antes dele já falhou);
//   ok:      tudo confere. `currentHash` é o hash refeito, para a tela mostrar o que mudou.
export async function validateChain(chain, difficulty) {
  const prefix = '0'.repeat(difficulty)
  const results = []
  let healthy = true // todos os blocos até aqui estão ok
  let expectedPrevious = GENESIS_HASH // o que o próximo bloco precisa ter guardado em previousHash
  for (const block of chain) {
    const currentHash = await hashBlock(block)
    let status = 'ok'
    if (currentHash !== block.hash || !currentHash.startsWith(prefix)) status = 'altered'
    else if (!healthy || block.previousHash !== expectedPrevious) status = 'broken'
    results.push({ status, currentHash })
    healthy = healthy && status === 'ok'
    expectedPrevious = currentHash
  }
  return results
}
