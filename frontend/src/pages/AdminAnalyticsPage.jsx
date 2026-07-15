import { useEffect, useState } from 'react'
import { adminService } from '@/services/adminService'
import { StatCard } from '@/components/StatCard'
import { PageLoader, SkeletonCard } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { Users, TrendingUp, Search, Brain, Activity } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899']

export default function AdminAnalyticsPage() {
  const [userGrowth, setUserGrowth] = useState(null)
  const [popularSchemes, setPopularSchemes] = useState(null)
  const [agentPerf, setAgentPerf] = useState(null)
  const [searchTrends, setSearchTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [g, p, a, s] = await Promise.allSettled([
        adminService.getUserGrowth(),
        adminService.getPopularSchemes(),
        adminService.getAgentPerformance(),
        adminService.getSearchTrends(),
      ])
      if (g.status === 'fulfilled') setUserGrowth(g.value.data)
      if (p.status === 'fulfilled') setPopularSchemes(p.value.data)
      if (a.status === 'fulfilled') setAgentPerf(a.value.data)
      if (s.status === 'fulfilled') setSearchTrends(s.value.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const growthData = Array.isArray(userGrowth) ? userGrowth : userGrowth?.data || []
  const schemesData = Array.isArray(popularSchemes) ? popularSchemes : popularSchemes?.schemes || []
  const agentData = Array.isArray(agentPerf) ? agentPerf : agentPerf?.agents || []
  const trendsData = Array.isArray(searchTrends) ? searchTrends : searchTrends?.trends || []

  if (loading) return <PageLoader />
  if (error) return <ErrorState message={error} onRetry={fetchAll} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Analytics</h1>
        <p className="text-sm text-gray-500">Platform-wide metrics and agent performance</p>
      </div>

      {/* User Growth */}
      {growthData.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={growthData} margin={{ left: 0, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Popular Schemes */}
      {schemesData.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Popular Schemes</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={schemesData.slice(0, 10)} layout="vertical" margin={{ left: 80, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="scheme_name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip />
              <Bar dataKey="view_count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Agent Performance */}
      {agentData.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Agent Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Agent performance metrics">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="pb-3 pr-4">Agent</th>
                  <th className="pb-3 pr-4">Calls</th>
                  <th className="pb-3 pr-4">Avg Latency</th>
                  <th className="pb-3 pr-4">Avg Confidence</th>
                  <th className="pb-3">Fallback Rate</th>
                </tr>
              </thead>
              <tbody>
                {agentData.map((agent, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{agent.agent_name}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{agent.call_count || '—'}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{agent.avg_latency_ms ? `${agent.avg_latency_ms}ms` : '—'}</td>
                    <td className="py-2.5 pr-4">
                      {agent.avg_confidence != null ? (
                        <span className={`badge text-xs ${agent.avg_confidence >= 0.8 ? 'bg-emerald-100 text-emerald-800' : agent.avg_confidence >= 0.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'}`}>
                          {Math.round(agent.avg_confidence * 100)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-2.5 text-gray-600">
                      {agent.fallback_rate != null ? `${Math.round(agent.fallback_rate * 100)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search Trends */}
      {trendsData.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-3">Top Search Queries</h2>
          <ul className="space-y-2">
            {trendsData.slice(0, 10).map((t, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{t.query || t.term}</span>
                <span className="text-gray-500 font-medium">{t.count} searches</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {growthData.length === 0 && schemesData.length === 0 && agentData.length === 0 && (
        <div className="card p-8 text-center text-gray-500 text-sm">
          No analytics data available yet.
        </div>
      )}
    </div>
  )
}
