export const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
    title: '探索世界的美好',
    subtitle: '发现令人惊叹的旅行目的地'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920',
    title: '海岛度假天堂',
    subtitle: '享受阳光沙滩与碧海蓝天'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920',
    title: '文化古迹之旅',
    subtitle: '感受千年历史的魅力'
  }
]

export const categories = [
  { id: 1, name: '热门景点', icon: 'Location', color: '#667eea' },
  { id: 2, name: '旅游线路', icon: 'Guide', color: '#764ba2' },
  { id: 3, name: '酒店住宿', icon: 'OfficeBuilding', color: '#f093fb' },
  { id: 4, name: '门票预订', icon: 'Ticket', color: '#f5576c' },
  { id: 5, name: '美食推荐', icon: 'KnifeFork', color: '#4facfe' },
  { id: 6, name: '攻略资讯', icon: 'Reading', color: '#00f2fe' },
  { id: 7, name: '当地体验', icon: 'Camera', color: '#43e97b' },
  { id: 8, name: '签证服务', icon: 'Postcard', color: '#fa709a' }
]

export const popularSpots = [
  {
    id: 1,
    name: '三亚亚龙湾',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
    location: '海南·三亚',
    rating: 4.9,
    price: 298
  },
  {
    id: 2,
    name: '丽江古城',
    image: 'https://images.unsplash.com/photo-1528181304800-259b11598af5?w=600',
    location: '云南·丽江',
    rating: 4.8,
    price: 80
  },
  {
    id: 3,
    name: '九寨沟',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
    location: '四川·阿坝',
    rating: 4.9,
    price: 169
  },
  {
    id: 4,
    name: '张家界',
    image: 'https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?w=600',
    location: '湖南·张家界',
    rating: 4.7,
    price: 225
  },
  {
    id: 5,
    name: '西湖',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600',
    location: '浙江·杭州',
    rating: 4.8,
    price: 0
  },
  {
    id: 6,
    name: '长城',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600',
    location: '北京',
    rating: 4.9,
    price: 45
  }
]

export const routes = [
  {
    id: 1,
    title: '云南深度游-昆明大理丽江6日',
    image: 'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=600',
    days: 6,
    price: 2999,
    originalPrice: 3599,
    rating: 4.9,
    sales: 2580,
    tags: ['网红打卡', '纯玩无购物'],
    destinations: ['昆明', '大理', '丽江'],
    highlights: ['玉龙雪山', '丽江古城', '洱海', '石林']
  },
  {
    id: 2,
    title: '海南三亚双飞5日游',
    image: 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=600',
    days: 5,
    price: 3299,
    originalPrice: 3899,
    rating: 4.8,
    sales: 1890,
    tags: ['海岛度假', '含机票'],
    destinations: ['三亚', '海口'],
    highlights: ['亚龙湾', '蜈支洲岛', '天涯海角', '南山寺']
  },
  {
    id: 3,
    title: '北京故宫长城5日游',
    image: 'https://images.unsplash.com/photo-1508804052814-cd5c7eb2d63e?w=600',
    days: 5,
    price: 1899,
    originalPrice: 2299,
    rating: 4.7,
    sales: 3200,
    tags: ['历史文化', '亲子游'],
    destinations: ['北京'],
    highlights: ['故宫', '长城', '颐和园', '天坛']
  },
  {
    id: 4,
    title: '成都九寨沟黄龙5日游',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
    days: 5,
    price: 2599,
    originalPrice: 2999,
    rating: 4.9,
    sales: 1650,
    tags: ['自然风光', '摄影圣地'],
    destinations: ['成都', '九寨沟', '黄龙'],
    highlights: ['九寨沟', '黄龙', '熊猫基地', '宽窄巷子']
  },
  {
    id: 5,
    title: '厦门鼓浪屿土楼4日游',
    image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600',
    days: 4,
    price: 1599,
    originalPrice: 1899,
    rating: 4.8,
    sales: 2100,
    tags: ['文艺清新', '美食之旅'],
    destinations: ['厦门', '漳州'],
    highlights: ['鼓浪屿', '土楼', '曾厝垵', '厦门大学']
  },
  {
    id: 6,
    title: '桂林阳朔漓江4日游',
    image: 'https://images.unsplash.com/photo-1531276836163-3ed090a4c58f?w=600',
    days: 4,
    price: 1699,
    originalPrice: 1999,
    rating: 4.8,
    sales: 1920,
    tags: ['山水甲天下', '游船体验'],
    destinations: ['桂林', '阳朔'],
    highlights: ['漓江', '阳朔西街', '象鼻山', '龙脊梯田']
  }
]

