export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionType = 'single' | 'multiple' | 'fill' | 'coding'

export type SubmissionStatus = 'accepted' | 'wrong' | 'partial' | 'pending'

export interface TestCase {
  id: string
  input: string
  expected: string
  isHidden?: boolean
}

export interface Question {
  id: string
  number: number
  title: string
  description: string
  difficulty: Difficulty
  type: QuestionType
  tags: string[]
  passRate: number
  favorites: number
  submissions: number
  options?: string[]
  answer?: string | string[]
  explanation?: string
  testCases?: TestCase[]
  codeTemplate?: string
  hints?: string[]
  createdAt: string
}

export interface Submission {
  id: string
  questionId: string
  questionTitle: string
  status: SubmissionStatus
  code?: string
  runtime: number
  memory: number
  submittedAt: string
  testResults?: TestResult[]
}

export interface TestResult {
  testCaseId: string
  passed: boolean
  input: string
  expected: string
  actual: string
  error?: string
}

export interface User {
  id: string
  username: string
  avatar: string
  level: number
  streak: number
  dailyGoal: number
  joinedAt: string
}

export interface Comment {
  id: string
  questionId: string
  userId: string
  username: string
  avatar: string
  content: string
  likes: number
  liked: boolean
  replies?: Comment[]
  createdAt: string
}

export interface Note {
  id: string
  questionId: string
  questionTitle: string
  content: string
  updatedAt: string
}

export type Theme = 'light' | 'dark'
