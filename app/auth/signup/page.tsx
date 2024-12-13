import { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your account',
}

export default function SignUpPage() {
  return (
    <div className="relative z-10 flex flex-col items-center">
      <div className="mb-8">
        <Image
          src="/images/xflo-logo.png"
          alt="xFlo Logo"
          width={120}
          height={120}
          priority
        />
      </div>
      <div className="w-[400px]">
        <AuthForm view="sign_up" />
      </div>
    </div>
  )
}
