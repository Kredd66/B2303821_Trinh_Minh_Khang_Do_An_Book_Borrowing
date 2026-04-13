<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavbar />
    <main class="max-w-7xl mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from './components/common/AppNavbar.vue'
</script>