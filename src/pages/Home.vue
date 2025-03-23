<template>
  <div class="container py-5 text-white">
    <!-- Player Search -->
    <div class="row justify-content-center mb-5">
      <div class="col-md-4 position-relative">
        <input
          v-model="gameName"
          type="text"
          placeholder="Enter Game Name (e.g., Nizel)..."
          class="form-control bg-dark-blue text-black border-0 shadow-sm ps-5"
        />
        <i class="bi bi-person position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
      </div>
      <div class="col-md-3 position-relative">
        <input
          v-model="tagLine"
          type="text"
          placeholder="Enter Tag Line (e.g., 7387)..."
          class="form-control bg-dark-blue text-black border-0 shadow-sm ps-5"
        />
        <i class="bi bi-hash position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
      </div>
      <div class="col-md-3">
        <select v-model="selectedRegion" class="form-select bg-dark-blue text-white border-0 shadow-sm">
          <option value="" disabled>Select a region</option>
          <option v-for="region in regions" :key="region.tag" :value="region.tag">
            {{ region.label }}
          </option>
        </select>
      </div>
      <div class="col-md-2">
        <button @click="searchSummoner" class="button btn w-100">Search</button>
      </div>
    </div>

    <!-- Display Player Statistics -->
    <div v-if="summonerStats" class="mb-5">
      <h3 class="h4 fw-bold mb-4 text-center text-primary">Statistics: {{ summonerStats.name }}</h3>
      <p>Region: {{ summonerStats.region }}</p>
      <div class="card bg-dark-blue text-center shadow-lg p-4 rounded mb-4">
        <div class="row">
          <div class="col-md-4">
            <p><strong>Level:</strong> {{ summonerStats.level }}</p>
            <p><strong>Rank:</strong> {{ summonerStats.rank || 'No data' }}</p>
            <p><strong>Win Rate:</strong> {{ summonerStats.winRate || 'No data' }}%</p>
            <p><strong>Average KDA:</strong> {{ summonerStats.averageKda.kills }}/{{ summonerStats.averageKda.deaths }}/{{ summonerStats.averageKda.assists }}</p>
          </div>
          <div class="col-md-8">
            <h5 class="mb-3">Favorite Champions:</h5>
            <div v-if="summonerStats.favoriteChampions && summonerStats.favoriteChampions.length" class="d-flex justify-content-center flex-wrap">
              <div v-for="champ in summonerStats.favoriteChampions" :key="champ.id" class="text-center mx-2">
                <img
                  :src="champ.image"
                  alt="Champion"
                  class="rounded-circle"
                  style="width: 50px; height: 50px;"
                />
                <p class="mt-1">{{ champ.points }} points</p>
              </div>
            </div>
            <p v-else class="text-muted">Failed to load champion data.</p>
          </div>
        </div>
      </div>

      <!-- Recent Matches -->
      <div class="card bg-dark-blue shadow-lg p-4 rounded">
        <h5 class="mb-3 text-center">Recent Matches:</h5>
        <div v-if="summonerStats.recentMatches && summonerStats.recentMatches.length">
          <div v-for="(match, index) in paginatedMatches" :key="index" class="row align-items-center mb-3 p-2 rounded" :class="match.win ? 'bg-success bg-opacity-25' : 'bg-danger bg-opacity-25'">
            <div class="col-md-2">
              <img
                :src="match.championImage"
                alt="Champion"
                class="rounded-circle"
                style="width: 40px; height: 40px;"
              />
            </div>
            <div class="col-md-3">
              <p class="mb-0"><strong>Champion:</strong> {{ match.champion }}</p>
            </div>
            <div class="col-md-3">
              <p class="mb-0"><strong>Result:</strong> {{ match.win ? 'Win' : 'Loss' }}</p>
            </div>
            <div class="col-md-4">
              <p class="mb-0"><strong>KDA:</strong> {{ match.kda }}</p>
            </div>
          </div>
          <div class="text-center mt-4" v-if="hasMoreMatches">
            <button @click="loadMoreMatches" class="btn btn-primary">Load More</button>
          </div>
        </div>
        <p v-else class="text-muted text-center">No recent matches found.</p>
      </div>
    </div>

    <!-- Error or Debug -->
    <div v-if="summonerError" class="text-center text-danger mb-5">
      <p>{{ summonerError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { regions, searchSummoner as searchSummonerService } from '@/services/riotApiService';

const gameName = ref(null);
const tagLine = ref(null);
const selectedRegion = ref('EUW');
const summonerStats = ref(null);
const summonerError = ref(null);
const debugInfo = ref(null);
const matchesPerPage = 10;
const currentPage = ref(1);

const searchSummoner = async () => {
  summonerStats.value = null;
  summonerError.value = null;
  debugInfo.value = null;
  currentPage.value = 1; // Reset pagination on new search

  if (!gameName.value || !tagLine.value || !selectedRegion.value) {
    summonerError.value = 'Please fill in all required fields';
    return;
  }

  try {
    const { summonerStats: stats, debugInfo: info } = await searchSummonerService(gameName.value, tagLine.value, selectedRegion.value);
    summonerStats.value = stats;
    debugInfo.value = info;
  } catch (error) {
    summonerError.value = error.message;
  }
};

// Computed property to get paginated matches
const paginatedMatches = computed(() => {
  if (!summonerStats.value || !summonerStats.value.recentMatches) return [];
  const start = (currentPage.value - 1) * matchesPerPage;
  const end = start + matchesPerPage;
  return summonerStats.value.recentMatches.slice(0, end);
});

// Computed property to check if there are more matches to load
const hasMoreMatches = computed(() => {
  if (!summonerStats.value || !summonerStats.value.recentMatches) return false;
  return currentPage.value * matchesPerPage < summonerStats.value.recentMatches.length;
});

// Function to load more matches
const loadMoreMatches = () => {
  currentPage.value++;
};
</script>

<style scoped>
.container {
  background-color: #140e30;
  color: #c7c5d6;
}

.card {
  background-color: #2D354B;
  border: none;
  color: #ffffff;
}

.card p, .card h5 {
  color: #ffffff;
}

.button {
  background-color: #251e47;
  color: #c7c5d6;
}

.button:hover {
  background-color: #271c37;
}

.form-control, .form-select {
  background-color: #ffffff !important;
  color: #443b6b !important;
}

.form-control::placeholder, .form-select option {
  color: #443b6b !important;
}

.bg-success.bg-opacity-25 {
  background-color: rgba(40, 167, 69, 0.25);
}

.bg-danger.bg-opacity-25 {
  background-color: rgba(220, 53, 69, 0.25);
}
</style>
