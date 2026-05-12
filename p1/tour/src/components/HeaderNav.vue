<template>
  <header class="header">
    <div class="header-container">
      <div class="logo" @click="$router.push('/')">
        <el-icon :size="32" color="#667eea"><Location /></el-icon>
        <span class="logo-text">悠游旅行</span>
      </div>
      
      <nav class="nav-menu" :class="{ show: menuVisible }">
        <router-link to="/" class="nav-item" @click="closeMenu">首页</router-link>
        <router-link to="/routes" class="nav-item" @click="closeMenu">旅游线路</router-link>
        <router-link to="/hotels" class="nav-item" @click="closeMenu">酒店住宿</router-link>
        <router-link to="/tickets" class="nav-item" @click="closeMenu">景点门票</router-link>
        <router-link to="/guides" class="nav-item" @click="closeMenu">攻略资讯</router-link>
      </nav>
      
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索目的地/线路"
          class="search-input"
          :suffix-icon="Search"
          size="default"
          @keyup.enter="handleSearch"
        />
        
        <router-link to="/cart" class="cart-link">
          <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0">
            <el-icon :size="22"><ShoppingCart /></el-icon>
          </el-badge>
        </router-link>
        
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleUserCommand">
            <span class="user-name">
              <el-avatar :size="32" class="user-avatar">
                {{ userStore.user?.username?.charAt(0) || 'U' }}
              </el-avatar>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="login-btn">登录</router-link>
          <router-link to="/register" class="register-btn">注册</router-link>
        </template>
        
        <div class="mobile-menu-btn" @click="toggleMenu">
          <el-icon :size="24"><Menu /></el-icon>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { Location, Search, ShoppingCart, Menu } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const searchKeyword = ref('')
const menuVisible = ref(false)

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/routes?keyword=${encodeURIComponent(searchKeyword.value)}`)
    searchKeyword.value = ''
  }
}

const handleUserCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'orders') {
    router.push('/profile?tab=orders')
  } else if (command === 'logout') {
    userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/')
  }
}

const toggleMenu = () => {
  menuVisible.value = !menuVisible.value
}

const closeMenu = () => {
  menuVisible.value = false
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  gap: 40px;
}

.nav-item {
  font-size: 15px;
  color: #333;
  text-decoration: none;
  position: relative;
  padding: 5px 0;
  transition: color 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #667eea;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.nav-item:hover::after,
.nav-item.router-link-active::after {
  width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 200px;
}

.cart-link {
  color: #666;
  transition: color 0.3s;
}

.cart-link:hover {
  color: #667eea;
}

.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-btn,
.register-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s;
}

.login-btn {
  color: #667eea;
  border: 1px solid #667eea;
}

.login-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.register-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.mobile-menu-btn {
  display: none;
  cursor: pointer;
  color: #666;
}

@media (max-width: 1024px) {
  .nav-menu {
    gap: 25px;
  }
  
  .search-input {
    width: 150px;
  }
}

@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 20px;
    gap: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
  }
  
  .nav-menu.show {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-item {
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .nav-item::after {
    display: none;
  }
  
  .search-input {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .header-right {
    gap: 15px;
  }
  
  .login-btn,
  .register-btn {
    padding: 6px 15px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 15px;
  }
  
  .logo-text {
    font-size: 18px;
  }
}
</style>