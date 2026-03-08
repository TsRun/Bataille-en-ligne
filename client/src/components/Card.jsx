export default function Card({ card, faceDown = false, small = false, highlight = false }) {
  const w = small ? 'w-14 h-20' : 'w-20 h-28'
  const border = highlight ? 'border-yellow-400 border-4' : 'border-2 border-gray-200'
  const base = `${w} rounded-xl shadow-md select-none flex-shrink-0 relative`

  if (faceDown) {
    return (
      <div className={`${base} bg-blue-900 border-2 border-blue-500 flex items-center justify-center`}>
        <div className="absolute inset-1.5 rounded-lg border border-blue-400 opacity-50" />
        <div className="absolute inset-3 rounded border border-blue-300 opacity-25" />
      </div>
    )
  }

  if (!card) return null

  const isRed = card.suit === '♥' || card.suit === '♦'
  const textColor = isRed ? 'text-red-600' : 'text-slate-900'
  const labelSize = small ? 'text-xs' : 'text-sm'
  const suitSize = small ? 'text-xl' : 'text-3xl'

  return (
    <div className={`${base} bg-white ${border} flex flex-col`}>
      <div className={`${textColor} font-bold leading-none p-1.5`}>
        <div className={labelSize}>{card.value}</div>
        <div className={labelSize}>{card.suit}</div>
      </div>
      <div className={`${textColor} ${suitSize} flex-1 flex items-center justify-center font-semibold`}>
        {card.suit}
      </div>
      <div className={`${textColor} font-bold leading-none p-1.5 self-end rotate-180`}>
        <div className={labelSize}>{card.value}</div>
        <div className={labelSize}>{card.suit}</div>
      </div>
    </div>
  )
}
