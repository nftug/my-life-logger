<script lang="ts">
  import { greet } from '@/generated/commands'
  import { Button, Input, Label } from 'flowbite-svelte'

  let name = $state('')
  let greetMsg = $state('')

  async function handleGreet(event: Event) {
    event.preventDefault()
    greetMsg = await greet({ name })
  }
</script>

<div class="flex flex-col items-center justify-center h-full">
  <h1 class="mb-4 text-3xl font-bold">Welcome back</h1>
  <p class="mb-6 text-center text-sm text-slate-600">
    Capture a quick note, track your mood, and keep your daily timeline in one place.
  </p>

  <form class="flex flex-wrap items-end gap-3" onsubmit={handleGreet}>
    <div class="min-w-55 flex-1">
      <Label class="mb-2 block" for="greet-input">Name</Label>
      <Input id="greet-input" placeholder="Enter a name..." bind:value={name} />
    </div>
    <Button type="submit">Greet</Button>
  </form>

  {#if greetMsg}
    <p class="mt-4 text-sm font-medium text-emerald-700">{greetMsg}</p>
  {/if}
</div>
