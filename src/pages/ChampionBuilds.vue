<template>
  <div class="container py-5 text-white">
    <h2 class="display-4 fw-bold text-center mb-5">{{ championName }} - Build</h2>
    <div class="card bg-dark-blue shadow-lg p-4 rounded">
      <div :data-moba-widget="'lol-champion-build'" :data-moba-champion="championId"></div>
      <link rel="stylesheet" href="/styles/mobalytics-widgets.css">
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const championId = computed(() => {
  const id = route.params.id;
  return id ? id.replace(/\.png$/, '').toLowerCase() : null;
});

const championName = computed(() => {
  const id = route.params.id.replace(/\.png$/, '');
  return id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Unknown champion';
});

onMounted(() => {
  console.log('Component loaded', championId.value);

  const script = document.createElement('script');
  script.src = '/scripts/mobalytics-widgets.js';
  script.async = true;
  script.onload = () => {
    console.log('Script loaded');
  };
  script.onerror = () => {
    console.error('Error loading mobalytics-widgets.js');
  };
  document.body.appendChild(script);

});
</script>

<style scoped>
.container {
  background-color: #141720;
}

h2 {
  color: #FFFFFF;
  font-family: 'Poppins', sans-serif;
}

.card {
  background-color: #2D354B;
  border: none;
}
</style>
