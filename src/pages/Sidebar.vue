<template>
  <aside class="sidebar" :class="{ expanded: sidebarExpanded }" @mouseover="expandSidebar" @mouseleave="collapseSidebar">
    <div class="logo-container">
    </div>
    <ul class="menu mt-5">
      <li>
        <router-link to="/" class="nav-link">
          <i class="fas fa-home"></i>
          <span v-if="sidebarExpanded">Home</span>
        </router-link>
      </li>
      <li>
        <router-link to="/tierlist" class="nav-link">
          <i class="fas fa-list"></i>
          <span v-if="sidebarExpanded">Tier List</span>
        </router-link>
      </li>
      <li>
        <router-link to="/champions" class="nav-link">
          <i class="fas fa-chess-knight"></i>
          <span v-if="sidebarExpanded">Champions</span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref } from 'vue';

const sidebarExpanded = ref(false);

const expandSidebar = () => {
  sidebarExpanded.value = true;
};

const collapseSidebar = () => {
  sidebarExpanded.value = false;
};
</script>

<style scoped>
.sidebar {
  width: 80px;
  background-color: #140e30;
  transition: width 0.3s ease;
  overflow: hidden;
  padding-top: 20px;
  position: fixed;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar.expanded {
  width: 220px;
}

.logo-container {
  margin-bottom: 20px;
  text-align: center;
}

.logo {
  width: 120px;
}

.icon {
  width: 50px;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.menu li {
  width: 100%;
}

.nav-link {
  display: flex;
  align-items: center;
  color: white;
  padding: 15px;
  text-decoration: none;
  transition: background 0.3s, padding-left 0.3s;
  font-size: 18px;
}

.nav-link i {
  font-size: 22px;
  margin-right: 15px;
  min-width: 40px;
  text-align: center;
}

.nav-link span {
  margin-top: 4px;
}

.nav-link:hover {
  background: #271c37;
  color: #c7c5d6;
}
</style>
