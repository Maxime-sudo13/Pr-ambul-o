import { useState } from 'react'

interface Props {
  label: string
  question: string
  className?: string
  onConfirm: () => void
}

/** Confirmation dans la page : les fenêtres confirm() du navigateur sont bloquées sur certaines tablettes. */
export default function ConfirmButton({ label, question, className, onConfirm }: Props) {
  const [armed, setArmed] = useState(false)
  if (!armed) {
    return (
      <button className={className} onClick={() => setArmed(true)}>
        {label}
      </button>
    )
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm">
      <span className="font-medium text-red-800">{question}</span>
      <button
        className="rounded-md bg-red-700 px-3 py-1 font-semibold text-white hover:bg-red-800"
        onClick={() => {
          setArmed(false)
          onConfirm()
        }}
      >
        Oui
      </button>
      <button className="rounded-md border border-slate-300 bg-white px-3 py-1 font-medium" onClick={() => setArmed(false)}>
        Non
      </button>
    </span>
  )
}
