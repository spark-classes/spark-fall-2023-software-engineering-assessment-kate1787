// api_types.ts

export interface IUniversityClass {
  classId: string;
  title: string;
  semester: string;
  description?: string;
  meetingTime?: string;
  meetingLocation?: string;
  status?: string;
  assignments: Assignment[];
  students: StudentProfile[];
}

export interface Assignment {
  assignmentId: string;
  classId: string;
  submissionDate: string;
  weight: number;
}

export interface AssignmentWithWeight {
  assignmentId: string;
  weight: number;
}

export interface StudentProfile {
  studentId: string;
  studentName: string;
  enrollments: Enrollment[];
}

export interface Enrollment {
  courseId: string;
  finalGrade?: string;
}

// Define a new interface for the data grid rows
export interface GradesDataGridRow {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  semester: string;
  finalGrade: string;
}