export const hotels = [
  {
    id: 1,
    name: '三亚亚特兰蒂斯酒店',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
    location: '三亚·海棠湾',
    stars: 5,
    rating: 4.9,
    price: 2588,
    tags: ['网红酒店', '水上乐园', '水族馆']
  },
  {
    id: 2,
    name: '丽江悦榕庄',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
    location: '丽江·束河古镇',
    stars: 5,
    rating: 4.8,
    price: 1899,
    tags: ['奢华度假', '纳西风情', '雪山景观']
  },
  {
    id: 3,
    name: '杭州西湖国宾馆',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
    location: '杭州·西湖',
    stars: 5,
    rating: 4.9,
    price: 1588,
    tags: ['园林酒店', '西湖景观', '国宾级']
  },
  {
    id: 4,
    name: '北京王府井希尔顿',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600',
    location: '北京·王府井',
    stars: 5,
    rating: 4.7,
    price: 1288,
    tags: ['市中心', '商务出行', '购物便利']
  },
  {
    id: 5,
    name: '成都香格里拉大酒店',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600',
    location: '成都·锦江',
    stars: 5,
    rating: 4.8,
    price: 988,
    tags: ['城市地标', '美食周边', '商务首选']
  },
  {
    id: 6,
    name: '厦门希尔顿逸林酒店',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',
    location: '厦门·五缘湾',
    stars: 5,
    rating: 4.7,
    price: 788,
    tags: ['海景房', '机场附近', '新开业']
  }
]

export const tickets = [
  {
    id: 1,
    name: '迪士尼乐园门票',
    image: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=600',
    location: '上海',
    price: 399,
    rating: 4.9,
    sales: 58600,
    tags: ['亲子必去', '网红打卡']
  },
  {
    id: 2,
    name: '故宫博物院门票',
    image: 'https://images.unsplash.com/photo-1584467541268-b040f43fbe33?w=600',
    location: '北京',
    price: 60,
    rating: 4.9,
    sales: 125000,
    tags: ['世界遗产', '历史文化']
  },
  {
    id: 3,
    name: '长隆野生动物世界',
    image: 'https://images.unsplash.com/photo-1534567153574-250c19934982?w=600',
    location: '广州',
    price: 250,
    rating: 4.8,
    sales: 42300,
    tags: ['亲子游', '动物主题']
  },
  {
    id: 4,
    name: '黄山风景区门票',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
    location: '安徽·黄山',
    price: 190,
    rating: 4.9,
    sales: 35600,
    tags: ['世界遗产', '自然风光']
  },
  {
    id: 5,
    name: '秦始皇兵马俑博物馆',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600',
    location: '西安',
    price: 120,
    rating: 4.8,
    sales: 68900,
    tags: ['世界奇迹', '历史文化']
  },
  {
    id: 6,
    name: '张家界国家森林公园',
    image: 'https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?w=600',
    location: '湖南·张家界',
    price: 225,
    rating: 4.9,
    sales: 41200,
    tags: ['世界遗产', '奇峰异石']
  }
]

export const guides = [
  {
    id: 1,
    title: '云南旅游全攻略：大理丽江香格里拉',
    image: 'https://images.unsplash.com/photo-1528181304800-259b11598af5?w=600',
    author: '旅行达人小王',
    date: '2024-01-15',
    views: 25800,
    likes: 1280,
    summary: '详细的云南旅游攻略，包含行程规划、美食推荐、住宿建议，让你的云南之旅完美无憾。'
  },
  {
    id: 2,
    title: '三亚5日游：海岛度假的正确打开方式',
    image: 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=600',
    author: '海岛控小美',
    date: '2024-01-12',
    views: 18900,
    likes: 956,
    summary: '三亚最全攻略，从亚龙湾到蜈支洲岛，从海鲜市场到免税店，一篇搞定！'
  },
  {
    id: 3,
    title: '北京3日精华游：故宫长城颐和园',
    image: 'https://images.unsplash.com/photo-1508804052814-cd5c7eb2d63e?w=600',
    author: '北京土著阿龙',
    date: '2024-01-10',
    views: 32500,
    likes: 1680,
    summary: '第一次来北京怎么玩？这份3日行程带你走遍北京必去景点，还有本地人私藏美食！'
  },
  {
    id: 4,
    title: '成都美食地图：从街边小吃到米其林',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600',
    author: '吃货小张',
    date: '2024-01-08',
    views: 45600,
    likes: 2350,
    summary: '成都美食全攻略：火锅、串串、担担面、龙抄手...让你在成都吃到扶墙走！'
  },
  {
    id: 5,
    title: '西藏旅行注意事项：高原反应应对指南',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600',
    author: '户外达人老李',
    date: '2024-01-05',
    views: 28900,
    likes: 1420,
    summary: '去西藏前必看！高反预防、装备准备、行程安排...这篇攻略让你的西藏之旅更安全顺畅。'
  },
  {
    id: 6,
    title: '日本东京5日自由行：潮流与传统的碰撞',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
    author: '日系达人小樱',
    date: '2024-01-03',
    views: 38700,
    likes: 1890,
    summary: '东京旅游攻略：浅草寺、涩谷、新宿、秋叶原...从传统文化到潮流购物一网打尽！'
  }
]

