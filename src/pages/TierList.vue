<template>
  <div class="container py-5 text-white">
    <h2 class="display-4 fw-bold text-center mb-5">Tier List</h2>
    <div class="card bg-dark-blue shadow-lg">
      <iframe src="https://app.mobalytics.gg/lol/tier-list" class="w-100 h-iframe rounded"></iframe>
    </div>
  </div>
</template>

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

.h-iframe {
  height: 700px;
  border: none;
}
</style>
