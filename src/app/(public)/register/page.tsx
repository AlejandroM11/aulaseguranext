'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, GraduationCap, BookOpen } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiRegister } from '@/lib/api'
import { signInWithGoogle } from '@/lib/googleAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Role = 'estudiante' | 'docente'

export default function RegisterPage() {
  const { setUser } = useAuth()
  const router = useRouter()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState<Role>('estudiante')
  const [loading,  setLoading]  = useState(false)
  const [gLoading, setGLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiRegister({ email, password, name, role })
      if (res.ok) {
        setUser({ uid: res.uid, email: res.email, name: res.name, role: res.role as Role })
        toast.success('¡Cuenta creada exitosamente!')
        router.push(role === 'docente' ? '/docente' : '/estudiante')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGLoading(true)
    try {
      const user = await signInWithGoogle(role)
      setUser(user)
      toast.success(user.fromGoogle ? '¡Cuenta creada con Google!' : '¡Sesión iniciada!')
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
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-700 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-600/30">
              <User className="w-9 h-9 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-1">Crear cuenta</h1>
          <p className="text-sm text-center text-slate-500 mb-8">Únete a Aula Segura</p>

          {/* Role selector — shown first so Google also uses it */}
          <div className="mb-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">Rol</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'estudiante', label: 'Estudiante', Icon: GraduationCap, color: 'text-green-600' },
                { value: 'docente',    label: 'Docente',    Icon: BookOpen,      color: 'text-blue-600'  },
              ] as const).map(({ value, label, Icon, color }) => (
                <button key={value} type="button" onClick={() => setRole(value)}
                  className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    role === value
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm shadow-blue-600/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}>
                  <Icon className={cn('w-6 h-6', role === value ? color : 'text-slate-400')} />
                  <span className={cn('text-sm font-bold', role === value ? 'text-slate-900 dark:text-white' : 'text-slate-500')}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nombre completo" type="text" placeholder="Juan Pérez"
              value={name} onChange={e => setName(e.target.value)}
              icon={<User className="w-4 h-4" />} required />
            <Input label="Correo" type="email" placeholder="correo@ejemplo.com"
              value={email} onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />} required />
            <Input label="Contraseña" type="password" placeholder="Mínimo 6 caracteres"
              value={password} onChange={e => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />} required minLength={6} />
            <Button type="submit" variant="gradient" className="w-full" size="lg" loading={loading}>
              Registrarme
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">O regístrate con</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

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
            Continuar con Google como {role === 'docente' ? 'Docente' : 'Estudiante'}
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