export const orders = [
  {
    id: 'ORD20240115001',
    createTime: '2024-01-15 14:30:00',
    status: '已完成',
    totalPrice: 2999,
    items: [
      {
        id: 1,
        type: 'route',
        name: '云南深度游-昆明大理丽江6日',
        price: 2999,
        quantity: 1,
        date: '2024-02-01'
      }
    ]
  },
  {
    id: 'ORD20240110002',
    createTime: '2024-01-10 09:15:00',
    status: '待出行',
    totalPrice: 5176,
    items: [
      {
        id: 1,
        type: 'hotel',
        name: '三亚亚特兰蒂斯酒店',
        price: 2588,
        quantity: 2,
        checkIn: '2024-02-10',
        checkOut: '2024-02-12'
      }
    ]
  }
]

export const getRouteDetail = (id) => {
  const route = routes.find(r => r.id === parseInt(id))
  if (!route) return null
  return {
    ...route,
    description: '这是一条精心设计的旅游线路，包含了当地最精华的景点和体验。全程无购物，让您真正享受旅行的乐趣。',
    itinerary: [
      { day: 1, title: '出发地 - 目的地', content: '搭乘航班前往目的地，抵达后专车接往酒店入住。' },
      { day: 2, title: '精华景点游览', content: '全天游览当地最具代表性的景点，专业导游讲解。' },
      { day: 3, title: '深度体验', content: '深入当地文化，体验特色活动和美食。' },
      { day: 4, title: '自由活动', content: '全天自由活动，可选择自费项目或在酒店休息。' },
      { day: 5, title: '返程', content: '早餐后前往机场，搭乘航班返回温馨的家。' }
    ],
    includes: ['往返机票', '酒店住宿', '景点门票', '导游服务', '旅游保险'],
    excludes: ['个人消费', '自费项目', '单房差'],
    reviews: [
      { id: 1, user: '用户A', avatar: '', rating: 5, content: '非常棒的旅行体验！导游专业，住宿舒适，景点安排合理。', date: '2024-01-10' },
      { id: 2, user: '用户B', avatar: '', rating: 5, content: '全程无购物，真的是纯玩团！下次还会选择。', date: '2024-01-08' }
    ]
  }
}

export const getHotelDetail = (id) => {
  const hotel = hotels.find(h => h.id === parseInt(id))
  if (!hotel) return null
  return {
    ...hotel,
    description: '酒店位于市中心，交通便利，环境优美。设施齐全，服务周到，是您商务出行和休闲度假的理想选择。',
    facilities: ['免费WiFi', '停车场', '游泳池', '健身房', '餐厅', '24小时前台'],
    rooms: [
      { id: 1, name: '豪华大床房', price: hotel.price, size: '45㎡', bed: '1.8米大床', breakfast: '含双早' },
      { id: 2, name: '行政套房', price: hotel.price * 1.5, size: '68㎡', bed: '2.0米大床', breakfast: '含双早' },
      { id: 3, name: '家庭房', price: hotel.price * 1.2, size: '55㎡', bed: '双床', breakfast: '含三早' }
    ],
    reviews: [
      { id: 1, user: '商务旅客', avatar: '', rating: 5, content: '位置很好，服务周到，下次还会入住。', date: '2024-01-12' }
    ]
  }
}