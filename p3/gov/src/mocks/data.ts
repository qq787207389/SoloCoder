export const serviceGuides: any[] = [
  {
    id: '1',
    name: '社会保险查询',
    department: '人力资源和社会保障局',
    theme: '社保',
    timeLimit: '1个工作日',
    materialCount: 2,
    description: '查询个人社会保险缴费记录和账户信息',
    conditions: ['本市参保人员', '持有有效身份证件'],
    materials: [
      { id: 'm1', name: '身份证复印件', required: true, description: '正反面复印件' },
      { id: 'm2', name: '社保卡', required: false, description: '如有请提供' },
    ],
    steps: [
      { id: 's1', title: '提交申请', description: '在线填写并提交申请' },
      { id: 's2', title: '材料审核', description: '工作人员审核申请材料' },
      { id: 's3', title: '查询结果', description: '获取社保查询结果' },
    ],
    window: '社保服务大厅A窗口',
    phone: '010-12333',
  },
  {
    id: '2',
    name: '身份证办理',
    department: '公安局',
    theme: '户政',
    timeLimit: '20个工作日',
    materialCount: 3,
    description: '首次申领、换领、补领居民身份证',
    conditions: ['本市户籍居民', '年满16周岁'],
    materials: [
      { id: 'm1', name: '户口簿', required: true, description: '原件及复印件' },
      { id: 'm2', name: '照片回执', required: true, description: '照相馆出具' },
      { id: 'm3', name: '原身份证', required: false, description: '换领需提供' },
    ],
    steps: [
      { id: 's1', title: '拍照取号', description: '拍照并领取办理号' },
      { id: 's2', title: '提交材料', description: '提交申请材料' },
      { id: 's3', title: '缴费确认', description: '缴纳工本费并确认' },
      { id: 's4', title: '领取证件', description: '凭回执领取身份证' },
    ],
    window: '户政服务大厅1号窗口',
    phone: '010-87654321',
  },
  {
    id: '3',
    name: '企业注册登记',
    department: '市场监督管理局',
    theme: '企业',
    timeLimit: '3个工作日',
    materialCount: 5,
    description: '有限责任公司设立登记',
    conditions: ['符合公司法规定', '名称预先核准通过'],
    materials: [
      { id: 'm1', name: '公司设立申请书', required: true, description: '法定代表人签字' },
      { id: 'm2', name: '公司章程', required: true, description: '全体股东签字' },
      { id: 'm3', name: '股东身份证明', required: true, description: '自然人提供身份证' },
      { id: 'm4', name: '住所证明', required: true, description: '房产证或租赁合同' },
      { id: 'm5', name: '名称核准通知书', required: true, description: '工商局出具' },
    ],
    steps: [
      { id: 's1', title: '名称核准', description: '在线申请企业名称' },
      { id: 's2', title: '提交材料', description: '提交注册申请材料' },
      { id: 's3', title: '领取执照', description: '领取营业执照' },
      { id: 's4', title: '刻章备案', description: '刻制公章并备案' },
    ],
    window: '企业服务大厅B区',
    phone: '010-11223344',
  },
  {
    id: '4',
    name: '不动产登记',
    department: '自然资源和规划局',
    theme: '不动产',
    timeLimit: '5个工作日',
    materialCount: 4,
    description: '国有建设用地使用权及房屋所有权登记',
    conditions: ['权属清晰', '无争议纠纷'],
    materials: [
      { id: 'm1', name: '登记申请书', required: true, description: '申请人签字' },
      { id: 'm2', name: '申请人身份证明', required: true, description: '身份证复印件' },
      { id: 'm3', name: '不动产权属来源证明', required: true, description: '购房合同等' },
      { id: 'm4', name: '不动产权籍调查成果', required: true, description: '测绘报告' },
    ],
    steps: [
      { id: 's1', title: '申请受理', description: '提交申请并受理' },
      { id: 's2', title: '权籍调查', description: '开展权籍调查' },
      { id: 's3', title: '审核公告', description: '审核并公告' },
      { id: 's4', title: '登簿发证', description: '登记并颁发证书' },
    ],
    window: '不动产登记中心',
    phone: '010-55667788',
  },
  {
    id: '5',
    name: '医保报销申请',
    department: '医疗保障局',
    theme: '医保',
    timeLimit: '15个工作日',
    materialCount: 4,
    description: '城镇职工基本医疗保险费用报销',
    conditions: ['正常参保状态', '在定点医疗机构就医'],
    materials: [
      { id: 'm1', name: '医保报销申请表', required: true, description: '填写完整' },
      { id: 'm2', name: '医疗费用发票', required: true, description: '原件' },
      { id: 'm3', name: '费用明细清单', required: true, description: '医院出具' },
      { id: 'm4', name: '出院小结', required: false, description: '住院需提供' },
    ],
    steps: [
      { id: 's1', title: '提交申请', description: '提交报销申请材料' },
      { id: 's2', title: '费用审核', description: '审核医疗费用' },
      { id: 's3', title: '基金拨付', description: '拨付报销款项' },
    ],
    window: '医保服务大厅',
    phone: '010-99887766',
  },
  {
    id: '6',
    name: '公积金提取',
    department: '住房公积金管理中心',
    theme: '公积金',
    timeLimit: '3个工作日',
    materialCount: 3,
    description: '购买自住住房提取住房公积金',
    conditions: ['连续缴存6个月以上', '购买自住住房'],
    materials: [
      { id: 'm1', name: '提取申请书', required: true, description: '单位盖章' },
      { id: 'm2', name: '购房合同', required: true, description: '原件及复印件' },
      { id: 'm3', name: '首付款发票', required: true, description: '原件及复印件' },
    ],
    steps: [
      { id: 's1', title: '提交申请', description: '提交提取申请' },
      { id: 's2', title: '审核审批', description: '审核并审批' },
      { id: 's3', title: '资金到账', description: '提取资金到账' },
    ],
    window: '公积金服务大厅',
    phone: '010-12329',
  },
  {
    id: '7',
    name: '出入境证件办理',
    department: '出入境管理局',
    theme: '出入境',
    timeLimit: '7个工作日',
    materialCount: 2,
    description: '普通护照申请办理',
    conditions: ['本市户籍居民', '无法定不准出境情形'],
    materials: [
      { id: 'm1', name: '身份证', required: true, description: '原件及复印件' },
      { id: 'm2', name: '照片', required: true, description: '近期免冠照片' },
    ],
    steps: [
      { id: 's1', title: '在线预约', description: '在线预约办理时间' },
      { id: 's2', title: '现场办理', description: '到现场提交材料' },
      { id: 's3', title: '领取证件', description: '领取护照' },
    ],
    window: '出入境办证大厅',
    phone: '010-84020101',
  },
  {
    id: '8',
    name: '驾驶证换证',
    department: '交通警察支队',
    theme: '交通',
    timeLimit: '1个工作日',
    materialCount: 3,
    description: '机动车驾驶证有效期满换证',
    conditions: ['驾驶证在有效期内', '记分未满12分'],
    materials: [
      { id: 'm1', name: '身份证', required: true, description: '原件' },
      { id: 'm2', name: '原驾驶证', required: true, description: '原件' },
      { id: 'm3', name: '体检证明', required: true, description: '指定医院出具' },
    ],
    steps: [
      { id: 's1', title: '体检', description: '到指定医院体检' },
      { id: 's2', title: '提交申请', description: '提交换证申请' },
      { id: 's3', title: '领取新证', description: '领取新驾驶证' },
    ],
    window: '车管所服务大厅',
    phone: '010-12123',
  },
  {
    id: '9',
    name: '税务登记',
    department: '税务局',
    theme: '税务',
    timeLimit: '1个工作日',
    materialCount: 4,
    description: '新设企业税务信息确认',
    conditions: ['已办理工商营业执照'],
    materials: [
      { id: 'm1', name: '营业执照', required: true, description: '副本复印件' },
      { id: 'm2', name: '公章', required: true, description: '企业公章' },
      { id: 'm3', name: '法定代表人身份证', required: true, description: '复印件' },
      { id: 'm4', name: '公司章程', required: false, description: '复印件' },
    ],
    steps: [
      { id: 's1', title: '信息采集', description: '采集企业信息' },
      { id: 's2', title: '税种认定', description: '认定税种信息' },
      { id: 's3', title: '发票申领', description: '申领发票' },
    ],
    window: '办税服务厅',
    phone: '010-12366',
  },
  {
    id: '10',
    name: '教育资格认定',
    department: '教育局',
    theme: '教育',
    timeLimit: '20个工作日',
    materialCount: 5,
    description: '中小学教师资格认定',
    conditions: ['符合学历要求', '通过教师资格考试'],
    materials: [
      { id: 'm1', name: '身份证', required: true, description: '原件' },
      { id: 'm2', name: '学历证书', required: true, description: '原件及复印件' },
      { id: 'm3', name: '教师资格考试合格证明', required: true, description: '原件' },
      { id: 'm4', name: '普通话等级证书', required: true, description: '二级乙等以上' },
      { id: 'm5', name: '体检表', required: true, description: '指定医院出具' },
    ],
    steps: [
      { id: 's1', title: '网上申报', description: '在线填写申报信息' },
      { id: 's2', title: '现场审核', description: '提交材料现场审核' },
      { id: 's3', title: '资格认定', description: '教育部门认定' },
      { id: 's4', title: '领取证书', description: '领取教师资格证书' },
    ],
    window: '教育局政务服务窗口',
    phone: '010-66096114',
  },
  {
    id: '11',
    name: '残疾人证办理',
    department: '残疾人联合会',
    theme: '民政',
    timeLimit: '10个工作日',
    materialCount: 4,
    description: '中华人民共和国残疾人证申领',
    conditions: ['符合残疾标准', '自愿申请'],
    materials: [
      { id: 'm1', name: '身份证', required: true, description: '原件及复印件' },
      { id: 'm2', name: '户口簿', required: true, description: '原件及复印件' },
      { id: 'm3', name: '残疾评定表', required: true, description: '指定医院出具' },
      { id: 'm4', name: '照片', required: true, description: '近期免冠照片' },
    ],
    steps: [
      { id: 's1', title: '申请受理', description: '提交申请材料' },
      { id: 's2', title: '残疾评定', description: '到指定医院评定' },
      { id: 's3', title: '审核公示', description: '审核并公示' },
      { id: 's4', title: '发放证件', description: '发放残疾人证' },
    ],
    window: '残联服务窗口',
    phone: '010-66580144',
  },
  {
    id: '12',
    name: '高龄津贴申请',
    department: '民政局',
    theme: '民政',
    timeLimit: '15个工作日',
    materialCount: 3,
    description: '80周岁以上老年人高龄津贴申请',
    conditions: ['年满80周岁', '本市户籍居民'],
    materials: [
      { id: 'm1', name: '身份证', required: true, description: '原件及复印件' },
      { id: 'm2', name: '户口簿', required: true, description: '原件及复印件' },
      { id: 'm3', name: '银行卡', required: true, description: '本人银行卡复印件' },
    ],
    steps: [
      { id: 's1', title: '提交申请', description: '向社区提交申请' },
      { id: 's2', title: '街道审核', description: '街道办事处审核' },
      { id: 's3', title: '民政审批', description: '民政局审批' },
      { id: 's4', title: '津贴发放', description: '按月发放津贴' },
    ],
    window: '社区服务中心',
    phone: '010-58123111',
  },
  {
    id: '13',
    name: '创业补贴申请',
    department: '人力资源和社会保障局',
    theme: '就业',
    timeLimit: '20个工作日',
    materialCount: 5,
    description: '一次性创业补贴申请',
    conditions: ['首次创业', '正常经营6个月以上'],
    materials: [
      { id: 'm1', name: '营业执照', required: true, description: '原件及复印件' },
      { id: 'm2', name: '身份证', required: true, description: '原件及复印件' },
      { id: 'm3', name: '社保缴费证明', required: true, description: '近6个月' },
      { id: 'm4', name: '经营场所证明', required: true, description: '租赁合同等' },
      { id: 'm5', name: '银行账户', required: true, description: '企业对公账户' },
    ],
    steps: [
      { id: 's1', title: '提交申请', description: '向人社部门提交申请' },
      { id: 's2', title: '材料审核', description: '审核申请材料' },
      { id: 's3', title: '现场核查', description: '现场核查经营情况' },
      { id: 's4', title: '补贴发放', description: '发放创业补贴' },
    ],
    window: '人社局就业服务窗口',
    phone: '010-84201116',
  },
  {
    id: '14',
    name: '卫生许可证办理',
    department: '卫生健康委员会',
    theme: '卫生',
    timeLimit: '10个工作日',
    materialCount: 4,
    description: '公共场所卫生许可证新办',
    conditions: ['经营场所符合卫生要求'],
    materials: [
      { id: 'm1', name: '卫生许可证申请表', required: true, description: '填写完整' },
      { id: 'm2', name: '营业执照', required: true, description: '复印件' },
      { id: 'm3', name: '卫生检测报告', required: true, description: '有资质机构出具' },
      { id: 'm4', name: '卫生管理制度', required: true, description: '文本' },
    ],
    steps: [
      { id: 's1', title: '提交申请', description: '提交申请材料' },
      { id: 's2', title: '现场审核', description: '卫生监督现场审核' },
      { id: 's3', title: '审批发证', description: '审批并发放许可证' },
    ],
    window: '卫健委政务窗口',
    phone: '010-68792311',
  },
  {
    id: '15',
    name: '园林绿化审批',
    department: '园林绿化局',
    theme: '建设',
    timeLimit: '7个工作日',
    materialCount: 4,
    description: '临时占用城市绿地审批',
    conditions: ['因建设或特殊需要', '不破坏绿化环境'],
    materials: [
      { id: 'm1', name: '申请书', required: true, description: '加盖申请单位公章' },
      { id: 'm2', name: '项目批准文件', required: true, description: '复印件' },
      { id: 'm3', name: '绿地平面位置图', required: true, description: '标注占用范围' },
      { id: 'm4', name: '恢复方案', required: true, description: '绿地恢复方案' },
    ],
    steps: [
      { id: 's1', title: '提交申请', description: '提交申请材料' },
      { id: 's2', title: '现场勘查', description: '现场勘查核实' },
      { id: 's3', title: '审批决定', description: '作出审批决定' },
    ],
    window: '园林绿化局服务窗口',
    phone: '010-84236600',
  },
];

