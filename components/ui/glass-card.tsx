import { cn } from "@/lib/utils"

export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("glass-card rounded-2xl p-6", className)} {...props}>
            {children}
        </div>
    )
}
