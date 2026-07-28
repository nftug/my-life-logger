import { useToastContext } from '@/lib/ui/components/ToastProvider'
import { createSignal, type Accessor } from 'solid-js'

interface RunActionOptions {
  successMessage?: string
  onSuccess?: () => void | Promise<void>
  onError?: (error: unknown) => void | Promise<void>
}

interface UseActionRunnerResult {
  pendingAction: Accessor<string | null>
  runAction: (actionKey: string, action: () => Promise<void>, options?: RunActionOptions) => Promise<boolean>
}

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '処理に失敗しました。'
}

export const useActionRunner = (): UseActionRunnerResult => {
  const toast = useToastContext()
  const [pendingAction, setPendingAction] = createSignal<string | null>(null)

  const runAction = async (
    actionKey: string,
    action: () => Promise<void>,
    options: RunActionOptions = {},
  ): Promise<boolean> => {
    setPendingAction(actionKey)
    try {
      await action()

      if (options.onSuccess) {
        await options.onSuccess()
      }
      if (options.successMessage) {
        toast.success(options.successMessage)
      }

      return true
    } catch (error) {
      if (options.onError) {
        await options.onError(error)
      }

      toast.error(toErrorMessage(error))
      return false
    } finally {
      setPendingAction(null)
    }
  }

  return {
    pendingAction,
    runAction,
  }
}
