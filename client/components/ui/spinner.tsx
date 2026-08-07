import { cn } from '@/lib/utils'

interface SpinnerProps extends React.ComponentProps<'div'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  const sizeMap = {
    sm: '0.25px',
    md: '0.5px',
    lg: '0.75px',
    xl: '1px',
  };

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <span className="loader block shrink-0" style={{ '--size': sizeMap[size] } as React.CSSProperties} />
    </div>
  )
}

export { Spinner }
