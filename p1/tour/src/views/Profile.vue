<template>
  <div class="profile-page">
    <div class="container">
      <div class="content-layout">
        <div class="sidebar">
          <div class="user-card">
            <el-avatar :size="80" class="user-avatar">
              {{ userStore.user?.username?.charAt(0) || 'U' }}
            </el-avatar>
            <h3 class="username">{{ userStore.user?.username }}</h3>
            <p class="user-desc">悠游旅行会员</p>
          </div>
          
          <el-menu
            :default-active="activeTab"
            class="profile-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="orders">
              <el-icon><Document /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="coupons">
              <el-icon><Wallet /></el-icon>
              <span>优惠券</span>
            </el-menu-item>
            <el-menu-item index="info">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="settings">
              <el-icon><Setting /></el-icon>
              <span>账号设置</span>
            </el-menu-item>
          </el-menu>
          
          <el-button type="danger" plain class="logout-btn" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>
        
        <div class="main-content">
          <div v-if="activeTab === 'orders'" class="orders-section">
            <h2 class="section-title">我的订单</h2>
            <div class="orders-list">
              <div v-for="order in orders" :key="order.id" class="order-card">
                <div class="order-header">
                  <span class="order-id">订单号：{{ order.id }}</span>
                  <el-tag type="success">{{ order.status }}</el-tag>
                </div>
                <div class="order-items">
                  <div v-for="item in order.items" :key="item.id" class="order-item">
                    <div class="item-info">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-date">日期：{{ item.date || item.checkIn }}</span>
                    </div>
                    <div class="item-price">
                      <span>¥{{ item.price }}</span>
                      <span>×{{ item.quantity }}</span>
                    </div>
                  </div>
                </div>
                <div class="order-footer">
                  <span class="order-time">下单时间：{{ order.createTime }}</span>
                  <span class="order-total">合计：<em>¥{{ order.totalPrice }}</em></span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'favorites'" class="favorites-section">
            <h2 class="section-title">我的收藏</h2>
            <el-empty description="暂无收藏内容" />
          </div>
          
          <div v-else-if="activeTab === 'coupons'" class="coupons-section">
            <h2 class="section-title">我的优惠券</h2>
            <div class="coupons-list">
              <div class="coupon-card">
                <div class="coupon-left">
                  <span class="coupon-value">¥50</span>
                  <span class="coupon-condition">满500可用</span>
                </div>
                <div class="coupon-right">
                  <h4>通用优惠券</h4>
                  <p>适用于所有产品</p>
                  <span class="expire-date">有效期至：2024-12-31</span>
                </div>
              </div>
              <div class="coupon-card">
                <div class="coupon-left">
                  <span class="coupon-value">¥100</span>
                  <span class="coupon-condition">满1000可用</span>
                </div>
                <div class="coupon-right">
                  <h4>线路专享券</h4>
                  <p>适用于旅游线路产品</p>
                  <span class="expire-date">有效期至：2024-12-31</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'info'" class="info-section">
            <h2 class="section-title">个人信息</h2>
            <el-form :model="userInfo" label-width="100px" class="info-form">
              <el-form-item label="用户名">
                <el-input v-model="userInfo.username" disabled />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="userInfo.phone" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="userInfo.email" />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="userInfo.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生日">
                <el-date-picker v-model="userInfo.birthday" type="date" style="width: 100%" />
              </el-form-item>
              <el-form-item label="个性签名">
                <el-input v-model="userInfo.signature" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveInfo">保存修改</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div v-else-if="activeTab === 'settings'" class="settings-section">
            <h2 class="section-title">账号设置</h2>
            <el-form label-width="100px" class="settings-form">
              <el-form-item label="修改密码">
                <el-button type="primary" plain>前往修改</el-button>
              </el-form-item>
              <el-form-item label="绑定手机">
                <span>已绑定：138****8888</span>
                <el-button type="primary" plain style="margin-left: 20px">更换绑定</el-button>
              </el-form-item>
              <el-form-item label="绑定邮箱">
                <span>已绑定：u***r@example.com</span>
                <el-button type="primary" plain style="margin-left: 20px">更换绑定</el-button>
              </el-form-item>
              <el-form-item label="消息通知">
                <el-switch v-model="notification.email" />
                <span style="margin-left: 10px">邮件通知</span>
                <el-switch v-model="notification.sms" style="margin-left: 30px" />
                <span style="margin-left: 10px">短信通知</span>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  Document,
  Star,
  Wallet,
  User,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { orders } from '@/data/mockData'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('orders')

const userInfo = reactive({
  username: userStore.user?.username || '',
  phone: '138****8888',
  email: 'user@example.com',
  gender: 'male',
  birthday: '',
  signature: '旅行是一种生活方式'
})

const notification = reactive({
  email: true,
  sms: false
})

const handleMenuSelect = (index) => {
  activeTab.value = index
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出登录成功')
  router.push('/')
}

const saveInfo = () => {
  ElMessage.success('保存成功')
}
</script>

<style scoped>
.profile-page {
  background: #f5f7fa;
  min-height: calc(100vh - 70px - 400px);
  padding: 40px 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 30px;
}

.sidebar {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  height: fit-content;
}

.user-card {
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 12px;
  font-size: 32px;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
}

.user-desc {
  color: #999;
  margin: 0;
  font-size: 13px;
}

.profile-menu {
  border: none;
}

.profile-menu .el-menu-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.logout-btn {
  width: 100%;
  margin-top: 20px;
}

.main-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.order-id {
  color: #666;
  font-size: 14px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-date {
  color: #999;
  font-size: 13px;
  margin-left: 16px;
}

.item-price {
  color: #666;
}

.item-price span:last-child {
  margin-left: 8px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.order-time {
  color: #999;
  font-size: 13px;
}

.order-total {
  font-size: 14px;
  color: #666;
}

.order-total em {
  font-style: normal;
  font-size: 20px;
  font-weight: 600;
  color: #e74c3c;
}

.coupons-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.coupon-card {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  overflow: hidden;
  color: white;
}

.coupon-left {
  padding: 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  min-width: 120px;
}

.coupon-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.coupon-condition {
  font-size: 12px;
  opacity: 0.9;
}

.coupon-right {
  padding: 20px;
  flex: 1;
}

.coupon-right h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.coupon-right p {
  margin: 0 0 8px 0;
  font-size: 13px;
  opacity: 0.9;
}

.expire-date {
  font-size: 12px;
  opacity: 0.8;
}

.info-form,
.settings-form {
  max-width: 500px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 20px 0;
  }
  
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: sticky;
    top: 80px;
    z-index: 10;
  }
  
  .coupons-list {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 20px;
  }
}
</style>