export const policies: any[] = [
  {
    id: 'p1',
    title: '关于进一步优化营商环境的若干措施',
    documentNumber: '政发〔2024〕1号',
    publishDate: '2024-01-15',
    department: '市政府办公厅',
    content: `
      <h3>一、总体要求</h3>
      <p>以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大精神，深入贯彻习近平总书记关于优化营商环境的重要论述，坚持市场化、法治化、国际化原则，以市场主体需求为导向，以深刻转变政府职能为核心，创新体制机制、强化协同联动、完善法治保障，对标国际先进水平，为各类市场主体投资兴业营造稳定、公平、透明、可预期的良好环境。</p>
      <h3>二、主要措施</h3>
      <p>（一）进一步简化企业开办流程。将企业开办时间压缩至1个工作日内，实现"一窗受理、一网通办、一次领取"。推行企业开办"零成本"，免费为新设企业刻制公章、财务章、发票章、法定代表人名章。</p>
      <p>（二）深化工程建设项目审批制度改革。进一步压缩工程建设项目审批时间，将一般社会投资工程建设项目审批时间压缩至45个工作日内。推行工程建设项目"清单制+告知承诺制"审批。</p>
      <p>（三）优化市政公用服务。供水、供电、供气、供热等市政公用服务报装接入实行"一站式"服务，进一步压缩办理时限，降低办理成本。</p>
      <h3>三、保障措施</h3>
      <p>（一）加强组织领导。各区、各部门要高度重视优化营商环境工作，主要负责同志要亲自抓、负总责，确保各项措施落到实处。</p>
      <p>（二）强化监督考核。建立健全优化营商环境考核评价机制，将优化营商环境工作纳入政府绩效考核体系。</p>
    `,
    attachments: [
      { id: 'a1', name: '优化营商环境任务分解表.pdf', type: 'PDF', size: '256KB' },
      { id: 'a2', name: '政策解读.docx', type: 'Word', size: '128KB' },
    ],
  },
  {
    id: 'p2',
    title: '关于印发数字政府建设实施方案的通知',
    documentNumber: '政办发〔2024〕5号',
    publishDate: '2024-02-20',
    department: '市政府办公厅',
    content: `
      <h3>一、建设目标</h3>
      <p>到2025年，建成"整体协同、高效运行、精准服务、科学管理"的数字政府框架体系，实现政府治理能力现代化水平显著提升，政务服务"一网通办"全面实现，政府运行"一网协同"高效协同，政府决策"一网统管"精准科学。</p>
      <h3>二、重点任务</h3>
      <p>（一）完善政务服务"一网通办"。推进政务服务事项标准化、规范化，实现更多事项"全程网办""跨省通办"。优化"皖事通"APP功能，提升移动端服务能力。</p>
      <p>（二）推进政府运行"一网协同"。建设统一的政务协同平台，实现跨部门、跨层级、跨区域业务协同。推行"掌上办公"，提升政府运行效率。</p>
      <p>（三）实现政府决策"一网统管"。建设城市运行管理平台，实现城市运行状态实时监测、智能预警、快速处置。推进"互联网+监管"，提升监管精准化、智能化水平。</p>
    `,
    attachments: [
      { id: 'a1', name: '数字政府建设实施方案.pdf', type: 'PDF', size: '512KB' },
    ],
  },
  {
    id: 'p3',
    title: '关于加强政务服务便民热线工作的意见',
    documentNumber: '政办发〔2024〕8号',
    publishDate: '2024-03-10',
    department: '市政府办公厅',
    content: `
      <h3>一、总体要求</h3>
      <p>以"便民、高效、规范、智慧"为目标，整合各类政务服务热线，建设统一的12345政务服务便民热线平台，实现"一号对外、统一受理、按责转办、限时办结、统一督办、评价反馈"的工作机制，为企业和群众提供"7×24小时"全天候、全方位、全覆盖的政务服务。</p>
      <h3>二、主要任务</h3>
      <p>（一）完成热线归并整合。2024年6月底前，完成全市各类政务服务热线归并整合，实现12345"一号对外"。</p>
      <p>（二）提升热线服务能力。加强热线平台建设，优化智能语音导航，推行"接诉即办"，提升响应率、解决率、满意率。</p>
      <p>（三）建立健全工作机制。建立健全热线受理、转办、督办、反馈、评价等工作机制，确保企业和群众诉求"事事有回音、件件有着落"。</p>
    `,
    attachments: [],
  },
  {
    id: 'p4',
    title: '关于推进政务服务"跨省通办"的实施意见',
    documentNumber: '政发〔2024〕12号',
    publishDate: '2024-04-05',
    department: '市数据资源管理局',
    content: `
      <h3>一、工作目标</h3>
      <p>2024年底前，实现100项高频政务服务事项"跨省通办"，2025年底前，实现200项政务服务事项"跨省通办"，有效满足各类市场主体和广大人民群众异地办事需求。</p>
      <h3>二、重点事项</h3>
      <p>（一）医保社保类。包括医保关系转移接续、异地就医备案、养老保险关系转移接续、社保查询等事项。</p>
      <p>（二）户政出入境类。包括户口迁移、身份证换领补领、出入境证件办理等事项。</p>
      <p>（三）企业服务类。包括企业设立登记、变更登记、注销登记、资质认定等事项。</p>
      <h3>三、保障措施</h3>
      <p>（一）加强组织协调。建立"跨省通办"工作协调机制，加强与周边省市沟通协作。</p>
      <p>（二）强化技术支撑。完善全国一体化政务服务平台功能，实现数据共享、业务协同。</p>
    `,
    attachments: [
      { id: 'a1', name: '跨省通办事项清单.xlsx', type: 'Excel', size: '64KB' },
    ],
  },
  {
    id: 'p5',
    title: '关于印发社会信用体系建设规划的通知',
    documentNumber: '政办发〔2024〕15号',
    publishDate: '2024-04-25',
    department: '市发展和改革委员会',
    content: `
      <h3>一、发展基础</h3>
      <p>我市社会信用体系建设取得积极进展，信用信息平台基本建成，信用制度体系逐步完善，信用应用场景不断拓展，全社会信用意识显著增强。</p>
      <h3>二、总体目标</h3>
      <p>到2025年，建成覆盖全社会的征信体系，公共信用信息共享平台功能完善，信用监管机制健全有效，信用服务市场规范发展，全社会诚信意识普遍增强，营商环境进一步优化，"信用城市"建设走在全国前列。</p>
      <h3>三、重点任务</h3>
      <p>（一）推进信用信息归集共享。建立健全信用信息归集共享机制，实现公共信用信息应归尽归、互联互通。</p>
      <p>（二）完善信用监管机制。建立健全以信用为基础的新型监管机制，推行信用承诺制，开展信用分级分类监管。</p>
      <p>（三）拓展信用应用场景。推进信用在政务服务、金融服务、公共服务等领域的广泛应用。</p>
    `,
    attachments: [
      { id: 'a1', name: '社会信用体系建设规划.pdf', type: 'PDF', size: '768KB' },
    ],
  },
  {
    id: 'p6',
    title: '关于深化"放管服"改革优化政务服务的实施意见',
    documentNumber: '政发〔2024〕18号',
    publishDate: '2024-05-10',
    department: '市政府办公厅',
    content: `
      <h3>一、总体要求</h3>
      <p>持续深化"放管服"改革，加快转变政府职能，最大限度减少政府对市场资源的直接配置，最大限度减少政府对市场活动的直接干预，大幅提高政务服务效率，大幅降低制度性交易成本，充分发挥市场在资源配置中的决定性作用，更好发挥政府作用，推动有效市场和有为政府更好结合。</p>
      <h3>二、深化行政审批制度改革</h3>
      <p>（一）进一步精简行政许可事项。持续开展行政许可事项清理工作，取消和下放一批行政许可事项。</p>
      <p>（二）推行"一业一证"改革。在更多行业推行"一业一证"改革，将一个行业多张许可证整合为一张"行业综合许可证"。</p>
      <p>（三）深化"证照分离"改革。在全市范围内推行"证照分离"改革全覆盖，对所有涉企经营许可事项实行分类改革。</p>
    `,
    attachments: [],
  },
  {
    id: 'p7',
    title: '关于加强公共数据开放共享的若干规定',
    documentNumber: '政令〔2024〕3号',
    publishDate: '2024-05-20',
    department: '市数据资源管理局',
    content: `
      <h3>第一章 总则</h3>
      <p>第一条 为了规范和促进公共数据开放共享，推动公共数据资源开发利用，提升政府治理能力和公共服务水平，根据有关法律法规，结合本市实际，制定本规定。</p>
      <p>第二条 本市行政区域内公共数据的开放、共享、开发利用及其相关管理活动，适用本规定。</p>
      <h3>第二章 公共数据目录</h3>
      <p>第三条 公共数据实行目录管理。市数据资源主管部门负责组织编制本市公共数据目录，明确公共数据的内容、类型、更新周期、开放和共享属性等。</p>
      <p>第四条 公共数据提供单位应当按照公共数据目录，及时归集、更新公共数据。</p>
      <h3>第三章 公共数据共享</h3>
      <p>第五条 公共数据以共享为原则、不共享为例外。公共数据提供单位应当按照规定共享公共数据。</p>
      <p>第六条 公共数据共享分为无条件共享、有条件共享和不予共享三种类型。</p>
    `,
    attachments: [],
  },
  {
    id: 'p8',
    title: '关于推进智慧社区建设的指导意见',
    documentNumber: '政办发〔2024〕22号',
    publishDate: '2024-06-05',
    department: '市民政局',
    content: `
      <h3>一、重要意义</h3>
      <p>智慧社区是智慧城市建设的重要组成部分，是提升社区治理能力和服务水平的重要抓手。推进智慧社区建设，对于提升居民生活品质、创新基层社会治理、促进社区和谐稳定具有重要意义。</p>
      <h3>二、总体目标</h3>
      <p>到2025年，实现全市城市社区智慧化建设全覆盖，农村社区智慧化建设覆盖率达到50%以上，建成一批特色鲜明、示范带动作用强的智慧社区。</p>
      <h3>三、重点任务</h3>
      <p>（一）建设智慧社区综合服务平台。整合社区各类服务资源，建设统一的智慧社区综合服务平台，为居民提供"一站式"服务。</p>
      <p>（二）推进社区智能设施建设。推进社区安防、消防、停车、养老等智能设施建设，提升社区智能化水平。</p>
      <p>（三）创新社区治理模式。运用大数据、人工智能等技术，提升社区治理精准化、智能化水平。</p>
    `,
    attachments: [],
  },
  {
    id: 'p9',
    title: '关于印发全民健身实施计划的通知',
    documentNumber: '政办发〔2024〕25号',
    publishDate: '2024-06-20',
    department: '市体育局',
    content: `
      <h3>一、总体要求</h3>
      <p>坚持以人民为中心的发展思想，贯彻落实全民健身国家战略，构建更高水平的全民健身公共服务体系，加快推进体育强市建设，不断满足人民群众日益增长的健身需求，提高人民群众健康水平和生活品质。</p>
      <h3>二、主要目标</h3>
      <p>到2025年，全市人均体育场地面积达到2.8平方米，经常参加体育锻炼人数比例达到42%以上，城乡居民达到《国民体质测定标准》合格以上人数比例达到93%以上。</p>
      <h3>三、重点任务</h3>
      <p>（一）加强全民健身场地设施建设。推进体育公园、健身步道、社会足球场等场地设施建设，完善"15分钟健身圈"。</p>
      <p>（二）广泛开展全民健身赛事活动。举办多层次、多样化的全民健身赛事活动，打造一批有影响力的品牌赛事。</p>
      <p>（三）提升科学健身指导服务水平。加强社会体育指导员队伍建设，开展科学健身指导服务。</p>
    `,
    attachments: [
      { id: 'a1', name: '全民健身场地设施建设项目表.pdf', type: 'PDF', size: '192KB' },
    ],
  },
  {
    id: 'p10',
    title: '关于加强生态环境保护的实施意见',
    documentNumber: '政发〔2024〕25号',
    publishDate: '2024-07-01',
    department: '市生态环境局',
    content: `
      <h3>一、总体要求</h3>
      <p>深入贯彻习近平生态文明思想，坚持绿水青山就是金山银山理念，坚持山水林田湖草沙一体化保护和系统治理，统筹产业结构调整、污染治理、生态保护、应对气候变化，协同推进降碳、减污、扩绿、增长，推进生态优先、节约集约、绿色低碳发展，建设人与自然和谐共生的美丽城市。</p>
      <h3>二、主要目标</h3>
      <p>到2025年，全市生态环境持续改善，主要污染物排放总量持续减少，环境空气质量优良天数比例达到85%以上，地表水国控断面水质优良比例达到100%，生态系统质量和稳定性稳步提升。</p>
      <h3>三、重点任务</h3>
      <p>（一）深入打好蓝天保卫战。加强PM2.5和臭氧协同控制，推进重点行业深度治理，强化移动源污染防治，加强面源污染管控。</p>
      <p>（二）深入打好碧水保卫战。统筹水资源、水环境、水生态治理，推进重点流域综合治理，加强饮用水水源地保护。</p>
      <p>（三）深入打好净土保卫战。加强土壤污染源头防控，推进建设用地土壤风险管控和修复，强化农业面源污染治理。</p>
    `,
    attachments: [],
  },
];

