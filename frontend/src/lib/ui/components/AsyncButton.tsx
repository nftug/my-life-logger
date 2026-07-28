import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface AsyncButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: ReactNode
}

const AsyncButton = ({
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: AsyncButtonProps) => (
  <button {...props} className={`btn ${className}`} disabled={disabled || loading}>
    {loading ? <span className="loading loading-spinner loading-sm" /> : null}
    {children}
  </button>
)

export default AsyncButton
