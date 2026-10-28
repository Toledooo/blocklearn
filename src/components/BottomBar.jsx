// Faixa inferior das telas do tour. No desktop usa as mesmas colunas do grid das telas: `left` fica
// centralizado na página (como o campo Hash no Figma) e `right` (o botão de avanço) vai para a coluna
// da direita, com a borda alinhada à dos campos e centralizado na vertical com `left`. `floating` solta
// a faixa do fluxo (canto inferior direito) para a tela da transação, onde o botão fica na mesma
// posição que na tela de hash.
export default function BottomBar({ left, right, floating = false }) {
  return (
    <div
      className={`flex flex-col gap-4 lg:grid lg:min-h-24 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-x-12 ${
        floating ? 'lg:absolute lg:inset-x-12 lg:bottom-[clamp(1.5rem,5vh,3rem)]' : 'lg:col-span-2 lg:row-start-3'
      }`}
    >
      {/* largura limitada para nunca encostar no botão, que fica à direita */}
      {left && <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:w-[min(48rem,calc(100%-25rem))] lg:justify-self-center">{left}</div>}
      <div className="flex w-full justify-end lg:col-start-2 lg:row-start-1 lg:max-w-[30rem] lg:justify-self-center">{right}</div>
    </div>
  )
}
