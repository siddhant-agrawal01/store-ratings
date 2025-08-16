import React from 'react'

export default function RatingStars({ value = 0, onChange, size = 'text-xl', isLoading = false }) {
  const stars = [1,2,3,4,5]
  return (
    <div className={`flex gap-1 ${size}`}>
      {stars.map(s => (
        <button
          key={s}
          type="button"
          disabled={isLoading}
          onClick={() => onChange?.(s)}
          className={s <= value ? 'text-yellow-500' : 'text-gray-300'}
          aria-label={`Rate ${s}`}
        >★</button>
      ))}
      {isLoading && <div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4"></div>}
    </div>
  )
}
