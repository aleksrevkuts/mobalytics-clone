<template>
  <div class="app-container">
    <Sidebar />
    <div class="main-content">
      <header class="navbar navbar-expand-lg navbar-dark fixed-top">
        <div class="container-fluid px-4">
          <a class="navbar-brand fw-bold fs-3 text-white" href="/">LoL Analytics</a>
        </div>
      </header>
      <main class="content mt-5 pt-5">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/pages/Sidebar.vue";
</script>

<style scoped>
.app-container {
  display: flex;
  background-color: #140e30;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #c7c5d6;
}

.main-content {
  flex-grow: 1;
  margin-left: 80px;
  transition: margin-left 0.3s;
}

.navbar {
  background-color: #251e47;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.content {
  padding-bottom: 40px;
  padding-top: 70px;
}
</style>
