import '@fontsource/vt323'
import { useEffect, useState } from 'react'
import { personalInfo } from '../config'

const PREFIX = 'T:'
const FULL_TEXT = personalInfo.name
const TYPE_SPEED_MS = 90
const DELETE_SPEED_MS = 45

export default function MenuBadge() {
  const [hovered, setHovered] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    const target = hovered ? FULL_TEXT : ''
    if (text === target) return

    const timeoutId = setTimeout(
      () => {
        setText(target.length > text.length ? target.slice(0, text.length + 1) : text.slice(0, -1))
      },
      hovered ? TYPE_SPEED_MS : DELETE_SPEED_MS
    )
    return () => clearTimeout(timeoutId)
  }, [hovered, text])

  return (
    <div
      className="absolute left-4 top-4 rounded-xl bg-[#18181b] px-4 py-3 font-terminal text-xl leading-none text-gray-200 shadow-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <span>{PREFIX}</span>
      <span className="animate-pulse">\</span>
      <span>{text}</span>
    </div>
  )
}
