// Uma transação é o registro mais simples de uma blockchain: quem enviou, quanto e para quem.
// Ela só vira "oficial" depois de agrupada em um bloco e selada pela mineração.

// Valida os campos antes de criar a transação: a rede rejeita registros incompletos
// para que nenhum bloco seja formado com dados sem sentido.
export function isValidTransaction({ from, amount, to }) {
  const value = Number(amount)
  return (
    String(from ?? '').trim() !== '' &&
    String(to ?? '').trim() !== '' &&
    Number.isFinite(value) &&
    value > 0
  )
}

// Cria a transação já "congelada" (Object.freeze): depois de registrada ela não deve mudar,
// a mesma ideia de imutabilidade que protege a corrente inteira.
export function createTransaction(fields, timestamp = Date.now()) {
  if (!isValidTransaction(fields)) throw new Error('Transação inválida: preencha remetente, valor positivo e destinatário.')
  return Object.freeze({
    from: String(fields.from).trim(),
    to: String(fields.to).trim(),
    amount: Number(fields.amount),
    timestamp, // momento do registro, útil para ordenar os blocos cronologicamente
  })
}
