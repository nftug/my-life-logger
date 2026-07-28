import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

const FormField = ({ label, hint, error, children }: FormFieldProps) => (
  <label className="form-control w-full gap-1">
    <span className="label-text font-medium">{label}</span>
    {children}
    {error ? <span className="text-sm text-error">{error}</span> : null}
    {!error && hint ? <span className="text-xs text-base-content/55">{hint}</span> : null}
  </label>
)

export default FormField
