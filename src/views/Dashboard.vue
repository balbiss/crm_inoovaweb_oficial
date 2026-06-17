<script setup>
import { ref, onMounted } from 'vue'
import { Filter, Users, Flame, ThermometerSun, Snowflake, ArrowUpRight, BarChart2 } from '@lucide/vue'
import api from '../api'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'
import { useDashboardStore } from '../store/dashboard'
import { storeToRefs } from 'pinia'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const dashboardStore = useDashboardStore()
const { kpis, leadsBySourceData, isLoading } = storeToRefs(dashboardStore)

const fetchDashboard = () => {
  dashboardStore.fetchDashboard()
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

    <div v-if="isLoading" class="skeleton-dashboard">
      <div class="skeleton-kpi-grid">
        <div class="skeleton-kpi-card" v-for="i in 4" :key="i">
          <div class="skeleton-kpi-icon"></div>
          <div class="skeleton-kpi-content">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line value"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-charts-grid">
        <div class="skeleton-chart-card"></div>
        <div class="skeleton-chart-card"></div>
      </div>
    </div>

    <div v-else>
      <!-- Real Estate KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card card-total">
          <div class="card-glow blue-glow"></div>
          <div class="kpi-icon-wrapper blue">
            <Users class="icon-md" />
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ kpis.active_customers }}</span>
            <span class="kpi-title">Carteira de Clientes Ativos</span>
          </div>
        </div>

        <div class="kpi-card card-hot">
          <div class="card-glow red-glow"></div>
          <div class="kpi-icon-wrapper red">
            <Flame class="icon-md" />
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ kpis.temperature.quente }}</span>
            <span class="kpi-title">Leads Quentes</span>
          </div>
        </div>

        <div class="kpi-card card-warm">
          <div class="card-glow orange-glow"></div>
          <div class="kpi-icon-wrapper orange">
            <ThermometerSun class="icon-md" />
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ kpis.temperature.morno }}</span>
            <span class="kpi-title">Leads Mornos</span>
          </div>
        </div>

        <div class="kpi-card card-cold">
          <div class="card-glow teal-glow"></div>
          <div class="kpi-icon-wrapper blue-light">
            <Snowflake class="icon-md" />
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ kpis.temperature.frio }}</span>
            <span class="kpi-title">Leads Frios</span>
          </div>
        </div>
      </div>

      <!-- Charts Area -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title"><BarChart2 class="icon-sm text-primary" /> Leads por Mídia de Origem</h3>
              <p class="chart-subtitle">Distribuição dos canais de aquisição de leads</p>
            </div>
          </div>
          <div class="chart-body">
            <div class="pie-chart-wrapper">
              <Pie :data="leadsBySourceData" :options="chartOptions" />
            </div>
          </div>
        </div>

        <div class="chart-card intention-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Intenções de Negócio</h3>
              <p class="chart-subtitle">Resumo de demandas ativas</p>
            </div>
          </div>
          <div class="chart-body intention-body">
            <div class="intention-stat primary">
              <div class="stat-number">{{ kpis.pretensao_venda }}</div>
              <div class="stat-label">Buscando <strong>Venda</strong></div>
            </div>
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
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255,255,255,0.8);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    
    &.blue-glow { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    &.red-glow { background: linear-gradient(90deg, #ef4444, #f87171); }
    &.orange-glow { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    &.teal-glow { background: linear-gradient(90deg, #0d9488, #2dd4bf); }
  }

  .kpi-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
    flex-shrink: 0;

    &.blue { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #2563eb; }
    &.red { background: linear-gradient(135deg, #fef2f2, #fee2e2); color: #dc2626; }
    &.orange { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #d97706; }
    &.blue-light { background: linear-gradient(135deg, #f0fdfa, #ccfbf1); color: #0f766e; }
  }

  .kpi-content {
    display: flex;
    flex-direction: column;

    .kpi-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-top: 0.25rem;
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #111827;
      line-height: 1;
      letter-spacing: -0.02em;
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
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .chart-header {
    padding: 1.5rem 1.75rem;
    border-bottom: 1px solid #f3f4f6;
    background: rgba(249, 250, 251, 0.5);

    .chart-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.25rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .chart-subtitle {
      font-size: 0.85rem;
      color: #6b7280;
      margin: 0;
    }
    
    .text-primary { color: #3b82f6; }
  }

  .chart-body {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 350px;
  }
}

.pie-chart-wrapper {
  position: relative;
  height: 280px;
  width: 100%;
}

.intention-body {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  padding: 2.5rem !important;

  .intention-stat {
    text-align: center;
    
    &.primary .stat-number { color: #2563eb; }
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .stat-label {
      font-size: 0.95rem;
      color: #6b7280;
      strong { color: #1f2937; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
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

/* Skeleton Loader */
.skeleton-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  .skeleton-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
  
  .skeleton-kpi-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    animation: pulse-skeleton 1.5s infinite;
    
    .skeleton-kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #e5e7eb;
    }
    
    .skeleton-kpi-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
      
      .skeleton-line {
        background: #e5e7eb;
        border-radius: 4px;
        &.title { width: 80%; height: 12px; }
        &.value { width: 50%; height: 28px; }
      }
    }
  }
  
  .skeleton-charts-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    
    .skeleton-chart-card {
      background: white;
      border-radius: 12px;
      height: 350px;
      animation: pulse-skeleton 1.5s infinite;
    }
  }
}

@keyframes pulse-skeleton {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
