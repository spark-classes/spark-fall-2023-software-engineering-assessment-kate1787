// src/utils/calculate_grade.ts
import { Enrollment } from "../types/api_types"; // Adjust this path as necessary
import { IUniversityClass, Assignment, StudentProfile } from "../types/api_types";

interface IStudentAssignment {
    assignmentId: string;
    grade: number;
}

interface IStudentGrade {
    studentId: string;
    finalGrade: number;
}




export const calculateFinalGrade = (
  studentId: string,
  assignmentsWeights: Record<string, number>,
  enrollments: Enrollment[]
): string => {
  const totalWeightedGrades = enrollments.reduce((acc, { courseId, finalGrade }) => {
    const weight = assignmentsWeights[courseId];
    // Ensure finalGrade is a number before attempting to multiply
    const numericGrade = typeof finalGrade === 'string' ? parseFloat(finalGrade) : finalGrade;
    return weight && numericGrade ? acc + (numericGrade * weight) : acc;
  }, 0);

  const totalWeight = enrollments.reduce((acc, { courseId }) => {
    const weight = assignmentsWeights[courseId];
    return weight ? acc + weight : acc;
  }, 0);

  return totalWeight ? (totalWeightedGrades / totalWeight).toFixed(1) : 'N/A';
};



// Mock function to fetch class data, ensuring all fields are properly populated.
async function fetchClassData(classId: string): Promise<IUniversityClass> {
    return {
        classId: classId,
        title: "Introduction to TypeScript",
        semester: "Fall 2024",
        description: "A class focused on learning TypeScript.",
        meetingTime: "Tuesdays at 10 AM",
        meetingLocation: "Room 101",
        status: "Active",
        assignments: [
            { assignmentId: "a1", classId: classId, submissionDate: "2024-10-01", weight: 50 },
            { assignmentId: "a2", classId: classId, submissionDate: "2024-10-15", weight: 50 }
        ],
        students: [
            {
                studentId: "001",
                studentName: "Alice",
                enrollments: [
                    { courseId: "a1", finalGrade: "80" },
                    { courseId: "a2", finalGrade: "90" }
                ]
            },
            {
                studentId: "002",
                studentName: "Bob",
                enrollments: [
                    { courseId: "a1", finalGrade: "70" },
                    { courseId: "a2", finalGrade: "85" }
                ]
            }
        ]
    };
}

export async function calculateStudentFinalGrade(
  studentID: string,
  classAssignments: IStudentAssignment[],
  klass: IUniversityClass
): Promise<number> {
    let finalGrade = 0;
    let totalWeight = 0;

    for (const assignment of classAssignments) {
        const classAssignment = klass.assignments.find(a => a.assignmentId === assignment.assignmentId);
        if (classAssignment) {
            finalGrade += assignment.grade * classAssignment.weight;
            totalWeight += classAssignment.weight;
        }
    }

    return totalWeight > 0 ? finalGrade / totalWeight : 0;
}

export async function calcAllFinalGrades(classID: string): Promise<IStudentGrade[]> {
    const classData = await fetchClassData(classID);
    const results: IStudentGrade[] = [];

    for (const student of classData.students) {
        const finalGrade = await calculateStudentFinalGrade(
            student.studentId,
            student.enrollments.map(e => ({ assignmentId: e.courseId, grade: parseFloat(e.finalGrade || '0') })),
            classData
        );
        results.push({
            studentId: student.studentId,
            finalGrade
        });
    }

    return results;
}
