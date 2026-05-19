import { http, HttpResponse } from 'msw';
import { mockQuestionnaires, mockSubmissions, mockTemplates } from './data';
import type { Questionnaire, Submission } from '../types';
import dayjs from 'dayjs';

let questionnaires = [...mockQuestionnaires];
let submissions = [...mockSubmissions];

const generateId = () => Math.random().toString(36).substr(2, 9);

export const handlers = [
  http.get('/api/questionnaires', () => {
    return HttpResponse.json(questionnaires);
  }),

  http.get('/api/questionnaires/:id', ({ params }) => {
    const { id } = params;
    const questionnaire = questionnaires.find((q) => q.id === id);
    if (!questionnaire) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(questionnaire);
  }),

  http.post('/api/questionnaires', async ({ request }) => {
    const newQuestionnaire = (await request.json()) as Questionnaire;
    newQuestionnaire.id = generateId();
    newQuestionnaire.createdAt = dayjs().toISOString();
    newQuestionnaire.updatedAt = dayjs().toISOString();
    questionnaires.push(newQuestionnaire);
    return HttpResponse.json(newQuestionnaire);
  }),

  http.put('/api/questionnaires/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedData = (await request.json()) as Questionnaire;
    const index = questionnaires.findIndex((q) => q.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    questionnaires[index] = {
      ...updatedData,
      updatedAt: dayjs().toISOString(),
    };
    return HttpResponse.json(questionnaires[index]);
  }),

  http.delete('/api/questionnaires/:id', ({ params }) => {
    const { id } = params;
    questionnaires = questionnaires.filter((q) => q.id !== id);
    submissions = submissions.filter((s) => s.questionnaireId !== id);
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/questionnaires/:id/copy', ({ params }) => {
    const { id } = params;
    let original = questionnaires.find((q) => q.id === id);
    if (!original) {
      original = mockTemplates.find((t) => t.id === id);
    }
    if (!original) {
      return new HttpResponse(null, { status: 404 });
    }
    const copy: Questionnaire = {
      ...JSON.parse(JSON.stringify(original)),
      id: generateId(),
      title: `${original.title} (副本)`,
      status: 'draft',
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    };
    questionnaires.push(copy);
    return HttpResponse.json(copy);
  }),

  http.get('/api/templates', () => {
    return HttpResponse.json(mockTemplates);
  }),

  http.get('/api/questionnaires/:id/submissions', ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let filtered = submissions.filter((s) => s.questionnaireId === id);

    if (startDate) {
      filtered = filtered.filter((s) => dayjs(s.submittedAt).isAfter(dayjs(startDate)));
    }
    if (endDate) {
      filtered = filtered.filter((s) => dayjs(s.submittedAt).isBefore(dayjs(endDate)));
    }

    return HttpResponse.json(filtered);
  }),

  http.get('/api/questionnaires/:id/stats', ({ params }) => {
    const { id } = params;
    const questionnaire = questionnaires.find((q) => q.id === id);
    if (!questionnaire) {
      return new HttpResponse(null, { status: 404 });
    }

    const questionnaireSubmissions = submissions.filter((s) => s.questionnaireId === id);

    const questionStats = questionnaire.questions.map((question) => {
      const stat: any = {
        questionId: question.id,
      };

      if (question.type === 'single' || question.type === 'multiple') {
        stat.optionCounts = {};
        question.options?.forEach((option) => {
          stat.optionCounts[option.id] = 0;
        });

        questionnaireSubmissions.forEach((submission) => {
          const answer = submission.answers.find((a) => a.questionId === question.id);
          if (answer) {
            if (Array.isArray(answer.value)) {
              answer.value.forEach((v) => {
                if (stat.optionCounts[v] !== undefined) {
                  stat.optionCounts[v]++;
                }
              });
            } else {
              if (stat.optionCounts[answer.value] !== undefined) {
                stat.optionCounts[answer.value]++;
              }
            }
          }
        });
      } else {
        stat.textAnswers = questionnaireSubmissions
          .map((submission) => {
            const answer = submission.answers.find((a) => a.questionId === question.id);
            return answer?.value as string;
          })
          .filter((v) => v);
      }

      return stat;
    });

    return HttpResponse.json({
      totalSubmissions: questionnaireSubmissions.length,
      questionStats,
    });
  }),

  http.post('/api/questionnaires/:id/submit', async ({ params, request }) => {
    const { id } = params;
    const answerData = (await request.json()) as Submission['answers'];
    const newSubmission: Submission = {
      id: generateId(),
      questionnaireId: id as string,
      answers: answerData,
      submittedAt: dayjs().toISOString(),
    };
    submissions.push(newSubmission);
    return HttpResponse.json(newSubmission);
  }),
];
