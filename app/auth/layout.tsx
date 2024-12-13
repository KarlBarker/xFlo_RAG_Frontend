import { cn } from '@/lib/utils'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div 
      className={cn(
        "min-h-screen w-full flex items-center justify-center",
        "bg-no-repeat bg-cover bg-center"
      )}
      style={{
        backgroundImage: "url('/images/login_background.svg')"
      }}
    >
      {children}
    </div>
  )
}
