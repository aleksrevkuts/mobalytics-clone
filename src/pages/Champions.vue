<template>
  <div class="container py-5 text-white">
    <h2 class="display-4 fw-bold text-center mb-5">Champions</h2>
    <div class="row justify-content-center mb-5">
      <div class="col-md-6 position-relative">
        <input v-model="search" type="text" placeholder="Champions's name" class="form-control bg-dark-blue text-white border-0 shadow-sm ps-5" />
        <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
      </div>
    </div>
    <div class="row g-4">
      <div v-for="champion in filteredChampions" :key="champion.id" class="col-xl-2 col-lg-3 col-md-4 col-sm-6" @click="$router.push(`/champions/${champion.id}`)">
        <div class="card bg-dark-blue text-center shadow-lg h-100 champ-card">
          <img :src="champion.image" class="card-img-top rounded-top" alt="Champion" />
          <div class="card-body">
            <p class="card-text fw-semibold">{{ champion.name }}</p>
            <p class="card-text text-muted">{{ champion.role }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const search = ref('');
const champions = ref([]);

onMounted(async () => {
  const response = await fetch('https://ddragon.leagueoflegends.com/cdn/15.6.1/data/en_US/champion.json');
  const data = await response.json();
  champions.value = Object.values(data.data).map(champ => ({
    id: champ.id.toLowerCase(),
    name: champ.name,
    role: champ.tags[0],
    image: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`,
  }));
});

const filteredChampions = computed(() => {
  return champions.value.filter(champ => champ.name.toLowerCase().includes(search.value.toLowerCase()));
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #141720;
}

h2 {
  color: #FFFFFF;
  font-family: 'Poppins', sans-serif;
}

.form-control {
  background-color: #2D354B;
  color: #A5B3CC;
  padding: 12px 20px;
  border-radius: 25px;
}

.form-control::placeholder {
  color: #A5B3CC;
}

.champ-card {
  background-color: #2D354B;
  border: none;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.champ-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 196, 255, 0.2);
}

.card-img-top {
  object-fit: cover;
  height: 200px;
}

.card-text {
  color: #FFFFFF;
}

.text-muted {
  color: #A5B3CC !important;
}

@media (max-width: 1200px) {
  .col-xl-2 {
    flex: 0 0 auto;
    width: 20%;
  }
}

@media (max-width: 992px) {
  .col-lg-3 {
    flex: 0 0 auto;
    width: 25%;
  }
}

@media (max-width: 768px) {
  .col-md-4 {
    flex: 0 0 auto;
    width: 33.3333%;
  }
}

@media (max-width: 576px) {
  .col-sm-6 {
    flex: 0 0 auto;
    width: 50%;
  }
}
</style>
