import { useEffect, useState } from 'react'
import { Package, Download, Trash2 } from 'lucide-react'
import api from '../api/client'

export default function Plugins() {
  const [plugins, setPlugins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlugins()
  }, [])

  const loadPlugins = async () => {
    try {
      const response = await api.get('/plugins')
      setPlugins(response.data)
    } catch (error) {
      console.error('Failed to load plugins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInstall = async (pluginName) => {
    try {
      await api.post(`/plugins/${pluginName}/install`)
      await loadPlugins()
      alert('Plugin installed successfully')
    } catch (error) {
      console.error('Failed to install plugin:', error)
      alert('Failed to install plugin')
    }
  }

  const handleUninstall = async (pluginName) => {
    if (!confirm(`Are you sure you want to uninstall ${pluginName}?`)) return
    
    try {
      await api.delete(`/plugins/${pluginName}`)
      await loadPlugins()
      alert('Plugin uninstalled successfully')
    } catch (error) {
      console.error('Failed to uninstall plugin:', error)
      alert('Failed to uninstall plugin')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Plugins</h1>
        <p className="mt-2 text-sm text-gray-600">
          Extend KamiFlow with community plugins
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plugins.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No plugins installed</h3>
            <p className="mt-1 text-sm text-gray-500">
              Install plugins to extend KamiFlow functionality
            </p>
          </div>
        ) : (
          plugins.map((plugin) => (
            <div key={plugin.name} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-primary-500" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">{plugin.name}</h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  v{plugin.version}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{plugin.description}</p>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  plugin.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {plugin.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={() => handleUninstall(plugin.name)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
