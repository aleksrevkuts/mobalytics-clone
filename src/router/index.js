import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import TierList from '../pages/TierList.vue';
import Champions from '../pages/Champions.vue';
import ChampionBuilds from '../pages/ChampionBuilds.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/tierlist', component: TierList },
  { path: '/champions', component: Champions },
  { path: '/champions/:id', name: 'ChampionBuilds', component: ChampionBuilds, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
