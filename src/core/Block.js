import { sha256Hex } from './sha256.js'

// O primeiro bloco da corrente não tem antecessor, então o "hash anterior" dele é um valor combinado: só zeros.
export const GENESIS_HASH = '0'.repeat(64)

// O hash de um bloco mistura tudo o que o identifica: posição (índice), dados da transação,
// hash do bloco anterior e nonce. É isso que prende um bloco ao anterior e o torna inviolável:
// mexer em qualquer um desses itens muda o hash e denuncia a alteração.
// JSON.stringify de um array evita ambiguidade (ex.: "a|b" + "c" não vira "a" + "b|c").
export function hashBlock({ index = 1, from, amount, to, previousHash = GENESIS_HASH, nonce = 0 }) {
  return sha256Hex(JSON.stringify([index, String(from).trim(), String(amount).trim(), String(to).trim(), previousHash, nonce]))
}
