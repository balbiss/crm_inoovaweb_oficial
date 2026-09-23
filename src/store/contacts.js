import { defineStore } from 'pinia'
import { fetchAllPages } from '../api'

export const useContactsStore = defineStore('contacts', {
  state: () => ({
    contacts: [],
    isLoading: false,
    isLoadedOnce: false
  }),
  
  actions: {
    async fetchContacts() {
      if (!this.isLoadedOnce) {
        this.isLoading = true
      }
      
      try {
        this.contacts = await fetchAllPages('/contacts', 200)
        this.isLoadedOnce = true
      } catch (error) {
        console.error('Failed to fetch contacts:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    removeContact(id) {
      this.contacts = this.contacts.filter(c => c.id !== id)
    }
  }
})
