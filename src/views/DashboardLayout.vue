<script setup>
import Sidebar from '../components/layout/Sidebar.vue'
import Topbar from '../components/layout/Topbar.vue'
</script>

<template>
  <div class="layout-wrapper">
    <Sidebar />
    <div class="main-content">
      <Topbar />
      <main class="page-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-color);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Ensures content doesn't overflow flex container */
}

.page-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