export const notices: any[] = [
  {
    id: 'n1',
    title: '关于2024年国庆节放假安排的通知',
    documentNumber: '',
    publishDate: '2024-09-20',
    department: '市政府办公厅',
    content: '根据国务院办公厅通知精神，2024年国庆节放假安排如下：10月1日（星期二）至10月7日（星期一）放假调休，共7天。9月29日（星期日）、10月12日（星期六）上班。',
    attachments: [],
  },
  {
    id: 'n2',
    title: '政务服务大厅作息时间调整通知',
    documentNumber: '',
    publishDate: '2024-09-15',
    department: '市政务服务管理局',
    content: '自2024年10月1日起，政务服务大厅作息时间调整为：上午9:00-12:00，下午13:30-17:00。请广大市民朋友合理安排办事时间。',
    attachments: [],
  },
  {
    id: 'n3',
    title: '关于暂停办理社保业务的通知',
    documentNumber: '',
    publishDate: '2024-09-10',
    department: '市人力资源和社会保障局',
    content: '因系统升级维护，2024年9月25日至9月30日暂停办理社保相关业务，10月8日起恢复正常办理。请相关单位和个人提前做好安排。',
    attachments: [],
  },
  {
    id: 'n4',
    title: '政务服务"好差评"制度实施通知',
    documentNumber: '',
    publishDate: '2024-09-01',
    department: '市政务服务管理局',
    content: '自2024年10月1日起，全市政务服务事项全面实施"好差评"制度。办事群众可通过线上线下多种渠道对政务服务进行评价，评价结果将作为政务服务绩效考核的重要依据。',
    attachments: [],
  },
];

