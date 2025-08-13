"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const checkEnvironment = () => {
      const info = {
        supabaseClient: !!supabase,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length + ')' : 'Missing',
        timestamp: new Date().toISOString()
      }
      setDebugInfo(info)
    }

    checkEnvironment()
  }, [])

  const testConnection = async () => {
    if (!supabase) {
      alert('Supabase client not available')
      return
    }

    try {
      console.log('Testing Supabase connection...')
      const { data, error, count } = await supabase
        .from('portfolio_submissions')
        .select('*', { count: 'exact' })
        .limit(1)

      if (error) {
        console.error('Supabase error:', error)
        alert(`Supabase error: ${error.message}`)
      } else {
        console.log('Supabase success:', { data, count })
        alert(`Connection successful! Found ${count} total records. First record: ${JSON.stringify(data?.[0] || 'None')}`)
      }
    } catch (err) {
      console.error('Test failed:', err)
      alert(`Test failed: ${err}`)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Environment Check:</h2>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <button 
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={!supabase}
      >
        Test Supabase Connection
      </button>

      {!supabase && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700">
            ⚠️ Supabase client is not initialized. Check environment variables.
          </p>
        </div>
      )}
    </div>
  )
}
