import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    {
                        'bg-primary text-brand-dark hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,157,0.3)]': variant === 'primary',
                        'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
                        'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
                        'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-foreground': variant === 'glass',
                        'h-9 px-4 py-2': size === 'sm',
                        'h-11 px-8 py-2': size === 'md',
                        'h-14 px-8 text-lg': size === 'lg',
                        'h-10 w-10': size === 'icon',
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
