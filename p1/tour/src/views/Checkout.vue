<template>
  <div class="checkout-page">
    <div class="container">
      <h1 class="page-title">确认订单</h1>
      
      <div class="checkout-content">
        <div class="checkout-main">
          <div class="order-section">
            <h2 class="section-title">
              <el-icon><Location /></el-icon>
              出行人信息
            </h2>
            <el-form :model="travelerInfo" label-width="100px" class="info-form">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="姓名">
                    <el-input v-model="travelerInfo.name" placeholder="请输入姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号">
                    <el-input v-model="travelerInfo.phone" placeholder="请输入手机号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="身份证号">
                    <el-input v-model="travelerInfo.idCard" placeholder="请输入身份证号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮箱">
                    <el-input v-model="travelerInfo.email" placeholder="请输入邮箱" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          
          <div class="order-section">
            <h2 class="section-title">
              <el-icon><Present /></el-icon>
              选择优惠券
            </h2>
            <div class="coupon-list">
              <div
                v-for="(coupon, index) in coupons"
                :key="index"
                class="coupon-item"
                :class="{ selected: selectedCoupon === index }"
                @click="selectedCoupon = index"
              >
                <div class="coupon-left">
                  <span class="coupon-value">¥{{ coupon.value }}</span>
                  <span class="coupon-condition">满{{ coupon.condition }}可用</span>
                </div>
                <div class="coupon-right">
                  <h4>{{ coupon.name }}</h4>
                  <p>{{ coupon.desc }}</p>
                  <span class="expire-date">有效期至：{{ coupon.expire }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="order-section">
            <h2 class="section-title">
              <el-icon><Document /></el-icon>
              订单商品
            </h2>
            <div class="order-items">
              <div v-for="item in cartStore.items" :key="`${item.id}-${item.type}`" class="order-item">
                <div class="item-image">
                  <img :src="item.image" :alt="item.name" />
                </div>
                <div class="item-info">
                  <h3 class="item-name">{{ item.name }}</h3>
                  <el-tag size="small" type="info">{{ getTypeLabel(item.type) }}</el-tag>
                </div>
                <div class="item-price">¥{{ item.price }}</div>
                <div class="item-quantity">×{{ item.quantity }}</div>
                <div class="item-total">¥{{ item.price * item.quantity }}</div>
              </div>
            </div>
          </div>
          
          <div class="order-section">
            <h2 class="section-title">
              <el-icon><Edit /></el-icon>
              订单备注
            </h2>
            <el-input
              v-model="remark"
              type="textarea"
              :rows="3"
              placeholder="请输入您的特殊需求（选填）"
            />
          </div>
        </div>
        
        <div class="checkout-sidebar">
          <div class="order-summary">
            <h3 class="summary-title">订单摘要</h3>
            <div class="summary-row">
              <span>商品总价</span>
              <span>¥{{ cartStore.totalPrice }}</span>
            </div>
            <div class="summary-row" v-if="selectedCoupon !== -1">
              <span>优惠券</span>
              <span class="discount">-¥{{ coupons[selectedCoupon].value }}</span>
            </div>
            <div class="summary-row">
              <span>服务费</span>
              <span>¥0</span>
            </div>
            <div class="summary-total">
              <span>应付金额</span>
              <span class="total-price">¥{{ finalPrice }}</span>
            </div>
            
            <el-checkbox v-model="agreed" class="agree-check">
              我已阅读并同意<a href="#">《服务条款》</a>和<a href="#">《隐私政策》</a>
            </el-checkbox>
            
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :disabled="!agreed"
              @click="submitOrder"
            >
              提交订单
            </el-button>
            
            <p class="payment-note">
              <el-icon><Warning /></el-icon>
              提交订单后请在30分钟内完成支付
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Location,
  Present,
  Document,
  Edit,
  Warning
} from '@element-plus/icons-vue'

const router = useRouter()
const cartStore = useCartStore()

const travelerInfo = reactive({
  name: '',
  phone: '',
  idCard: '',
  email: ''
})

const coupons = [
  { name: '新人专享券', desc: '适用于所有产品', value: 50, condition: 500, expire: '2024-12-31' },
  { name: '线路专享券', desc: '适用于旅游线路产品', value: 100, condition: 1000, expire: '2024-12-31' }
]

const selectedCoupon = ref(-1)
const remark = ref('')
const agreed = ref(false)

const finalPrice = computed(() => {
  let total = cartStore.totalPrice
  if (selectedCoupon.value !== -1) {
    total -= coupons[selectedCoupon.value].value
  }
  return Math.max(0, total)
})

const getTypeLabel = (type) => {
  const labels = {
    route: '旅游线路',
    hotel: '酒店住宿',
    ticket: '景点门票'
  }
  return labels[type] || '其他'
}

const submitOrder = async () => {
  if (!agreed.value) {
    ElMessage.warning('请先同意服务条款')
    return
  }
  
  if (!travelerInfo.name || !travelerInfo.phone) {
    ElMessage.warning('请填写出行人信息')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `订单金额：¥${finalPrice.value}，确认提交？`,
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    ElMessage.success('订单提交成功！')
    cartStore.clearCart()
    router.push('/profile')
  } catch {
  }
}
</script>

<style scoped>
.checkout-page {
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

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 30px;
}

.order-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-form {
  margin-top: 10px;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coupon-item {
  display: flex;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.coupon-item:hover {
  border-color: #667eea;
}

.coupon-item.selected {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.coupon-left {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  min-width: 100px;
}

.coupon-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.coupon-condition {
  font-size: 12px;
  opacity: 0.9;
}

.coupon-right {
  padding: 16px 20px;
  flex: 1;
  background: white;
}

.coupon-right h4 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.coupon-right p {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #666;
}

.expire-date {
  font-size: 12px;
  color: #999;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  padding-left: 16px;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
}

.item-price {
  width: 100px;
  text-align: center;
  color: #666;
}

.item-quantity {
  width: 60px;
  text-align: center;
  color: #666;
}

.item-total {
  width: 100px;
  text-align: right;
  font-size: 16px;
  font-weight: 600;
  color: #e74c3c;
}

.checkout-sidebar {
  position: sticky;
  top: 100px;
  align-self: start;
}

.order-summary {
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

.summary-row .discount {
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
  font-size: 28px;
  font-weight: 700;
  color: #e74c3c;
}

.agree-check {
  width: 100%;
  margin: 20px 0;
  font-size: 13px;
}

.agree-check a {
  color: #667eea;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.payment-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
  margin: 0;
  justify-content: center;
}

@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  
  .checkout-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 20px 0;
  }
  
  .page-title {
    font-size: 22px;
    margin-bottom: 20px;
  }
  
  .order-section {
    padding: 16px;
  }
  
  .order-item {
    flex-wrap: wrap;
    padding: 12px;
  }
  
  .item-info {
    width: calc(100% - 96px);
  }
  
  .item-price,
  .item-quantity,
  .item-total {
    margin-top: 12px;
    width: auto;
  }
  
  .item-quantity {
    flex: 1;
  }
  
  .order-summary {
    padding: 20px;
  }
}
</style>