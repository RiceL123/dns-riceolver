import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { About } from './About'
import './App.css'

const API_URL = "https://dns-riceolver.onrender.com";

function App() {
  // const expressServerPort = 5123;
  const [theme, setTheme] = useState("autumn");
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [inputDesc, setInputDesc] = useState({
    label: "Domain",
    placeholder: "Enter domain: example.com"
  });
  const [queryBuilder, setQueryBuilder] = useState("default");
  const [recordType, setRecordType] = useState("A");
  const [resolver, setResolver] = useState("127.0.0.1");

  const question = { input, queryBuilder, recordType, resolver };

  const [showError, setShowError] = useState("hidden")
  const [answer, setAnswer] = useState("hello there 👋")

  const { isPending, error, data, refetch } = useQuery({
    queryKey: [question],
    queryFn: async () => {
      setAnswer("");

      const response = await fetch(`${API_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      return await response.json();
    },
    enabled: false
  })

  const handleQuery = async () => {
    setIsLoading(true);
    refetch();
  }

  useEffect(() => {
    if (data && data.result) { setIsLoading(false); setAnswer(data.result); }
  }, [data]);

  useEffect(() => {
    if (error) { setIsLoading(false); setAnswer(error.message) }
  }, [error]);

  useEffect(() => {
    if (recordType == "PTR") {
      setInputDesc({
        label: "IP Address",
        placeholder: "Enter IPv4: 8.8.8.8"
      })
    } else {
      setInputDesc({
        label: "Domain",
        placeholder: "Enter domain: example.com"
      })
    }
  }, [recordType]);

  useEffect(() => {
    async function warmup() {
      setIsLoading(true);
      setAnswer("Warming up backend 🔥");
  
      try {
        const response = await fetch(`${API_URL}/healthcheck`);
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const text = await response.text(); // ✅ Read response
        console.log("Warm-up response:", text);
  
        setAnswer("hello there 👋");
      } catch (error) {
        console.error("Warm-up failed:", error);
        setAnswer("Failed to warm up backend ❌ ggs");
      } finally {
        setAnswer("hello there 👋");
        setIsLoading(false);
      }
    }

    warmup();
  }, []);

  return (
    <>
      <About />
      <label className="flex cursor-pointer gap-2 absolute top-0 left-0 m-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path
            d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
        <input type="checkbox" value="sunset" className="toggle theme-controller" onChange={e => e.target.checked ? setTheme("sunset") : setTheme("autumn")} />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </label>

      <div role="alert" className={`alert alert-error absolute bottom-0 left-0 m-4 ${showError && "hidden"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error with dns resolution</span>
      </div>

      <main data-theme={theme} className='bg-transparent mx-auto w-full max-w-4xl my-10'>
        <div className='flex flex-col sm:flex-row gap-4 m-2 sm:items-end'>
          <fieldset className="flex grow mb-1">
            <legend className="fieldset-legend text-primary">{inputDesc.label}</legend>
            <input type="text" className="input grow border-secondary" placeholder={inputDesc.placeholder} value={input} onChange={e => setInput(e.target.value)} />
          </fieldset>
          <div className='flex gap-4 justify-around items-end'>
            <fieldset className="fieldset grow basis-0">
              <legend className="fieldset-legend text-primary">Query Builders</legend>
              <select defaultValue="RiceL123's querier" className="select border-secondary" onChange={e => setQueryBuilder(e.target.value)}>
                <option value="default">RiceL123's querier</option>
                <option value="dig">Dig</option>
              </select>
            </fieldset>
            <fieldset className="fieldset grow basis-0">
              <legend className="fieldset-legend text-primary">Record Type</legend>
              <select defaultValue="A" className="select border-secondary" onChange={e => setRecordType(e.target.value)}>
                <option value="A">A (host address)</option>
                <option value="NS">NS (authoritative name server)</option>
                <option value="MX">MX (mail exchange)</option>
                <option value="CNAME">CNAME (canonical name for alias)</option>
                <option value="PTR">PTR (reverse lookup with IPv4)</option>
              </select>
            </fieldset>
            <fieldset className="fieldset grow basis-0">
              <legend className="fieldset-legend text-primary">Resolvers</legend>
              <select defaultValue="RiceL123's resolver" className="select border-secondary" onChange={e => setResolver(e.target.value)}>
                <option value="127.0.0.1">RiceL123's resolver</option>
                <option value="1.1.1.1">Cloudflare (1.1.1.1)</option>
                <option value="8.8.8.8">Google (8.8.8.8)</option>
                <option value="9.9.9.9">Quad9 (9.9.9.9)</option>
              </select>
            </fieldset>
          </div>
        </div>
        <div className='max-w-50 mx-auto flex justify-center'>
          <button className="mb-1 btn text-primary-content text-xl bg-primary grow h-16" onClick={handleQuery}>Lookup 👀</button>
        </div>
        <div className="mockup-browser border-secondary border bg-secondary mx-2 min-h-40">
          <div className="mockup-browser-toolbar">
            <div className="input text-base-content bg-base-100 border-secondary grow">{JSON.stringify(question)}</div>
          </div>
          <div className="grid place-content-center border-t border-base-300 min-h-80 bg-base-100 ">
            {isLoading && <span className="loading loading-spinner loading-xl mx-auto"></span>}
            <pre className='my-4 mx-2'><code className='text-wrap'>{answer}</code></pre>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
