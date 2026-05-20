<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', label: '地图', icon: '🗺️' },
  { path: '/timeline', label: '时间轴', icon: '📅' },
  { path: '/wishlist', label: '心愿单', icon: '✨' },
  { path: '/stats', label: '统计', icon: '📊' }
]

const isActive = (path: string) => route.path === path

const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <span class="brand-icon">🌍</span>
          <span class="brand-text">足迹地图</span>
        </div>
        
        <div class="nav-menu">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="['nav-link', { active: isActive(item.path) }]"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </router-link>
        </div>
        
        <button 
          class="mobile-menu-btn" 
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          {{ mobileMenuOpen ? '✕' : '☰' }}
        </button>
      </div>
      
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['mobile-nav-link', { active: isActive(item.path) }]"
          @click="mobileMenuOpen = false"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 18px;
  color: #111827;
}

.brand-icon {
  font-size: 24px;
}

.brand-text {
  display: none;
}

.nav-menu {
  display: flex;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-link.active {
  background: #eff6ff;
  color: #3b82f6;
}

.nav-icon {
  font-size: 16px;
}

.mobile-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
}

.mobile-menu {
  display: none;
  padding: 8px 24px 16px;
  border-top: 1px solid #f3f4f6;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #6b7280;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
}

.mobile-nav-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.mobile-nav-link.active {
  background: #eff6ff;
  color: #3b82f6;
}

.main-content {
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .brand-text {
    display: inline;
  }
}

@media (max-width: 640px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>
