// Rode com: node src/core/sha256.test.js
import assert from 'node:assert/strict'
import { hashBlock } from './Block.js'
import { sha256Hex } from './sha256.js'

// Vetor de teste oficial do SHA-256
assert.equal(await sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')

const base = { timestamp: 1730000000000, from: 'Alice', amount: 50, to: 'Bob' }
const original = await hashBlock(base)
assert.match(original, /^[0-9a-f]{64}$/)
assert.equal(await hashBlock({ ...base }), original, 'mesmos dados, mesmo hash')
assert.equal(await hashBlock({ ...base, amount: '50', from: ' Alice ' }), original, 'espaços e tipo do valor não alteram o hash')
assert.notEqual(await hashBlock({ ...base, from: 'Alicf' }), original, 'uma letra diferente muda o hash')
assert.notEqual(await hashBlock({ ...base, nonce: 1 }), original, 'o nonce faz parte do hash')
assert.notEqual(await hashBlock({ ...base, timestamp: 1730000000001 }), original, 'o timestamp faz parte do hash')
assert.throws(() => hashBlock({ from: 'Alice', amount: 50, to: 'Bob' }), TypeError, 'sem timestamp o bloco é recusado')

console.log('sha256: ok')
