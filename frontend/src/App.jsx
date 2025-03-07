import { useState } from 'react'
import './App.css'

import { About } from './About'

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
      <About />

      <main data-theme="autumn" className='bg-transparent mx-auto w-full max-w-4xl'>
        <div className='flex flex-col sm:flex-row gap-4 m-2 sm:items-end'>
          <fieldset className="flex grow mb-1">
            <legend className="fieldset-legend text-primary">Domain</legend>
            <input type="text" className="input grow border-secondary" placeholder="Enter domain: example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
          </fieldset>
          <div className='flex gap-4 justify-around'>
            <fieldset className="fieldset grow basis-0">
              <legend className="fieldset-legend text-primary">Query Builders</legend>
              <select defaultValue="RiceL123's querier" className="select border-secondary">
                <option>RiceL123's querier</option>
                <option>Dig</option>
              </select>
            </fieldset>
            <fieldset className="fieldset grow basis-0">
              <legend className="fieldset-legend text-primary">Record Type</legend>
              <select defaultValue="A" className="select border-secondary">
                <option>A</option>
                <option>MX</option>
                <option>CNAME</option>
                <option>PTR (reverse lookup)</option>
              </select>
            </fieldset>
            <fieldset className="fieldset grow basis-0">
              <legend className="fieldset-legend text-primary">Resolvers</legend>
              <select defaultValue="RiceL123's resolver" className="select border-secondary">
                <option>RiceL123's resolver</option>
                <option>Cloudflare (1.1.1.1)</option>
                <option>Google (8.8.8.8)</option>
                <option>Quad9 (9.9.9.9)</option>
                <option>OpenDNS (208.67.222.222)</option>
              </select>
            </fieldset>
          </div>
        </div>
        <div className='max-w-50 mx-auto flex justify-center'>
          <button className="mb-1 btn text-primary-content bg-primary grow" onClick={handleQuery}>Lookup</button>
        </div>
        <div className="mockup-browser border-secondary border bg-secondary mx-2">
          <div className="mockup-browser-toolbar">
            <div className="input text-accent-content bg-base-100 border-secondary">{domain}</div>
          </div>
          <div className="grid place-content-center border-t border-base-300 h-80 bg-base-100">
            {loading && <span className="loading loading-spinner loading-xs"></span>}
            <p>{loading ? "loading" : "not loading"}</p>
            <p>{answer}</p>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
