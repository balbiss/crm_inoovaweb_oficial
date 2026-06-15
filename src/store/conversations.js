import { defineStore } from 'pinia'
import api from '../api'

export const useConversationsStore = defineStore('conversations', {
  state: () => ({
    conversations: [],
    activeConversationId: null,
    currentFilter: 'todos', // todos, minhas, nao-atribuidos
    sidebarFilter: 'all',
    sidebarInboxId: null,
    sortStatus: 'open',
    sortBy: 'latest',
    sortType: 'all',
    advancedFilters: [],
    ws: null,
    currentUser: (() => {
      try {
        return JSON.parse(localStorage.getItem('user')) || { first_name: 'Usuário', email: '' }
      } catch {
        return { first_name: 'Usuário', email: '' }
      }
    })()
  }),

  getters: {
    activeConversation(state) {
      return state.conversations.find(c => c.id === state.activeConversationId) || null
    },
    sidebarFilteredConversations(state) {
      let filtered = state.conversations

      // Sort Status filter
      if (state.sortStatus !== 'all') {
        filtered = filtered.filter(c => c.status === state.sortStatus)
      }

      // Sort Type filter
      if (state.sortType === 'unread') {
        filtered = filtered.filter(c => c.unread > 0)
      } else if (state.sortType === 'mentions') {
        filtered = filtered.filter(c => false) // Mock mentions
      }

      // Sidebar route param filter overrides
      if (state.sidebarFilter === 'mencoes') {
        filtered = filtered.filter(c => false) // Mock
      } else if (state.sidebarFilter === 'participantes') {
        filtered = filtered.filter(c => c.assignee !== state.currentUser.name) // Mock
      } else if (state.sidebarFilter === 'nao-atendidas') {
        filtered = filtered.filter(c => c.status === 'open' && c.unread > 0)
      }

      // Inbox Filter
      if (state.sidebarInboxId) {
        filtered = filtered.filter(c => String(c.inbox_id) === String(state.sidebarInboxId))
      }

      return filtered
    },
    filteredConversations(state) {
      let filtered = this.sidebarFilteredConversations
      
      if (state.currentFilter === 'minhas') {
        filtered = filtered.filter(c => c.assignee === state.currentUser.name)
      } else if (state.currentFilter === 'nao-atribuidos') {
        filtered = filtered.filter(c => !c.assignee)
      }
      
      // Apply advanced filters
      if (state.advancedFilters && state.advancedFilters.length > 0) {
        state.advancedFilters.forEach(filter => {
          if (!filter.attribute || !filter.operator || !filter.value) return;
          
          filtered = filtered.filter(c => {
            let actualValue;
            
            if (filter.attribute === 'status') {
              actualValue = c.status;
            } else if (filter.attribute === 'assignee') {
              actualValue = c.assignee || 'unassigned';
            }
            
            if (filter.operator === 'equal_to') {
              return actualValue === filter.value;
            } else if (filter.operator === 'not_equal_to') {
              return actualValue !== filter.value;
            }
            return true;
          });
        });
      }

      // Apply Sort By
      if (state.sortBy === 'oldest') {
        filtered = filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      } else {
        // latest
        filtered = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      }

      return filtered
    }
  },

  actions: {
    async fetchConversations() {
      try {
        const response = await api.get('/conversations')
        this.conversations = response.data
        if (this.conversations.length > 0 && !this.activeConversationId) {
          this.activeConversationId = this.conversations[0].id
        }
        this.setupWebSocket()
      } catch (error) {
        console.error('Error fetching conversations:', error)
      }
    },

    setActiveConversation(id) {
      this.activeConversationId = id
      const conv = this.conversations.find(c => c.id === id)
      if (conv) {
        conv.unread = 0
      }
    },

    setFilter(filterType) {
      this.currentFilter = filterType
    },

    setSidebarFilter(filterType) {
      this.sidebarFilter = filterType
      this.sidebarInboxId = null
    },

    setSidebarInboxId(inboxId) {
      this.sidebarInboxId = inboxId
      this.sidebarFilter = null
    },

    setSortFilters({ status, sortBy, type }) {
      this.sortStatus = status
      this.sortBy = sortBy
      this.sortType = type
    },

    setAdvancedFilters(filters) {
      this.advancedFilters = filters
    },

    async sendMessage(text, isPrivate = false, file = null) {
      if (!this.activeConversationId || (!text.trim() && !file)) return

      try {
        let response;
        if (file) {
          const formData = new FormData()
          formData.append('text', text)
          formData.append('is_private', isPrivate)
          formData.append('attachment', file)
          response = await api.post(`/conversations/${this.activeConversationId}/messages`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        } else {
          response = await api.post(`/conversations/${this.activeConversationId}/messages`, {
            text,
            is_private: isPrivate
          })
        }
        const newMsg = response.data.message
        const conv = this.conversations.find(c => c.id === this.activeConversationId)
        if (conv) {
          if (!conv.messages) conv.messages = []
          const exists = conv.messages.some(m => m.id === newMsg.id)
          if (!exists) {
            conv.messages.push(newMsg)
          }
          conv.preview = newMsg.text
          conv.timestamp = newMsg.timestamp
        }
      } catch (error) {
        console.error('Error sending message:', error)
      }
    },

    async updateContact(contactId, data) {
      try {
        const response = await api.put(`/contacts/${contactId}`, { contact: data })
        // Update contact in all conversations that match
        this.conversations.forEach(c => {
          if (c.contact && c.contact.id === contactId) {
            Object.assign(c.contact, response.data)
          }
        })
      } catch (error) {
        console.error('Error updating contact:', error)
        throw error
      }
    },

    async deleteContact(contactId) {
      try {
        await api.delete(`/contacts/${contactId}`)
        // Remove conversations belonging to this contact
        this.conversations = this.conversations.filter(c => !c.contact || c.contact.id !== contactId)
        if (this.activeConversation && this.activeConversation.contact.id === contactId) {
          this.activeConversationId = null
        }
      } catch (error) {
        console.error('Error deleting contact:', error)
        throw error
      }
    },

    async mergeContact(contactId, targetContactId) {
      try {
        await api.post(`/contacts/${contactId}/merge`, { target_contact_id: targetContactId })
        // Re-fetch everything because conversations were moved
        await this.fetchConversations()
      } catch (error) {
        console.error('Error merging contact:', error)
        throw error
      }
    },

    async updateConversationStatus(conversationId, status) {
      try {
        const response = await api.put(`/conversations/${conversationId}`, {
          conversation: { status }
        })
        
        const convIndex = this.conversations.findIndex(c => c.id === conversationId)
        if (convIndex !== -1) {
          // Update the local conversation state
          this.conversations[convIndex].status = response.data.status
        }
      } catch (error) {
        console.error('Error updating conversation status:', error)
      }
    },

    setupWebSocket() {
      if (this.ws) return

      let baseURL = api.defaults.baseURL
      if (!baseURL) {
        baseURL = window.location.origin.replace(':5173', ':3000')
      }
      
      const wsURL = baseURL.replace(/^http/, 'ws') + '/cable'
      console.log('Connecting to Action Cable WebSocket:', wsURL)
      
      const ws = new WebSocket(wsURL)
      this.ws = ws

      ws.onopen = () => {
        console.log('Action Cable WebSocket connected')
        ws.send(JSON.stringify({
          command: 'subscribe',
          identifier: JSON.stringify({ channel: 'ConversationsChannel' })
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'ping' || data.type === 'welcome' || data.type === 'confirm_subscription') {
            return
          }

          console.log('WebSocket message received:', data)
          const payload = data.message
          if (!payload) return

          console.log('WS event:', payload.event, 'payload:', payload)

          if (payload.event === 'message_created') {
            const { conversation_id, message: newMsg } = payload
            console.log('Searching for conversation_id:', conversation_id, 'type:', typeof conversation_id)
            console.log('Available conversation IDs:', this.conversations.map(c => `${c.id} (${typeof c.id})`))
            
            const conv = this.conversations.find(c => Number(c.id) === Number(conversation_id))
            if (conv) {
              if (!conv.messages) conv.messages = []
              const exists = conv.messages.some(m => m.id === newMsg.id)
              console.log('Message exists in conversation?', exists)
              if (!exists) {
                conv.messages.push(newMsg)
                conv.preview = newMsg.text
                conv.timestamp = newMsg.timestamp
                console.log('Added message to store reactively!')
                
                if (Number(conversation_id) !== Number(this.activeConversationId)) {
                  conv.unread = (conv.unread || 0) + 1
                }
                
                window.dispatchEvent(new CustomEvent('new-message', {
                  detail: { conversationId: conversation_id }
                }))
              }
            } else {
              console.warn('Conversation not found in list, fetching conversations again...')
              this.fetchConversations()
            }
          } else if (payload.event === 'inbox_updated') {
            window.dispatchEvent(new CustomEvent('inbox-updated', {
              detail: payload
            }))
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        this.ws = null
        setTimeout(() => {
          this.setupWebSocket()
        }, 3000)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        ws.close()
      }
    }
  }
})

