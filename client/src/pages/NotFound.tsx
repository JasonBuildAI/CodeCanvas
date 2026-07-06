import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-gray-600 mb-4">{t('notFound.title')}</h1>
      <p className="text-gray-400 mb-8">{t('notFound.message')}</p>
      <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
        <Home className="w-4 h-4" />
        {t('notFound.backToHome')}
      </Link>
    </div>
  )
}
