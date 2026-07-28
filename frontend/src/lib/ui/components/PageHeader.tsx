import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => (
  <header className="flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow ? <p className="mb-1 text-sm font-medium text-primary">{eyebrow}</p> : null}
      <h1 className="text-3xl font-semibold tracking-tight text-base-content">{title}</h1>
      {description ? <p className="mt-2 text-sm text-base-content/65">{description}</p> : null}
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </header>
)

export default PageHeader
