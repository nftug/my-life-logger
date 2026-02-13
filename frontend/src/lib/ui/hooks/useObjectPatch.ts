import type { Setter } from 'solid-js'

export const createObjectPatch = <T extends object>(setter: Setter<T>) =>
  (patch: Partial<T>) => {
    setter((prev) => ({ ...prev, ...patch }))
  }
