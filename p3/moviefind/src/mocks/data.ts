import type { Movie } from '@/types'

export const moviesData: Movie[] = [
  {
    id: 1,
    title: '星际穿越',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=interstellar%20movie%20poster%20sci-fi%20space&image_size=portrait_4_3',
    rating: 9.4,
    year: 2014,
    genres: ['科幻', '冒险', '剧情'],
    overview: '在不久的将来，地球面临着严重的生态危机。前NASA宇航员库珀被选中执行一项穿越虫洞的太空任务，寻找人类新家园。',
    cast: [
      { name: '马修·麦康纳', photo: '', character: '库珀' },
      { name: '安妮·海瑟薇', photo: '', character: '布兰德博士' },
      { name: '杰西卡·查斯坦', photo: '', character: '墨菲' }
    ],
    releaseDate: '2014-11-07',
    duration: 169
  },
  {
    id: 2,
    title: '盗梦空间',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=inception%20movie%20poster%20dream%20city&image_size=portrait_4_3',
    rating: 9.3,
    year: 2010,
    genres: ['科幻', '动作', '悬疑'],
    overview: '道姆·柯布是一位经验丰富的盗梦者，专门在人们做梦时进入他们的潜意识窃取机密。为了回家与孩子团聚，他接受了一项几乎不可能完成的任务：植入意念。',
    cast: [
      { name: '莱昂纳多·迪卡普里奥', photo: '', character: '柯布' },
      { name: '约瑟夫·高登-莱维特', photo: '', character: '亚瑟' },
      { name: '艾伦·佩吉', photo: '', character: '阿里阿德涅' }
    ],
    releaseDate: '2010-07-16',
    duration: 148
  },
  {
    id: 3,
    title: '肖申克的救赎',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shawshank%20redemption%20movie%20poster%20prison%20hope&image_size=portrait_4_3',
    rating: 9.7,
    year: 1994,
    genres: ['剧情', '犯罪'],
    overview: '银行家安迪被冤枉杀害妻子及其情人，被判终身监禁。在肖申克监狱中，他与瑞德建立了深厚的友谊，并开始了长达二十年的越狱计划。',
    cast: [
      { name: '蒂姆·罗宾斯', photo: '', character: '安迪' },
      { name: '摩根·弗里曼', photo: '', character: '瑞德' },
      { name: '鲍勃·冈顿', photo: '', character: '诺顿' }
    ],
    releaseDate: '1994-09-23',
    duration: 142
  },
  {
    id: 4,
    title: '阿甘正传',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forrest%20gump%20movie%20poster%20running%20bench&image_size=portrait_4_3',
    rating: 9.5,
    year: 1994,
    genres: ['剧情', '爱情'],
    overview: '阿甘是一个智商只有75的低能儿，但他的纯真和善良让他无意中参与了美国20世纪后半叶的几乎所有重大事件。',
    cast: [
      { name: '汤姆·汉克斯', photo: '', character: '阿甘' },
      { name: '罗宾·怀特', photo: '', character: '珍妮' },
      { name: '加里·西尼斯', photo: '', character: '丹中尉' }
    ],
    releaseDate: '1994-07-06',
    duration: 142
  },
  {
    id: 5,
    title: '泰坦尼克号',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=titanic%20movie%20poster%20ship%20romance&image_size=portrait_4_3',
    rating: 9.4,
    year: 1997,
    genres: ['剧情', '爱情', '灾难'],
    overview: '1912年，泰坦尼克号首航。贵族少女露丝与穷画家杰克相遇相爱，但这艘豪华邮轮撞上冰山沉没，两人的爱情也面临生死考验。',
    cast: [
      { name: '莱昂纳多·迪卡普里奥', photo: '', character: '杰克' },
      { name: '凯特·温斯莱特', photo: '', character: '露丝' },
      { name: '比利·赞恩', photo: '', character: '卡尔' }
    ],
    releaseDate: '1997-12-19',
    duration: 194
  },
  {
    id: 6,
    title: '千与千寻',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spirited%20away%20anime%20movie%20poster%20bathhouse&image_size=portrait_4_3',
    rating: 9.4,
    year: 2001,
    genres: ['动画', '奇幻', '冒险'],
    overview: '10岁的千寻与父母误入神灵世界，父母因贪吃变成猪。为了救父母，千寻在汤婆婆的澡堂工作，并踏上了奇幻的成长之旅。',
    cast: [
      { name: '柊瑠美', photo: '', character: '千寻' },
      { name: '入野自由', photo: '', character: '白龙' },
      { name: '夏木真理', photo: '', character: '汤婆婆' }
    ],
    releaseDate: '2001-07-20',
    duration: 125
  },
  {
    id: 7,
    title: '蝙蝠侠：黑暗骑士',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20knight%20batman%20movie%20poster%20joker&image_size=portrait_4_3',
    rating: 9.2,
    year: 2008,
    genres: ['动作', '科幻', '犯罪'],
    overview: '蝙蝠侠、戈登警长和新任检察官哈维·丹特联手打击哥谭市的犯罪势力。然而，小丑的出现将这座城市推入混乱的深渊。',
    cast: [
      { name: '克里斯蒂安·贝尔', photo: '', character: '蝙蝠侠' },
      { name: '希斯·莱杰', photo: '', character: '小丑' },
      { name: '艾伦·艾克哈特', photo: '', character: '哈维·丹特' }
    ],
    releaseDate: '2008-07-18',
    duration: 152
  },
  {
    id: 8,
    title: '疯狂动物城',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=zootopia%20animated%20movie%20poster%20rabbit%20fox&image_size=portrait_4_3',
    rating: 9.2,
    year: 2016,
    genres: ['动画', '喜剧', '冒险'],
    overview: '兔子朱迪梦想成为动物城的警察，她与狐狸尼克搭档调查一起失踪案，却发现背后隐藏着一个惊天阴谋。',
    cast: [
      { name: '金妮弗·古德温', photo: '', character: '朱迪' },
      { name: '杰森·贝特曼', photo: '', character: '尼克' },
      { name: '伊德里斯·艾尔巴', photo: '', character: '牛局长' }
    ],
    releaseDate: '2016-03-04',
    duration: 108
  },
  {
    id: 9,
    title: '楚门的世界',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=truman%20show%20movie%20poster%20tv%20set&image_size=portrait_4_3',
    rating: 9.3,
    year: 1998,
    genres: ['剧情', '科幻'],
    overview: '楚门从出生起就生活在一个巨大的摄影棚中，他的一切都是真人秀的一部分。终于有一天，他开始怀疑这个世界的真实性。',
    cast: [
      { name: '金·凯瑞', photo: '', character: '楚门' },
      { name: '劳拉·琳妮', photo: '', character: '梅丽尔' },
      { name: '艾德·哈里斯', photo: '', character: '克里斯托弗' }
    ],
    releaseDate: '1998-06-05',
    duration: 103
  },
  {
    id: 10,
    title: '辛德勒的名单',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=schindlers%20list%20movie%20poster%20holocaust&image_size=portrait_4_3',
    rating: 9.5,
    year: 1993,
    genres: ['剧情', '历史', '战争'],
    overview: '德国商人奥斯卡·辛德勒在二战期间利用自己的工厂保护了1200名犹太人免遭屠杀。这部电影记录了这段感人至深的历史。',
    cast: [
      { name: '连姆·尼森', photo: '', character: '辛德勒' },
      { name: '拉尔夫·费因斯', photo: '', character: '阿蒙' },
      { name: '本·金斯利', photo: '', character: '斯特恩' }
    ],
    releaseDate: '1993-11-30',
    duration: 195
  },
  {
    id: 11,
    title: '复仇者联盟4：终局之战',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avengers%20endgame%20movie%20poster%20superheroes&image_size=portrait_4_3',
    rating: 8.5,
    year: 2019,
    genres: ['动作', '科幻', '冒险'],
    overview: '灭霸消灭了宇宙一半的生命后，复仇者们必须承担起拯救世界的重任，进行一场跨越时空的终极之战。',
    cast: [
      { name: '小罗伯特·唐尼', photo: '', character: '钢铁侠' },
      { name: '克里斯·埃文斯', photo: '', character: '美国队长' },
      { name: '克里斯·海姆斯沃斯', photo: '', character: '雷神' }
    ],
    releaseDate: '2019-04-26',
    duration: 181
  },
  {
    id: 12,
    title: '黑客帝国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=matrix%20movie%20poster%20cyberpunk%20green&image_size=portrait_4_3',
    rating: 9.0,
    year: 1999,
    genres: ['动作', '科幻'],
    overview: '程序员尼奥发现他所生活的世界其实是由机器创造的虚拟世界。他加入反抗军，开始了人类与机器之间的战争。',
    cast: [
      { name: '基努·里维斯', photo: '', character: '尼奥' },
      { name: '劳伦斯·菲什伯恩', photo: '', character: '墨菲斯' },
      { name: '凯莉-安妮·莫斯', photo: '', character: '崔妮蒂' }
    ],
    releaseDate: '1999-03-31',
    duration: 136
  },
  {
    id: 13,
    title: '教父',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=godfather%20movie%20poster%20mafia%20dark&image_size=portrait_4_3',
    rating: 9.3,
    year: 1972,
    genres: ['剧情', '犯罪'],
    overview: '柯里昂家族是纽约最有权势的黑手党家族。老教父维托遇刺后，小儿子迈克尔被迫接手家族事业，展开了血腥的复仇。',
    cast: [
      { name: '马龙·白兰度', photo: '', character: '维托·柯里昂' },
      { name: '阿尔·帕西诺', photo: '', character: '迈克尔·柯里昂' },
      { name: '詹姆斯·凯恩', photo: '', character: '桑尼·柯里昂' }
    ],
    releaseDate: '1972-03-24',
    duration: 175
  },
  {
    id: 14,
    title: '龙猫',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=my%20neighbor%20totoro%20anime%20poster%20forest&image_size=portrait_4_3',
    rating: 9.2,
    year: 1988,
    genres: ['动画', '奇幻', '家庭'],
    overview: '小月和小梅跟随父亲搬到乡下，在森林里遇到了神奇的龙猫。这段温馨的童年经历充满了奇幻色彩和纯真的友谊。',
    cast: [
      { name: '日高范子', photo: '', character: '小月' },
      { name: '坂本千夏', photo: '', character: '小梅' },
      { name: '岛本须美', photo: '', character: '母亲' }
    ],
    releaseDate: '1988-04-16',
    duration: 86
  },
  {
    id: 15,
    title: '哈利·波特与魔法石',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=harry%20potter%20philosophers%20stone%20movie%20poster&image_size=portrait_4_3',
    rating: 9.0,
    year: 2001,
    genres: ['奇幻', '冒险', '家庭'],
    overview: '孤儿哈利·波特在11岁生日时得知自己是巫师，进入霍格沃茨魔法学校学习。他与罗恩、赫敏一起揭开了魔法石的秘密。',
    cast: [
      { name: '丹尼尔·雷德克里夫', photo: '', character: '哈利·波特' },
      { name: '艾玛·沃特森', photo: '', character: '赫敏' },
      { name: '鲁伯特·格林特', photo: '', character: '罗恩' }
    ],
    releaseDate: '2001-11-16',
    duration: 152
  },
  {
    id: 16,
    title: '让子弹飞',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=let%20the%20bullets%20fly%20chinese%20movie%20poster&image_size=portrait_4_3',
    rating: 8.9,
    year: 2010,
    genres: ['喜剧', '动作', '西部'],
    overview: '土匪张麻子劫走县长马邦德，冒充县长上任鹅城，与当地恶霸黄四郎展开了一场斗智斗勇的较量。',
    cast: [
      { name: '姜文', photo: '', character: '张麻子' },
      { name: '周润发', photo: '', character: '黄四郎' },
      { name: '葛优', photo: '', character: '马邦德' }
    ],
    releaseDate: '2010-12-16',
    duration: 132
  },
  {
    id: 17,
    title: '霸王别姬',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=farewell%20my%20concubine%20chinese%20movie%20poster&image_size=portrait_4_3',
    rating: 9.6,
    year: 1993,
    genres: ['剧情', '爱情', '历史'],
    overview: '程蝶衣和段小楼从小一起学习京剧，一个唱旦角一个唱生角。两人的一生围绕着《霸王别姬》这出戏展开，跨越了半个世纪的风云变幻。',
    cast: [
      { name: '张国荣', photo: '', character: '程蝶衣' },
      { name: '张丰毅', photo: '', character: '段小楼' },
      { name: '巩俐', photo: '', character: '菊仙' }
    ],
    releaseDate: '1993-01-01',
    duration: 171
  },
  {
    id: 18,
    title: '少年派的奇幻漂流',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=life%20of%20pi%20movie%20poster%20tiger%20ocean&image_size=portrait_4_3',
    rating: 9.0,
    year: 2012,
    genres: ['奇幻', '冒险', '剧情'],
    overview: '少年派在海难中失去家人，与一只孟加拉虎同处一艘救生艇。他们在太平洋上漂流227天，经历了一段不可思议的旅程。',
    cast: [
      { name: '苏拉·沙玛', photo: '', character: '派' },
      { name: '伊尔凡·可汗', photo: '', character: '成年派' },
      { name: '拉菲·斯波', photo: '', character: '作家' }
    ],
    releaseDate: '2012-11-21',
    duration: 127
  },
  {
    id: 19,
    title: '疯狂的石头',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crazy%20stone%20chinese%20comedy%20movie%20poster&image_size=portrait_4_3',
    rating: 8.5,
    year: 2006,
    genres: ['喜剧', '犯罪'],
    overview: '重庆一家工艺品厂发现了一块价值连城的翡翠。国际大盗、本地小偷、工厂保卫科长三方围绕这块石头展开了一场令人捧腹的争夺。',
    cast: [
      { name: '郭涛', photo: '', character: '包世宏' },
      { name: '刘桦', photo: '', character: '道哥' },
      { name: '黄渤', photo: '', character: '黑皮' }
    ],
    releaseDate: '2006-06-30',
    duration: 98
  },
  {
    id: 20,
    title: '寻梦环游记',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coco%20movie%20poster%20day%20of%20the%20dead%20mexico&image_size=portrait_4_3',
    rating: 9.1,
    year: 2017,
    genres: ['动画', '奇幻', '音乐'],
    overview: '小男孩米格梦想成为音乐家，但家族禁止音乐。在亡灵节当天，他意外进入亡灵世界，踏上了寻找曾曾祖父的旅程。',
    cast: [
      { name: '安东尼·冈萨雷斯', photo: '', character: '米格' },
      { name: '盖尔·加西亚·贝纳尔', photo: '', character: '埃克托' },
      { name: '本杰明·布拉特', photo: '', character: '德拉库斯' }
    ],
    releaseDate: '2017-11-22',
    duration: 105
  },
  {
    id: 21,
    title: '寄生虫',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=parasite%20korean%20movie%20poster%20dark%20thriller&image_size=portrait_4_3',
    rating: 9.0,
    year: 2019,
    genres: ['剧情', '惊悚'],
    overview: '贫穷的金家人设法进入富有的朴家工作，逐渐渗透进这个家庭。但他们的计划被一个意想不到的秘密所打乱。',
    cast: [
      { name: '宋康昊', photo: '', character: '金基泽' },
      { name: '李善均', photo: '', character: '朴社长' },
      { name: '赵茹珍', photo: '', character: '朴太太' }
    ],
    releaseDate: '2019-05-30',
    duration: 132
  },
  {
    id: 22,
    title: '哪吒之魔童降世',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nezha%20chinese%20animated%20movie%20poster&image_size=portrait_4_3',
    rating: 8.5,
    year: 2019,
    genres: ['动画', '奇幻', '喜剧'],
    overview: '哪吒本应是灵珠转世，却阴差阳错成为魔丸转世。他从小遭受世人的误解和排斥，但最终选择用自己的方式证明自己。',
    cast: [
      { name: '吕艳婷', photo: '', character: '哪吒' },
      { name: '囧森瑟夫', photo: '', character: '敖丙' },
      { name: '瀚墨', photo: '', character: '太乙真人' }
    ],
    releaseDate: '2019-07-26',
    duration: 110
  },
  {
    id: 23,
    title: '阿凡达',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20movie%20poster%20pandora%20blue%20aliens&image_size=portrait_4_3',
    rating: 8.8,
    year: 2009,
    genres: ['科幻', '动作', '冒险'],
    overview: '退伍军人杰克·萨利来到潘多拉星球，通过阿凡达项目与纳威人建立联系。他最终选择站在纳威人一边，对抗人类的采矿入侵。',
    cast: [
      { name: '萨姆·沃辛顿', photo: '', character: '杰克' },
      { name: '佐伊·索尔达娜', photo: '', character: '奈蒂莉' },
      { name: '西格妮·韦弗', photo: '', character: '格蕾丝博士' }
    ],
    releaseDate: '2009-12-18',
    duration: 162
  },
  {
    id: 24,
    title: '摔跤吧！爸爸',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dangal%20indian%20movie%20poster%20wrestling&image_size=portrait_4_3',
    rating: 9.0,
    year: 2016,
    genres: ['剧情', '传记', '运动'],
    overview: '前摔跤冠军马哈维亚发现女儿们有摔跤天赋，打破社会偏见训练她们成为摔跤手，最终她们成为世界冠军。',
    cast: [
      { name: '阿米尔·汗', photo: '', character: '马哈维亚' },
      { name: '法缇玛·萨那·纱卡', photo: '', character: '吉塔' },
      { name: '桑亚·玛荷塔', photo: '', character: '巴比塔' }
    ],
    releaseDate: '2016-12-23',
    duration: 161
  },
  {
    id: 25,
    title: '三傻大闹宝莱坞',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=3%20idiots%20indian%20movie%20poster%20college&image_size=portrait_4_3',
    rating: 9.2,
    year: 2009,
    genres: ['剧情', '喜剧', '爱情'],
    overview: '兰乔、法罕和拉加是皇家工程学院的室友。兰乔用他独特的思维方式影响着身边的人，挑战传统教育制度。',
    cast: [
      { name: '阿米尔·汗', photo: '', character: '兰乔' },
      { name: '马德哈万', photo: '', character: '法罕' },
      { name: '沙尔曼·乔希', photo: '', character: '拉加' }
    ],
    releaseDate: '2009-12-25',
    duration: 170
  },
  {
    id: 26,
    title: '飞屋环游记',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=up%20pixar%20movie%20poster%20balloons%20house&image_size=portrait_4_3',
    rating: 9.0,
    year: 2009,
    genres: ['动画', '喜剧', '冒险'],
    overview: '老人卡尔为实现与妻子的梦想，用无数气球把房子拉上天，前往南美洲探险。途中他意外结识了童子军拉塞尔。',
    cast: [
      { name: '爱德华·阿斯纳', photo: '', character: '卡尔' },
      { name: '乔丹·长井', photo: '', character: '拉塞尔' },
      { name: '克里斯托弗·普卢默', photo: '', character: '蒙兹' }
    ],
    releaseDate: '2009-05-29',
    duration: 96
  },
  {
    id: 27,
    title: '美丽人生',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=life%20is%20beautiful%20movie%20poster%20holocaust&image_size=portrait_4_3',
    rating: 9.5,
    year: 1997,
    genres: ['剧情', '喜剧', '爱情', '战争'],
    overview: '犹太父子被送进集中营，父亲圭多用想象力编织了一个美丽的童话，保护儿子的童心不受战争摧残。',
    cast: [
      { name: '罗伯托·贝尼尼', photo: '', character: '圭多' },
      { name: '尼可莱塔·布拉斯基', photo: '', character: '多拉' },
      { name: '乔治·坎塔里尼', photo: '', character: '约书亚' }
    ],
    releaseDate: '1997-12-20',
    duration: 116
  },
  {
    id: 28,
    title: '这个杀手不太冷',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=leon%20professional%20movie%20poster%20hitman&image_size=portrait_4_3',
    rating: 9.4,
    year: 1994,
    genres: ['动作', '剧情', '犯罪'],
    overview: '职业杀手里昂救下了全家被杀的小女孩玛蒂尔达。两人在相处中产生了特殊的感情，玛蒂尔达也踏上了复仇之路。',
    cast: [
      { name: '让·雷诺', photo: '', character: '里昂' },
      { name: '娜塔莉·波特曼', photo: '', character: '玛蒂尔达' },
      { name: '加里·奥德曼', photo: '', character: '史丹菲尔' }
    ],
    releaseDate: '1994-09-14',
    duration: 110
  },
  {
    id: 29,
    title: '海上钢琴师',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legend%20of%201900%20movie%20poster%20piano%20ship&image_size=portrait_4_3',
    rating: 9.3,
    year: 1998,
    genres: ['剧情', '音乐'],
    overview: '1900年，一个弃婴在弗吉尼亚号邮轮上被发现并取名1900。他无师自通成为钢琴大师，一生都在船上度过，从未踏上陆地。',
    cast: [
      { name: '蒂姆·罗斯', photo: '', character: '1900' },
      { name: '普路特·泰勒·文斯', photo: '', character: '麦克斯' },
      { name: '梅兰尼·蒂埃里', photo: '', character: '女孩' }
    ],
    releaseDate: '1998-10-28',
    duration: 165
  },
  {
    id: 30,
    title: '机器人总动员',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wall-e%20pixar%20movie%20poster%20robot%20earth&image_size=portrait_4_3',
    rating: 9.3,
    year: 2008,
    genres: ['动画', '科幻', '爱情'],
    overview: '地球被垃圾覆盖后，人类乘坐太空船离开。瓦力是最后一个垃圾清理机器人，他爱上了来到地球的伊娃，跟随她展开了太空冒险。',
    cast: [
      { name: '本·贝尔特', photo: '', character: '瓦力' },
      { name: '艾丽莎·奈特', photo: '', character: '伊娃' },
      { name: '杰夫·格尔林', photo: '', character: '船长' }
    ],
    releaseDate: '2008-06-27',
    duration: 98
  },
  {
    id: 31,
    title: '我不是药神',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dying%20to%20survive%20chinese%20movie%20poster&image_size=portrait_4_3',
    rating: 9.0,
    year: 2018,
    genres: ['剧情', '喜剧'],
    overview: '保健品店老板程勇从印度代购治疗白血病的仿制药，成为病友口中的"药神"，但也面临着法律和道德的困境。',
    cast: [
      { name: '徐峥', photo: '', character: '程勇' },
      { name: '王传君', photo: '', character: '吕受益' },
      { name: '周一围', photo: '', character: '曹警官' }
    ],
    releaseDate: '2018-07-05',
    duration: 117
  },
  {
    id: 32,
    title: '星际宝贝',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lilo%20stitch%20animated%20movie%20poster%20hawaii&image_size=portrait_4_3',
    rating: 8.5,
    year: 2002,
    genres: ['动画', '喜剧', '家庭'],
    overview: '夏威夷小女孩莉萝收养了一只"小狗"史迪奇，却不知道它其实是外星实验品626号。一段温馨有趣的友谊故事就此展开。',
    cast: [
      { name: '黛维·切斯', photo: '', character: '莉萝' },
      { name: '克里斯·桑德斯', photo: '', character: '史迪奇' },
      { name: '蒂亚·卡雷尔', photo: '', character: '兰莉' }
    ],
    releaseDate: '2002-06-21',
    duration: 85
  }
]
