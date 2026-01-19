import { ReactNode } from 'react'

interface LinkButtonProps {
  href: string
  label: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  children?: ReactNode
}

function LinkButton({ href, label, variant = 'secondary', disabled = false, children }: LinkButtonProps) {
  const className = `link-button link-button--${variant}${disabled ? ' link-button--disabled' : ''}`
  
  if (disabled) {
    return (
      <span className={className} aria-disabled="true">
        {children || label}
      </span>
    )
  }
  
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {children || label}
    </a>
  )
}

export default LinkButton
