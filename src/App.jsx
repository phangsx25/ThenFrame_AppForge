
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('Connecting to Supabase...')

  useEffect(() => {
    async function testConnection() {
      const { error } = await supabase.auth.getUser()

      if (error && error.message !== 'Auth session missing!') {
        setStatus(`Error: ${error.message}`)
      } else {
        setStatus('Supabase connection successful!')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <h1 className="text-2xl font-bold text-white">{status}</h1>
    </div>
  )
}

export default App
