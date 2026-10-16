// Verificação rápida: node src/core/Transaction.test.js
import assert from 'node:assert/strict'
import { createTransaction, isValidTransaction } from './Transaction.js'

const tx = createTransaction({ from: ' Alice ', amount: '50', to: 'Bob' }, 1)
assert.deepEqual(tx, { from: 'Alice', to: 'Bob', amount: 50, timestamp: 1 })
assert.ok(Object.isFrozen(tx))
assert.equal(isValidTransaction({ from: 'Alice', amount: '', to: 'Bob' }), false)
assert.equal(isValidTransaction({ from: 'Alice', amount: '-3', to: 'Bob' }), false)
assert.equal(isValidTransaction({ from: '  ', amount: '5', to: 'Bob' }), false)
assert.throws(() => createTransaction({ from: 'A', amount: '0', to: 'B' }))
console.log('Transaction ok')
