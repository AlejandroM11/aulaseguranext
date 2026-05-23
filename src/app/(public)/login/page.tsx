'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiLogin } from '@/lib/api'
import { signInWithGoogle } from '@/lib/googleAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { setUser } = useAuth()
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [gLoading, setGLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiLogin({ email, password })
      if (res.ok && res.user) {
        setUser(res.user)
        router.push(res.user.role === 'docente' ? '/docente' : '/estudiante')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      if (msg.toLowerCase().includes('no password') || msg.toLowerCase().includes('sign-in provider')) {
        toast.error('Esta cuenta fue creada con Google. Usa el botón "Continuar con Google".')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGLoading(true)
    try {
      const user = await signInWithGoogle()
      setUser(user)
      router.push(user.role === 'docente' ? '/docente' : '/estudiante')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error con Google')
    } finally {
      setGLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-900 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30">
                <svg width="40" height="40" viewBox="0 0 110 110" fill="none">
                  <defs>
                    <linearGradient id="lgBg" x1="0" y1="0" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1e3a5f"/><stop offset="100%" stopColor="#2563eb"/>
                    </linearGradient>
                  </defs>
                  <circle cx="55" cy="55" r="50" fill="url(#lgBg)" />
                  <rect x="36" y="52" width="38" height="28" rx="7" fill="white" opacity=".95"/>
                  <path d="M44 52 v-10 a11 11 0 0 1 22 0V52" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  <circle cx="55" cy="64" r="4" fill="#1e3a5f"/>
                  <rect x="53.5" y="64" width="3" height="7" rx="1.5" fill="#1e3a5f"/>
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-1">Iniciar sesión</h1>
          <p className="text-sm text-center text-slate-500 mb-8">Accede a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Correo electrónico" type="email" placeholder="correo@ejemplo.com"
              value={email} onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />} required autoComplete="email" />
            <Input label="Contraseña" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />} required autoComplete="current-password" />
            <Button type="submit" variant="primary" className="w-full" size="lg" loading={loading}>
              Entrar
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">O continúa con</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="flex flex-col gap-3">
            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={gLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all font-semibold text-sm text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gLoading ? (
                <svg className="animate-spin w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continuar con Google
            </button>

            {/* Guest access */}
            <Link href="/invitado">
              <Button variant="gradient" className="w-full" size="lg">
                <Zap className="w-4 h-4" /> Acceso rápido (sin cuenta)
              </Button>
            </Link>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
