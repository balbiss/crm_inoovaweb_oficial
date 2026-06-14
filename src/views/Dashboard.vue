<script setup>
import { ref } from 'vue'

const metrics = ref([
  { title: 'Negócios Fechados', value: '12', trend: '+2', positive: true },
  { title: 'Novos Leads', value: '48', trend: '+12', positive: true },
  { title: 'Visitas Agendadas', value: '15', trend: '-3', positive: false },
  { title: 'Imóveis Captados', value: '5', trend: '+1', positive: true }
])
</script>

<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="subtitle">Visão geral do desempenho da sua imobiliária hoje.</p>
      </div>
      <div class="actions">
        <button class="btn-primary">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Novo Lead
        </button>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card" v-for="metric in metrics" :key="metric.title">
        <h3 class="title">{{ metric.title }}</h3>
        <div class="value-row">
          <span class="value">{{ metric.value }}</span>
          <span class="trend" :class="metric.positive ? 'positive' : 'negative'">
            {{ metric.trend }}
            <svg v-if="metric.positive" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <svg v-else fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <div class="dashboard-widgets">
      <div class="widget">
        <div class="widget-header">
          <h3>Próximas Visitas</h3>
          <a href="#">Ver todas</a>
        </div>
        <div class="widget-content">
          <p class="empty-state">O gráfico ou lista será implementado aqui.</p>
        </div>
      </div>
      <div class="widget">
        <div class="widget-header">
          <h3>Vendas por Mês</h3>
        </div>
        <div class="widget-content">
          <p class="empty-state">O gráfico de vendas será implementado aqui.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .subtitle {
    color: var(--text-muted);
    margin-top: 0.2rem;
  }

  .actions {
    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--primary-hover);
      }
    }
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  .title {
    font-size: 0.95rem;
    color: var(--text-muted);
    font-weight: 500;
    margin-bottom: 0.8rem;
  }

  .value-row {
    display: flex;
    align-items: baseline;
    gap: 1rem;

    .value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .trend {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;

      &.positive {
        background: #dcfce7;
        color: #166534;
      }

      &.negative {
        background: #fee2e2;
        color: #991b1b;
      }
    }
  }
}

.dashboard-widgets {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.widget {
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;

  .widget-header {
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-main);
    }

    a {
      font-size: 0.9rem;
      font-weight: 500;
    }
  }

  .widget-content {
    padding: 1.5rem;
    min-height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;

    .empty-state {
      color: var(--text-muted);
      font-style: italic;
    }
  }
}
</style>
