import { useEffect, useState } from 'react'
import type { AppState } from './types'

// Démo : tout reste dans le navigateur. La version de production remplacera
// ce fichier par des appels à une API hébergée chez un hébergeur de données de santé.
const KEY = 'preconsultation-demo-v1'

const empty: AppState = { questionnaire: null, sessions: [], exitCode: '1234' }

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...empty, ...JSON.parse(raw) }
  } catch {
    /* stockage indisponible : on repart de zéro */
  }
  return empty
}

export function useAppState() {
  const [state, setState] = useState<AppState>(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])
  return [state, setState] as const
}

export function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash.replace(/^#\/?/, '')
}
