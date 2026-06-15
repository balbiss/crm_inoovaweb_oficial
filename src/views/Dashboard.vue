<script setup>
import { ref, onMounted } from 'vue'
import { Filter, Users, Flame, ThermometerSun, Snowflake, ArrowUpRight, BarChart2 } from '@lucide/vue'
import api from '../api'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const kpis = ref({
  active_customers: 0,
  pretensao_venda: 0,
  temperature: { quente: 0, morno: 0, frio: 0 }
})

const leadsBySourceData = ref({
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  }]
})

const isLoading = ref(true)

const fetchDashboard = async () => {
  try {
    const response = await api.get('/dashboard')
    kpis.value = response.data.kpis
    
    const sourceData = response.data.leads_by_source
    const labels = Object.keys(sourceData)
    const data = Object.values(sourceData)
    
    if (labels.length > 0) {
      leadsBySourceData.value.labels = labels
      leadsBySourceData.value.datasets[0].data = data
    } else {
      leadsBySourceData.value.labels = ['Sem dados']
      leadsBySourceData.value.datasets[0].data = [1]
      leadsBySourceData.value.datasets[0].backgroundColor = ['#e5e7eb']
    }
  } catch (error) {
    console.error('Error fetching dashboard data', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { font: { family: "'Inter', sans-serif", size: 13 } }
    }
  }
}
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">Dashboard Imobiliário</h1>
        <p class="page-subtitle">Visão geral da sua carteira de clientes e termômetro de leads.</p>
      </div>
      
      <div class="header-filters">
        <div class="filter-badge">
          <span class="filter-label">Hierarquia:</span>
          <span class="filter-value">IMOBILIÁRIA</span>
        </div>
        <div class="filter-badge">
          <span class="filter-label">Pretensão:</span>
          <span class="filter-value">VENDA</span>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      Carregando estatísticas...
    </div>

    <div v-else>
      <!-- Real Estate KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card card-total">
          <div class="kpi-icon-wrapper blue">
            <Users class="icon-md" />
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Carteira de Clientes (Ativos)</span>
            <span class="kpi-value">{{ kpis.active_customers }}</span>
          </div>
        </div>

        <div class="kpi-card card-hot">
          <div class="kpi-icon-wrapper red">
            <Flame class="icon-md" />
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Leads Quentes</span>
            <span class="kpi-value">{{ kpis.temperature.quente }}</span>
          </div>
        </div>

        <div class="kpi-card card-warm">
          <div class="kpi-icon-wrapper orange">
            <ThermometerSun class="icon-md" />
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Leads Mornos</span>
            <span class="kpi-value">{{ kpis.temperature.morno }}</span>
          </div>
        </div>

        <div class="kpi-card card-cold">
          <div class="kpi-icon-wrapper blue-light">
            <Snowflake class="icon-md" />
          </div>
          <div class="kpi-content">
            <span class="kpi-title">Leads Frios</span>
            <span class="kpi-value">{{ kpis.temperature.frio }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Area -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title"><BarChart2 class="icon-sm" /> Leads por Mídia de Origem</h3>
          </div>
          <div class="chart-body">
            <div class="pie-chart-wrapper">
              <Pie :data="leadsBySourceData" :options="chartOptions" />
            </div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Intenções de Negócio</h3>
          </div>
          <div class="chart-body intention-body">
            <div class="intention-stat">
              <div class="stat-number">{{ kpis.pretensao_venda }}</div>
              <div class="stat-label">buscando <strong>VENDA</strong></div>
            </div>
            <!-- Pode adicionar locação depois -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 2rem 3rem;
  background-color: #f8f9fa;
  min-height: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }

  .page-subtitle {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
}

.header-filters {
  display: flex;
  gap: 1rem;

  .filter-badge {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);

    .filter-label {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .filter-value {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1f2937;
    }
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .kpi-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.blue { background: #eff6ff; color: #3b82f6; }
    &.red { background: #fef2f2; color: #ef4444; }
    &.orange { background: #fffbeb; color: #f59e0b; }
    &.blue-light { background: #f0fdfa; color: #0d9488; }
  }

  .kpi-content {
    display: flex;
    flex-direction: column;

    .kpi-title {
      font-size: 0.85rem;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;

  .chart-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #f3f4f6;

    .chart-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .chart-body {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }
}

.pie-chart-wrapper {
  position: relative;
  height: 250px;
  width: 100%;
}

.intention-body {
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;

  .intention-stat {
    text-align: center;
    
    .stat-number {
      font-size: 3.5rem;
      font-weight: 800;
      color: #2563eb;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      color: #4b5563;
      strong { color: #1f2937; font-weight: 700; }
    }
  }
}

.icon-md {
  width: 24px;
  height: 24px;
}

.icon-sm {
  width: 18px;
  height: 18px;
}

.loading-state {
  padding: 4rem;
  text-align: center;
  color: #6b7280;
  font-size: 1.1rem;
}
</style>
