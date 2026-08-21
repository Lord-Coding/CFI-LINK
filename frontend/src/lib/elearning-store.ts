/**
 * elearning-store.ts — Types uniquement
 * Les données E-Learning sont gérées par le backend via courseService.
 */
export interface LessonProgress {
    id:           number;
    student_id:   number;
    lesson_id:    number;
    course_id:    number;
    completed:    boolean;
    score?:       number;
    completed_at?: string;
}
