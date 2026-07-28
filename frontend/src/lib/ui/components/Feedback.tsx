interface ErrorAlertProps {
  message: string
  onRetry?: () => void
}

export const ErrorAlert = ({ message, onRetry }: ErrorAlertProps) => (
  <div className="alert alert-error text-sm" role="alert">
    <span>{message}</span>
    {onRetry ? (
      <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
        再試行
      </button>
    ) : null}
  </div>
)

export const LoadingState = () => (
  <div className="flex min-h-64 items-center justify-center" aria-label="読み込み中">
    <span className="loading loading-spinner loading-md text-primary" />
  </div>
)
