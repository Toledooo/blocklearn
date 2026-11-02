// Rode com: node src/core/Block.test.js
import assert from 'node:assert/strict'
import { hashBlock, mineBlock } from './Block.js'

const data = { timestamp: 1730000000000, from: 'Alice', amount: 50, to: 'Bob' }
const copy = { ...data }

for (const difficulty of [1, 2]) {
  const { nonce, hash, attempts } = await mineBlock(data, difficulty)
  assert.ok(hash.startsWith('0'.repeat(difficulty)), 'o hash começa com os zeros exigidos')
  assert.equal(await hashBlock({ ...data, nonce }), hash, 'o nonce devolvido reproduz o mesmo hash')
  assert.equal(attempts, nonce + 1)
}
assert.deepEqual(data, copy, 'mineBlock não altera os dados recebidos')

const aborted = new AbortController()
aborted.abort()
await assert.rejects(mineBlock(data, 64, { signal: aborted.signal }), { name: 'AbortError' })

const later = new AbortController()
setTimeout(() => later.abort(), 20)
await assert.rejects(mineBlock(data, 64, { signal: later.signal }), { name: 'AbortError' }, 'abortar no meio da busca interrompe o laço')

await assert.rejects(mineBlock(data, -1), RangeError)
await assert.rejects(mineBlock(data, 1.5), RangeError)

console.log('Block: ok')
