/**
 * courses-data.ts — Types uniquement (rétrocompatibilité)
 * Les cours et leçons sont maintenant gérés par le backend via courseService.ts
 */

export type { ApiCourse as CourseData, ApiLesson as Lesson } from './services/courseService';

export interface QuizQuestion {
    id:           string;
    question:     string;
    options:      string[];
    correctIndex: number;
}
