import apiClient, { unwrap } from './apiClient'

export const goalService = {
  createGoal: (goalText) =>
    apiClient.post('/goals', { goal_text: goalText }).then(unwrap),

  activateGoal: (id) =>
    apiClient.post(`/goals/${id}/activate`).then(unwrap),

  getGoals: () =>
    apiClient.get('/goals').then(unwrap),

  getGoal: (id) =>
    apiClient.get(`/goals/${id}`).then(unwrap),
}
