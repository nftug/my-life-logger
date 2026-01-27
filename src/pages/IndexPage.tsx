import { createSignal, Show } from 'solid-js'
import { greet } from '@/generated/commands'

const IndexPage = () => {
  const [name, setName] = createSignal('')
  const [greetMsg, setGreetMsg] = createSignal('')
  const [isError, setIsError] = createSignal(false)

  const handleGreet = async (event: Event) => {
    event.preventDefault()
    try {
      const message = await greet({ name: name() })
      setGreetMsg(message)
      setIsError(false)
    } catch (error) {
      setGreetMsg(error instanceof Error ? error.message : String(error))
      setIsError(true)
    }
  }

  return (
    <div class="flex h-full flex-col items-center justify-center">
      <h1 class="mb-4 text-3xl font-bold">Welcome back</h1>
      <p class="mb-6 text-center text-sm text-slate-600">
        Capture a quick note, track your mood, and keep your daily timeline in one place.
      </p>

      <form class="flex flex-wrap items-end gap-3" onSubmit={handleGreet}>
        <div class="min-w-55 flex-1">
          <label class="input">
            <span class="label">Name</span>
            <input
              type="text"
              value={name()}
              onInput={(event) => setName(event.currentTarget.value)}
              placeholder="Enter your name"
              required
            />
          </label>
        </div>
        <button type="submit" class="btn">
          Greet
        </button>
      </form>

      <Show when={greetMsg() && !isError()}>
        <p class="mt-4 text-sm font-medium text-emerald-700">{greetMsg()}</p>
      </Show>
      <Show when={isError()}>
        <p class="mt-4 text-sm font-medium text-red-700">{greetMsg()}</p>
      </Show>
    </div>
  )
}

export default IndexPage
