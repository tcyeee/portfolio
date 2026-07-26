import { useEffect, useState } from 'react'
import { personalInfo } from '../config'

const GREETINGS = ['Say Hi', '你好', 'こんにちは', '안녕하세요']
const TYPE_SPEED_MS = 90
const DELETE_SPEED_MS = 45
const HOLD_MS = 1200
const PAUSE_MS = 300
const EMAIL_CHARS = personalInfo.email.split('')

export default function EmailBadge() {
  const [text, setText] = useState('')

  useEffect(() => {
    let charIndex = 0
    let deleting = false
    let greetingIndex = 0
    let timeoutId: ReturnType<typeof setTimeout>

    function tick() {
      const current = GREETINGS[greetingIndex]
      if (!deleting) {
        charIndex++
        setText(current.slice(0, charIndex))
        timeoutId = setTimeout(tick, charIndex === current.length ? HOLD_MS : TYPE_SPEED_MS)
        if (charIndex === current.length) deleting = true
      } else {
        charIndex--
        setText(current.slice(0, charIndex))
        timeoutId = setTimeout(tick, charIndex === 0 ? PAUSE_MS : DELETE_SPEED_MS)
        if (charIndex === 0) {
          deleting = false
          greetingIndex = (greetingIndex + 1) % GREETINGS.length
        }
      }
    }

    timeoutId = setTimeout(tick, TYPE_SPEED_MS)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div className="absolute bottom-4 right-4 flex items-center overflow-hidden rounded-md font-mono text-sm">
      <span className="bg-primary-500 px-3 py-1.5 text-white">
        {text}
        <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-white align-middle" />
      </span>
      <a
        href={`mailto:${personalInfo.email}`}
        className="group flex bg-primary-100 px-3 py-1.5 text-primary-800 hover:bg-primary-200">
        {EMAIL_CHARS.map((char, i) => (
          <span key={i} className="relative inline-block h-5 overflow-hidden">
            <span
              className="flex flex-col leading-5 transition-transform duration-300 ease-out group-hover:-translate-y-1/2"
              style={{ transitionDelay: `${i * 25}ms` }}
            >
              <span>{char}</span>
              <span>{char}</span>
            </span>
          </span>
        ))}
      </a>
    </div>
  )
}