export const banners: any[] = [
  {
    id: 'b1',
    title: '深入学习贯彻党的二十大精神',
    image: 'https://picsum.photos/800/300?random=1',
    link: '/policies/p1',
  },
  {
    id: 'b2',
    title: '优化营商环境 助力企业发展',
    image: 'https://picsum.photos/800/300?random=2',
    link: '/services',
  },
  {
    id: 'b3',
    title: '智慧政务 便民服务',
    image: 'https://picsum.photos/800/300?random=3',
    link: '/',
  },
];

export const quickServices: any[] = [
  { id: 'q1', name: '社保查询', icon: 'UserOutlined', link: '/services/1' },
  { id: 'q2', name: '身份证办理', icon: 'IdcardOutlined', link: '/services/2' },
  { id: 'q3', name: '企业注册', icon: 'BuildOutlined', link: '/services/3' },
  { id: 'q4', name: '不动产登记', icon: 'HomeOutlined', link: '/services/4' },
  { id: 'q5', name: '医保报销', icon: 'MedicineBoxOutlined', link: '/services/5' },
  { id: 'q6', name: '公积金提取', icon: 'WalletOutlined', link: '/services/6' },
  { id: 'q7', name: '出入境办理', icon: 'GlobalOutlined', link: '/services/7' },
  { id: 'q8', name: '驾驶证换证', icon: 'CarOutlined', link: '/services/8' },
];

export const departments = [
  '人力资源和社会保障局',
  '公安局',
  '市场监督管理局',
  '自然资源和规划局',
  '医疗保障局',
  '住房公积金管理中心',
  '出入境管理局',
  '交通警察支队',
  '税务局',
  '教育局',
  '残疾人联合会',
  '民政局',
  '卫生健康委员会',
  '园林绿化局',
];

export const themes = [
  '社保',
  '户政',
  '企业',
  '不动产',
  '医保',
  '公积金',
  '出入境',
  '交通',
  '税务',
  '教育',
  '民政',
  '就业',
  '卫生',
  '建设',
];
