<script lang="ts">
  import { greet } from '@/generated/commands'

  let name = $state('')
  let greetMsg = $state('')
  let isError = $state(false)

  async function handleGreet(event: Event) {
    event.preventDefault()
    try {
      greetMsg = await greet({ name })
      isError = false
    } catch (error) {
      greetMsg = error as string
      isError = true
    }
  }
</script>

<div class="flex flex-col items-center justify-center h-full">
  <h1 class="mb-4 text-3xl font-bold">Welcome back</h1>
  <p class="mb-6 text-center text-sm text-slate-600">
    Capture a quick note, track your mood, and keep your daily timeline in one place.
  </p>

  <form class="flex flex-wrap items-end gap-3" onsubmit={handleGreet}>
    <div class="min-w-55 flex-1">
      <label class="input">
        <span class="label">Name</span>
        <input type="text" bind:value={name} placeholder="Enter your name" required />
      </label>
    </div>
    <button type="submit" class="btn">Greet</button>
  </form>

  {#if greetMsg && !isError}
    <p class="mt-4 text-sm font-medium text-emerald-700">{greetMsg}</p>
  {:else if isError}
    <p class="mt-4 text-sm font-medium text-red-700">{greetMsg}</p>
  {/if}
</div>
