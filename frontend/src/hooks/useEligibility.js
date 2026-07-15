import { useCallback, useState } from 'react'
import { eligibilityService } from '@/services/eligibilityService'

export function useEligibility() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkEligibility = useCallback(async (schemeId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await eligibilityService.checkEligibility(schemeId)
      setResult(res.data)
      return res.data
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Eligibility check failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, loading, error, checkEligibility, setResult }
}
