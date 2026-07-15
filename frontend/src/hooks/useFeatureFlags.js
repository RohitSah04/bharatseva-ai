import { useCallback, useEffect, useRef, useState } from 'react'
import { adminService } from '@/services/adminService'

export function useFeatureFlags() {
  const [flags, setFlags] = useState({})
  const [loading, setLoading] = useState(false)
  const loadedRef = useRef(false)

  const fetchFlags = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getFeatureFlags()
      const flagMap = {}
      const flagList = res.data?.flags || res.data || []
      if (Array.isArray(flagList)) {
        flagList.forEach((f) => { flagMap[f.flag_name] = f.enabled })
      }
      setFlags(flagMap)
      loadedRef.current = true
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loadedRef.current) fetchFlags()
  }, [fetchFlags])

  const isEnabled = useCallback((flagName) => flags[flagName] ?? true, [flags])

  return { flags, loading, isEnabled, fetchFlags }
}
