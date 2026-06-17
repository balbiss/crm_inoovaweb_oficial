import { defineStore } from 'pinia'
import api from '../api'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    kpis: {
      active_customers: 0,
      pretensao_venda: 0,
      temperature: { quente: 0, morno: 0, frio: 0 }
    },
    leadsBySourceData: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
      }]
    },
    isOwner: false,
    isLoading: false,
    isLoadedOnce: false
  }),
  
  actions: {
    async fetchDashboard() {
      if (!this.isLoadedOnce) {
        this.isLoading = true
      }
      
      try {
        const response = await api.get('/dashboard')
        this.kpis = response.data.kpis
        this.isOwner = response.data.is_owner
        
        const sourceData = response.data.leads_by_source
        const labels = Object.keys(sourceData)
        const data = Object.values(sourceData)
        
        if (labels.length > 0) {
          this.leadsBySourceData.labels = labels
          this.leadsBySourceData.datasets[0].data = data
        } else {
          this.leadsBySourceData.labels = ['Sem dados']
          this.leadsBySourceData.datasets[0].data = [1]
          this.leadsBySourceData.datasets[0].backgroundColor = ['#e5e7eb']
        }
        
        this.isLoadedOnce = true
      } catch (error) {
        console.error('Error fetching dashboard data', error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
