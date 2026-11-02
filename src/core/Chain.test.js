// Rode com: node src/core/Chain.test.js
import assert from 'node:assert/strict'
import { GENESIS_HASH, mineBlock } from './Block.js'
import { buildChain, editBlock, validateChain } from './Chain.js'

const difficulty = 1
const data = { index: 1, timestamp: 1730000000000, from: 'Alice', amount: 50, to: 'Bob', previousHash: GENESIS_HASH }
const first = { ...data, ...(await mineBlock(data, difficulty)) }
const chain = await buildChain(first, [{ timestamp: 1730000060000, from: 'Bob', amount: 30, to: 'Carla' }, { timestamp: 1730000120000, from: 'Carla', amount: 15, to: 'Davi' }], difficulty)
const statuses = async (c) => (await validateChain(c, difficulty)).map((r) => r.status)

assert.equal(chain.length, 3)
assert.equal(chain[1].previousHash, chain[0].hash, 'cada bloco guarda o hash do anterior')
assert.equal(chain[2].previousHash, chain[1].hash)
assert.deepEqual(await statuses(chain), ['ok', 'ok', 'ok'], 'corrente intacta')

const copy = JSON.stringify(chain)
const edited = editBlock(chain, 2, { amount: 3000 })
assert.equal(JSON.stringify(chain), copy, 'editBlock não altera a corrente recebida')
assert.deepEqual(await statuses(edited), ['ok', 'altered', 'broken'], 'alterar o do meio quebra os seguintes')
assert.notEqual((await validateChain(edited, difficulty))[1].currentHash, chain[1].hash, 'o hash refeito muda')

assert.deepEqual(await statuses(editBlock(chain, 2, { timestamp: 1 })), ['ok', 'altered', 'broken'], 'mudar o timestamp também quebra a corrente')
assert.deepEqual(await statuses(editBlock(chain, 3, { to: 'Zé' })), ['ok', 'ok', 'altered'], 'alterar o último afeta só ele')
assert.deepEqual(await statuses(editBlock(chain, 1, { from: 'Mallory' })), ['altered', 'broken', 'broken'], 'alterar o primeiro quebra todos os seguintes')
assert.deepEqual(await statuses(editBlock(edited, 2, { amount: 30 })), ['ok', 'ok', 'ok'], 'devolver o dado original religa a corrente')
assert.deepEqual(await statuses(editBlock(editBlock(chain, 1, { to: 'X' }), 3, { to: 'Y' })), ['altered', 'broken', 'altered'], 'dois blocos alterados')

console.log('Chain: ok')
