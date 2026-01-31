import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Config from './pages/Config'
import Tasks from './pages/Tasks'
import Plugins from './pages/Plugins'
import Metrics from './pages/Metrics'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="config" element={<Config />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="plugins" element={<Plugins />} />
        <Route path="metrics" element={<Metrics />} />
      </Route>
    </Routes>
  )
}

export default App
