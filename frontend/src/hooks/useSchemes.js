import { useCallback, useState } from 'react'
import { schemeService } from '@/services/schemeService'

export function useSchemes() {
  const [schemes, setSchemes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSchemes = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await schemeService.getSchemes(params)
      setSchemes(res.data.schemes || [])
      setTotal(res.data.total || 0)
      return res.data
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load schemes')
    } finally {
      setLoading(false)
    }
  }, [])

  return { schemes, total, loading, error, fetchSchemes }
}

export function useScheme(id) {
  const [scheme, setScheme] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchScheme = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await schemeService.getScheme(id)
      setScheme(res.data)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Scheme not found')
    } finally {
      setLoading(false)
    }
  }, [id])

  return { scheme, loading, error, fetchScheme }
}
