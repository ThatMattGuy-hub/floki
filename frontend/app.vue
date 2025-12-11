<template>
  <div class="min-h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
@import './assets/css/main.css';

body {
  font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 0;
}

.dark body {
  background-color: #111827;
  color: #f9fafb;
}
</style>
