import { greet } from '@/generated/commands'
import { useState } from 'react'

const IndexPage = () => {
  const [name, setName] = useState('')
  const [greetMsg, setGreetMsg] = useState('')
  const [isError, setIsError] = useState(false)

  const handleGreet = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const message = await greet({ name })
      setGreetMsg(message)
      setIsError(false)
    } catch (error) {
      setGreetMsg(error instanceof Error ? error.message : String(error))
      setIsError(true)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="mb-4 text-3xl font-bold">Welcome back</h1>
      <p className="mb-6 text-center text-sm text-slate-600">
        Capture a quick note, track your mood, and keep your daily timeline in one place.
      </p>

      <form className="flex flex-wrap items-end gap-3" onSubmit={handleGreet}>
        <div className="min-w-55 flex-1">
          <label className="input">
            <span className="label">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter your name"
              required
            />
          </label>
        </div>
        <button type="submit" className="btn">
          Greet
        </button>
      </form>

      {greetMsg && !isError && (
        <p className="mt-4 text-sm font-medium text-emerald-700">{greetMsg}</p>
      )}
      {isError && <p className="mt-4 text-sm font-medium text-red-700">{greetMsg}</p>}
    </div>
  )
}

export default IndexPage
