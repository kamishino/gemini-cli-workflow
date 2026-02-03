import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Settings, ListTodo, Package, BarChart3 } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Configuration', href: '/config', icon: Settings },
    { name: 'Tasks', href: '/tasks', icon: ListTodo },
    { name: 'Plugins', href: '/plugins', icon: Package },
    { name: 'Metrics', href: '/metrics', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-2xl font-bold text-primary-600">KamiFlow</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
