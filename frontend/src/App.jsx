import { useState } from 'react'
import './App.css'

function App() {
  const expressServerPort = 5123
  const [loading, setLoading] = useState(false)
  const [domain, setDomain] = useState("")
  const [answer, setAnswer] = useState("")

  const handleQuery = async () => {
    setLoading(true)
    console.log(`domainName: ${domain}`)

    try {
      const response = await fetch(`http://localhost:${expressServerPort}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainName: domain })
      })

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resolve domain");
      }

      setAnswer(data.result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input type="text" placeholder="Enter domain: example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
      <button onClick={handleQuery}>Submit</button>
      <p>{loading ? "loading" : "not loading"}</p>
      <p>{answer}</p>
    </>
  )
}

export default App
