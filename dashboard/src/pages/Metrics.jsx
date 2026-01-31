import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/client'

export default function Metrics() {
  const [metrics, setMetrics] = useState({
    performance: [],
    cacheHitRate: 0,
    avgResponseTime: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const response = await api.get('/metrics')
      setMetrics(response.data)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setLoading(false)
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Performance Metrics</h1>

      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Cache Hit Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.cacheHitRate}%</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.avgResponseTime}ms</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Operations</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.performance.length}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Over Time</h2>
        {metrics.performance.length === 0 ? (
          <p className="text-gray-500">No performance data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={metrics.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="responseTime" stroke="#0ea5e9" name="Response Time (ms)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
