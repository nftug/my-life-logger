import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  className?: string
}

const EmptyState = ({ title, description, action, className = '' }: EmptyStateProps) => (
  <div
    className={`rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-10 text-center ${className}`}
  >
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-base-content/65">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
)

export default EmptyState
