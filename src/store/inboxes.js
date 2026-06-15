import { defineStore } from 'pinia'
import api from '../api'

export const useInboxesStore = defineStore('inboxes', {
  state: () => ({
    inboxes: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchInboxes() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/inboxes')
        // Assume API returns an array of inboxes directly or { data: [...] } or { inboxes: [...] }
        // We will just use response.data directly based on typical Rails scaffold.
        this.inboxes = response.data
      } catch (err) {
        this.error = 'Failed to load inboxes'
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  }
})
