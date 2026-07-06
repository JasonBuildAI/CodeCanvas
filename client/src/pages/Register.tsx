import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { UserPlus, User, Mail, Lock } from 'lucide-react'

export default function Register() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (username.length < 3) {
      setError(t('auth.error.usernameLength'))
      return
    }
    if (password.length < 6) {
      setError(t('auth.error.passwordLength'))
      return
    }
    try {
      await register(username, email, password)
      navigate('/')
    } catch {
      setError(t('auth.error.registrationFailed'))
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
        <div className="flex items-center justify-center mb-6">
          <UserPlus className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">{t('auth.register')}</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('auth.username')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="coolcoder"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            {isLoading ? t('auth.creatingAccount') : t('auth.register')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">{t('auth.signin')}</Link>
        </p>
      </div>
    </div>
  )
}
