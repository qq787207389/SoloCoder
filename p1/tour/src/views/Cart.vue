<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">我的购物车</h1>
      
      <div v-if="cartStore.items.length > 0" class="cart-content">
        <div class="cart-main">
          <div class="cart-header">
            <el-checkbox v-model="allSelected" @change="toggleSelectAll" />
            <span class="header-title">商品信息</span>
            <span class="header-price">单价</span>
            <span class="header-quantity">数量</span>
            <span class="header-total">小计</span>
            <span class="header-action">操作</span>
          </div>
          
          <div class="cart-list">
            <div
              v-for="item in cartStore.items"
              :key="`${item.id}-${item.type}`"
              class="cart-item"
            >
              <el-checkbox v-model="item.selected" />
              <div class="item-image" @click="goToDetail(item)">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="item-info" @click="goToDetail(item)">
                <h3 class="item-name">{{ item.name }}</h3>
                <el-tag size="small" type="info" class="item-type">
                  {{ getTypeLabel(item.type) }}
                </el-tag>
              </div>
              <div class="item-price">¥{{ item.price }}</div>
              <div class="item-quantity">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="10"
                  @change="updateQuantity(item)"
                />
              </div>
              <div class="item-total">¥{{ item.price * item.quantity }}</div>
              <div class="item-action">
                <el-button type="danger" link @click="removeItem(item)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="cart-sidebar">
          <div class="cart-summary">
            <h3 class="summary-title">订单摘要</h3>
            <div class="summary-row">
              <span>商品数量</span>
              <span>{{ cartStore.totalCount }} 件</span>
            </div>
            <div class="summary-row">
              <span>商品总价</span>
              <span>¥{{ cartStore.totalPrice }}</span>
            </div>
            <div class="summary-row discount">
              <span>优惠</span>
              <span>-¥0</span>
            </div>
            <div class="summary-total">
              <span>应付金额</span>
              <span class="total-price">¥{{ cartStore.totalPrice }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              class="checkout-btn"
              @click="goToCheckout"
            >
              去结算 ({{ cartStore.totalCount }})
            </el-button>
          </div>
        </div>
      </div>
      
      <div v-else class="cart-empty">
        <el-empty description="购物车空空如也">
          <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()

const allSelected = computed({
  get: () => cartStore.items.every(item => item.selected),
  set: (value) => {
    cartStore.items.forEach(item => {
      item.selected = value
    })
  }
})

const getTypeLabel = (type) => {
  const labels = {
    route: '旅游线路',
    hotel: '酒店住宿',
    ticket: '景点门票'
  }
  return labels[type] || '其他'
}

const goToDetail = (item) => {
  const routes = {
    route: `/routes/${item.id}`,
    hotel: `/hotels/${item.id}`,
    ticket: '/tickets'
  }
  router.push(routes[item.type] || '/')
}

const updateQuantity = (item) => {
  cartStore.updateQuantity(item.id, item.type, item.quantity)
}

const removeItem = (item) => {
  cartStore.removeFromCart(item.id, item.type)
  ElMessage.success('已删除')
}

const toggleSelectAll = (value) => {
  allSelected.value = value
}

const goToCheckout = () => {
  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }
  router.push('/checkout')
}
</script>

<style scoped>
.cart-page {
  background: #f5f7fa;
  min-height: calc(100vh - 70px - 400px);
  padding: 40px 0;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 30px 0;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
}

.cart-main {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.cart-header {
  display: grid;
  grid-template-columns: 50px 100px 1fr 120px 120px 120px 80px;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  font-size: 14px;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}

.header-title {
  padding-left: 20px;
}

.cart-list {
  display: flex;
  flex-direction: column;
}

.cart-item {
  display: grid;
  grid-template-columns: 50px 100px 1fr 120px 120px 120px 80px;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.3s;
}

.cart-item:hover {
  background: #f9fafb;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  padding-left: 20px;
  cursor: pointer;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-type {
  margin-top: 4px;
}

.item-price {
  color: #666;
  font-size: 15px;
}

.item-quantity {
  display: flex;
  justify-content: center;
}

.item-total {
  font-size: 16px;
  font-weight: 600;
  color: #e74c3c;
}

.item-action {
  text-align: center;
}

.cart-sidebar {
  position: sticky;
  top: 100px;
  align-self: start;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.summary-row.discount {
  color: #e74c3c;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: #e74c3c;
}

.checkout-btn {
  width: 100%;
  margin-top: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
}

.cart-empty {
  background: white;
  border-radius: 12px;
  padding: 80px 40px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-sidebar {
    position: static;
  }
  
  .cart-header,
  .cart-item {
    grid-template-columns: 50px 80px 1fr 100px 100px 100px 70px;
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding: 20px 0;
  }
  
  .page-title {
    font-size: 22px;
    margin-bottom: 20px;
  }
  
  .cart-header {
    display: none;
  }
  
  .cart-item {
    display: grid;
    grid-template-columns: 30px 80px 1fr;
    grid-template-rows: auto auto auto;
    gap: 12px;
    padding: 16px;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
    grid-column: 2;
    grid-row: 1;
  }
  
  .item-info {
    grid-column: 3;
    grid-row: 1;
    padding-left: 12px;
  }
  
  .item-price {
    display: none;
  }
  
  .item-quantity {
    grid-column: 2 / 4;
    grid-row: 2;
    justify-content: flex-start;
  }
  
  .item-total {
    grid-column: 2 / 4;
    grid-row: 3;
    text-align: left;
  }
  
  .item-action {
    grid-column: 3;
    grid-row: 1;
    text-align: right;
  }
  
  .cart-summary {
    padding: 20px;
  }
}
</style>