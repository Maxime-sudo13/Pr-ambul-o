import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Landing from './Landing'
import { Confidentialite, Mentions } from './Legal'

function Site() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  if (hash.startsWith('#/mentions-legales')) return <Mentions />
  if (hash.startsWith('#/confidentialite')) return <Confidentialite />
  return <Landing />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Site />
  </StrictMode>,
)
