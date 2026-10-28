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

// Proof-of-Work: os dados do bloco não podem mudar, então o minerador só mexe no nonce. Ele testa
// 0, 1, 2... até o hash começar com `difficulty` zeros. Não existe atalho: achar o nonce custa
// trabalho, mas conferi-lo é um único hash. É esse custo que torna caro forjar um bloco.
// `signal` (AbortSignal) permite parar a busca quando o aluno sai da tela.
export async function mineBlock(data, difficulty, { signal } = {}) {
  if (!Number.isInteger(difficulty) || difficulty < 0 || difficulty > 64) throw new RangeError('A dificuldade deve ser um inteiro de 0 a 64')
  const prefix = '0'.repeat(difficulty)
  for (let nonce = 0; ; nonce++) {
    signal?.throwIfAborted()
    const hash = await hashBlock({ ...data, nonce })
    if (hash.startsWith(prefix)) return { nonce, hash, attempts: nonce + 1 }
    // devolve o controle ao navegador de tempos em tempos, senão a tela congela durante a busca
    if (nonce % 256 === 255) await new Promise((resolve) => setTimeout(resolve, 0))
  }
}
