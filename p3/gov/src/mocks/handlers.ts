import { http, HttpResponse } from 'msw';
import { serviceGuides, policies, notices, banners, quickServices } from './data';

export const handlers = [
  http.get('/api/guides', ({ request }) => {
    const url = new URL(request.url);
    const department = url.searchParams.get('department');
    const theme = url.searchParams.get('theme');
    const keyword = url.searchParams.get('keyword');

    let filtered = [...serviceGuides];

    if (department) {
      filtered = filtered.filter(item => item.department === department);
    }
    if (theme) {
      filtered = filtered.filter(item => item.theme === theme);
    }
    if (keyword) {
      filtered = filtered.filter(item =>
        item.name.includes(keyword) || item.description.includes(keyword)
      );
    }

    return HttpResponse.json(filtered);
  }),

  http.get('/api/guides/:id', ({ params }) => {
    const { id } = params;
    const guide = serviceGuides.find(item => item.id === id);

    if (!guide) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(guide);
  }),

  http.get('/api/policies', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const keyword = url.searchParams.get('keyword');

    let filtered = [...policies];

    if (keyword) {
      filtered = filtered.filter(item =>
        item.title.includes(keyword) || item.department.includes(keyword)
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = filtered.slice(start, end);

    return HttpResponse.json({
      list: paged,
      total: filtered.length,
    });
  }),

  http.get('/api/policies/:id', ({ params }) => {
    const { id } = params;
    const policy = policies.find(item => item.id === id);

    if (!policy) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(policy);
  }),

  http.get('/api/notices', () => {
    return HttpResponse.json(notices);
  }),

  http.post('/api/applications', async ({ request }) => {
    const body = await request.json();
    const now = new Date().toISOString().split('T')[0];
    const applicationId = `APP${Date.now()}`;

    const application = {
      id: applicationId,
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      applicantName: body.basicInfo?.name,
      applicantPhone: body.basicInfo?.phone,
      applyDate: now,
      status: 'submitted',
      statusText: '已提交',
      timeline: [
        {
          id: 't1',
          time: now,
          status: '已提交',
          description: '您的申请已成功提交，请等待审核',
        },
      ],
    };

    return HttpResponse.json(application);
  }),

  http.get('/api/applications/:id', ({ params }) => {
    const { id } = params;
    const now = new Date().toISOString().split('T')[0];

    const application = {
      id,
      serviceId: '1',
      serviceName: '社会保险查询',
      applicantName: '张三',
      applicantPhone: '13800138000',
      applyDate: '2024-09-01',
      status: 'reviewing',
      statusText: '审核中',
      correctionNote: '',
      timeline: [
        {
          id: 't1',
          time: '2024-09-01',
          status: '已提交',
          description: '您的申请已成功提交，请等待审核',
        },
        {
          id: 't2',
          time: '2024-09-02',
          status: '审核中',
          description: '工作人员正在审核您的申请材料',
        },
      ],
    };

    return HttpResponse.json(application);
  }),

  http.get('/api/applications/user', () => {
    const applications = [
      {
        id: 'APP202409010001',
        serviceId: '1',
        serviceName: '社会保险查询',
        applyDate: '2024-09-01',
        status: 'completed',
        statusText: '已办结',
      },
      {
        id: 'APP202409050002',
        serviceId: '6',
        serviceName: '公积金提取',
        applyDate: '2024-09-05',
        status: 'reviewing',
        statusText: '审核中',
      },
      {
        id: 'APP202409100003',
        serviceId: '2',
        serviceName: '身份证办理',
        applyDate: '2024-09-10',
        status: 'correction',
        statusText: '需补正',
        correctionNote: '请补充提供户口簿复印件',
      },
    ];

    return HttpResponse.json(applications);
  }),

  http.post('/api/consultations', async ({ request }) => {
    const body = await request.json();
    const now = new Date().toISOString().split('T')[0];

    const consultation = {
      id: `CS${Date.now()}`,
      type: body.type,
      title: body.title,
      content: body.content,
      contactPhone: body.contactPhone,
      createDate: now,
      status: 'pending',
    };

    return HttpResponse.json(consultation);
  }),

  http.get('/api/consultations/user', () => {
    const consultations = [
      {
        id: 'CS202409010001',
        type: 'consult',
        title: '社保缴费记录查询',
        content: '请问如何查询近5年的社保缴费记录？',
        contactPhone: '13800138000',
        createDate: '2024-09-01',
        status: 'replied',
        reply: '您好，您可以通过社保局官网或APP登录个人账号查询，也可以携带身份证到社保服务大厅查询。',
        replyDate: '2024-09-02',
      },
      {
        id: 'CS202409050002',
        type: 'suggestion',
        title: '优化办事流程建议',
        content: '建议简化办事材料清单，减少重复提交。',
        contactPhone: '13900139000',
        createDate: '2024-09-05',
        status: 'pending',
      },
    ];

    return HttpResponse.json(consultations);
  }),

  http.get('/api/banners', () => {
    return HttpResponse.json(banners);
  }),

  http.get('/api/quick-services', () => {
    return HttpResponse.json(quickServices);
  }),
];
