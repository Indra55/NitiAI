import { OrbitalLoader } from './orbital-loader'
import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <OrbitalLoader
      className={cn('size-8', className)}
      {...props}
    />
  )
}

export { Spinner }
