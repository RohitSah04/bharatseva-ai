import apiClient, { unwrap } from './apiClient'

export const eligibilityService = {
  checkEligibility: (schemeId) =>
    apiClient.post('/eligibility/check', { scheme_id: schemeId }).then(unwrap),
}
