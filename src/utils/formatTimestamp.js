// O timestamp fica guardado como número bruto (milissegundos desde 1970), que é o que entra no hash.
// Para o aluno ele é mostrado como data e hora legíveis, ex.: "02/11/2026 14:35:07".
export const formatTimestamp = (ms) => new Date(ms).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }).replace(', ', ' ')
