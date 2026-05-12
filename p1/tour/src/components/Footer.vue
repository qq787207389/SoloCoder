<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <div class="footer-logo">
          <el-icon :size="36" color="#667eea"><Location /></el-icon>
          <span class="logo-text">悠游旅行</span>
        </div>
        <p class="footer-desc">
          悠游旅行致力于为您提供优质的旅游服务，涵盖旅游线路、酒店预订、景点门票等全方位旅游解决方案。
        </p>
        <div class="footer-contact">
          <div class="contact-item">
            <el-icon><Phone /></el-icon>
            <span>400-888-8888</span>
          </div>
          <div class="contact-item">
            <el-icon><Message /></el-icon>
            <span>service@youyou.com</span>
          </div>
        </div>
      </div>
      
      <div class="footer-section">
        <h4 class="footer-title">产品服务</h4>
        <ul class="footer-links">
          <li><a href="#">旅游线路</a></li>
          <li><a href="#">酒店预订</a></li>
          <li><a href="#">景点门票</a></li>
          <li><a href="#">签证服务</a></li>
          <li><a href="#">企业定制</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4 class="footer-title">关于我们</h4>
        <ul class="footer-links">
          <li><a href="#">公司简介</a></li>
          <li><a href="#">加入我们</a></li>
          <li><a href="#">合作伙伴</a></li>
          <li><a href="#">新闻动态</a></li>
          <li><a href="#">联系我们</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4 class="footer-title">帮助中心</h4>
        <ul class="footer-links">
          <li><a href="#">常见问题</a></li>
          <li><a href="#">预订须知</a></li>
          <li><a href="#">退改政策</a></li>
          <li><a href="#">隐私政策</a></li>
          <li><a href="#">用户协议</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4 class="footer-title">关注我们</h4>
        <div class="qrcode">
          <div class="qrcode-img">
            <el-icon :size="80" color="#999"><Picture /></el-icon>
          </div>
          <p>扫码关注公众号</p>
        </div>
        <div class="social-links">
          <a href="#" class="social-link">
            <el-icon :size="24"><ChatDotRound /></el-icon>
          </a>
          <a href="#" class="social-link">
            <el-icon :size="24"><Share /></el-icon>
          </a>
          <a href="#" class="social-link">
            <el-icon :size="24"><Camera /></el-icon>
          </a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="footer-bottom-container">
        <p>© 2024 悠游旅行 All Rights Reserved. 京ICP备12345678号-1</p>
        <div class="footer-bottom-links">
          <a href="#">网站地图</a>
          <a href="#">法律声明</a>
          <a href="#">隐私政策</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Location, Phone, Message, Picture, ChatDotRound, Share, Camera } from '@element-plus/icons-vue'
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #a0a0a0;
  padding-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.2fr;
  gap: 40px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.footer-logo .logo-text {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.footer-desc {
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.contact-item .el-icon {
  color: #667eea;
}

.footer-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #a0a0a0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #667eea;
}

.qrcode {
  text-align: center;
  margin-bottom: 20px;
}

.qrcode-img {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.qrcode p {
  font-size: 12px;
}

.social-links {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0a0a0;
  transition: all 0.3s;
}

.social-link:hover {
  background: #667eea;
  color: white;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 50px;
  padding: 25px 0;
}

.footer-bottom-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.footer-bottom p {
  font-size: 13px;
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  gap: 20px;
}

.footer-bottom-links a {
  color: #a0a0a0;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s;
}

.footer-bottom-links a:hover {
  color: #667eea;
}

@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .footer-section:first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  .footer-bottom-container {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer-container {
    grid-template-columns: 1fr;
  }
  
  .footer {
    padding-top: 40px;
  }
}
</style>