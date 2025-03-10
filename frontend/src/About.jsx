import './App.css'

export function About() {
  return (
    <>
      <button className="absolute right-0 top-0 btn text-base-content bg-transparent m-2" onClick={() => document.getElementById('my_modal_2').showModal()}>
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 64 64" className='fill-secondary'>
          <path d="M 32 10 C 19.85 10 10 19.85 10 32 C 10 44.15 19.85 54 32 54 C 44.15 54 54 44.15 54 32 C 54 19.85 44.15 10 32 10 z M 32 14 C 41.941 14 50 22.059 50 32 C 50 41.941 41.941 50 32 50 C 22.059 50 14 41.941 14 32 C 14 22.059 22.059 14 32 14 z M 32 21 C 30.343 21 29 22.343 29 24 C 29 25.657 30.343 27 32 27 C 33.657 27 35 25.657 35 24 C 35 22.343 33.657 21 32 21 z M 32 30 C 30.895 30 30 30.896 30 32 L 30 42 C 30 43.104 30.895 44 32 44 C 33.105 44 34 43.104 34 42 L 34 32 C 34 30.896 33.105 30 32 30 z"></path>
        </svg>
        About
      </button>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl">A DNS resolver in python</h3>
          <p>Implemented according to a subset of the <a className="link" href="https://datatracker.ietf.org/doc/html/rfc1035">RFC1035</a></p>
          <p className="py-4 text-xl underline">Client</p>
          <p>You can use my custom query builder or <a className="link" href="https://linux.die.net/man/1/dig">dig</a></p>
          <p className='py-4 text-lg underline'>Queries</p>
          <p>Available record options include</p>
          <ul className='ml-4'>
            <li> - A (a host address)</li>
            <li> - NS (an authoritative name server)</li>
            <li> - MX (mail exchange)</li>
            <li> - CNAME (the canonical name for an alias)</li>
            <li> - PTR (only supports IPv4 for reverse lookups)</li>
          </ul>
          <p className="py-4 text-xl underline">Resolver</p>
          <p>You can use my custom resolver or any of the listed resolvers like google's at 8.8.8.8</p>
          <div className='divider'></div>
          <p>Built / Deployed with</p>
          <div className='text-sm'>
            <p>
              <span className="font-bold">Backend: </span>
              <a className="link" href="https://www.python.org/">Python</a>,{" "}
              <a className="link" href="https://nodejs.org/en">NodeJS</a>,{" "}
              <a className="link" href="https://expressjs.com/">Express</a>,{" "}
              <a className="link" href="https://www.docker.com/">Docker</a>,{" "}
              <a className="link" href="https://render.com/">Render</a>
            </p>
            <p>
              <span className="font-bold">Frontend: </span>
              <a className="link" href="https://react.dev/">React</a>,{" "}
              <a className="link" href="https://tailwindcss.com/">TailwindCSS</a>,{" "}
              <a className="link" href="https://daisyui.com/">Daisy UI</a>,{" "}
              <a className="link" href="https://vite.dev/">Vite</a>,{" "}
              <a className="link" href="https://vercel.com/">Vercel</a>
            </p>
          </div>
          <p className='mt-4 text-end text-xs'>All the code for this project is available on my <a className="link" href="https://github.com/RiceL123/DNS-resolver">GitHub</a></p>
          <p className='mt-4 text-end text-xs'>Made by <a className="link" href="https://ricel123-links.onrender.com/">RiceL123</a></p>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
