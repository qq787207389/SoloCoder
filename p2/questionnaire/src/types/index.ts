export type QuestionType = 'single' | 'multiple' | 'text';

export type QuestionOption = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: QuestionOption[];
  order: number;
};

export type QuestionnaireStatus = 'draft' | 'published' | 'closed';

export type Questionnaire = {
  id: string;
  title: string;
  description: string;
  status: QuestionnaireStatus;
  questions: Question[];
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  isTemplate?: boolean;
  templateName?: string;
};

export type SubmissionAnswer = {
  questionId: string;
  value: string | string[];
};

export type Submission = {
  id: string;
  questionnaireId: string;
  answers: SubmissionAnswer[];
  submittedAt: string;
};

export type QuestionnaireStats = {
  totalSubmissions: number;
  questionStats: {
    questionId: string;
    optionCounts?: { [optionId: string]: number };
    textAnswers?: string[];
  }[];
};
