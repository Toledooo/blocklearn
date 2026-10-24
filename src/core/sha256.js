// O SHA-256 é a "máquina de selos" da blockchain: transforma qualquer texto em um código fixo de
// 64 caracteres hexadecimais. Os mesmos dados sempre geram o mesmo código, mas trocar até uma
// vírgula gera um código totalmente diferente, e é isso que permite à rede perceber adulterações.
// Usa a Web Crypto API nativa (navegador e Node 20+), sem dependências.
export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
