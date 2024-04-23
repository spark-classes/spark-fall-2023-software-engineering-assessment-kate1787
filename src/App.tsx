import React, { useEffect, useState, useCallback } from 'react';
import { Select, MenuItem, Typography, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IUniversityClass, Assignment, AssignmentWithWeight, GradesDataGridRow, StudentProfile } from './types/api_types';
import { calculateFinalGrade } from './utils/calculate_grade';


function App() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classes, setClasses] = useState<IUniversityClass[]>([]);
  const [dataGridRows, setDataGridRows] = useState<GradesDataGridRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dataGridColumns: GridColDef[] = [
    { field: 'studentId', headerName: 'Student ID', width: 110 },
    { field: 'studentName', headerName: 'Student Name', width: 130 },
    { field: 'classId', headerName: 'Class ID', width: 100 },
    { field: 'className', headerName: 'Class Name', width: 130 },
    { field: 'semester', headerName: 'Semester', width: 100 },
    { field: 'finalGrade', headerName: 'Final Grade', width: 110 },
  ];

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          'https://spark-se-assessment-api.azurewebsites.net/api/class/listBySemester/fall2022?buid=U96403846', {
            headers: {
              'accept': 'application/json',
              'x-functions-key': '6se7z2q8WGtkxBlXp_YpU-oPq53Av-y_GSYiKyS_COn6AzFuTjj4BQ==',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch class list');
        const classData = await response.json();
        setClasses(classData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);


  const fetchGradesForClass = useCallback(async (classId: string) => {
    setIsLoading(true);
    try {
      const assignmentResponse = await fetch(
        `https://spark-se-assessment-api.azurewebsites.net/api/class/listAssignments/${classId}?buid=U96403846`, {
          headers: {
            'accept': 'application/json',
            'x-functions-key': '6se7z2q8WGtkxBlXp_YpU-oPq53Av-y_GSYiKyS_COn6AzFuTjj4BQ==',
          },
      });

  
      let assignmentWeights: Record<string, number> = {};
      if (assignmentResponse.ok) {
        const assignmentData: AssignmentWithWeight[] = await assignmentResponse.json();

      // Accumulate the weights for each assignment
      assignmentWeights = assignmentData.reduce((accumulator: Record<string, number>, { assignmentId, weight }) => {
        accumulator[assignmentId] = weight;
        return accumulator;
      }, {});

    } else {
      throw new Error(`Failed to fetch assignments: ${assignmentResponse.statusText}`);
    }
  
      const studentResponse = await fetch(
        `https://spark-se-assessment-api.azurewebsites.net/api/class/listStudents/${classId}?buid=U96403846`, {
          headers: {
            'accept': 'application/json',
            'x-functions-key': '6se7z2q8WGtkxBlXp_YpU-oPq53Av-y_GSYiKyS_COn6AzFuTjj4BQ==',
          },
      });
  
      // Fetching student IDs
      if (studentResponse.ok) {
        const studentIds: string[] = await studentResponse.json();
        const studentsGradesPromises = studentIds.map(async (studentId: string) => {
          const gradesResponse = await fetch(`https://spark-se-assessment-api.azurewebsites.net/api/student/listGrades/${studentId}/${classId}?buid=U96403846`, {
            headers: {
              'accept': 'application/json',
              'x-functions-key': '6se7z2q8WGtkxBlXp_YpU-oPq53Av-y_GSYiKyS_COn6AzFuTjj4BQ==',
            },
          });
          if (!gradesResponse.ok) {
            throw new Error(`Failed to fetch grades for student ID ${studentId}`);
          }
          return gradesResponse.json();
        });

            type GradeInfo = {
              courseId: string;
              grade?: number;
              name: string;
            };
  
            const studentsGrades: { studentId: string; grades: GradeInfo[]; name: string; }[] = await Promise.all(studentsGradesPromises);

            let newRows = studentsGrades.map(({ studentId, grades, name }) => {
              const gradeObject = grades[0] as Record<string, any>;
              const courseIds = Object.keys(gradeObject);
              const gradesArray = courseIds.map(courseId => Number(gradeObject[courseId]));
              const weightsArray = courseIds.map(courseId => assignmentWeights[courseId] ?? 0);
        
              // Calculate the final grade
              const finalGradeNumber = calculateFinalGrade(gradesArray, weightsArray);
        
              const finalGrade = isNaN(finalGradeNumber) ? 'N/A' : finalGradeNumber.toFixed(1);
        
              return {
                id: studentId,
                studentId: studentId,
                studentName: name,
                classId: classId,
                className: classes.find(cls => cls.classId === classId)?.title || 'Unknown',
                semester: classes.find(cls => cls.classId === classId)?.semester || 'Unknown',
                finalGrade,
              };
            });

            // Sort the rows by studentId in ascending order
            newRows = newRows.sort((a, b) => {
              const idA = parseInt(a.studentId.substring(1), 10);
              const idB = parseInt(b.studentId.substring(1), 10);
              return idA - idB; // Sort in ascending order
            });
  
        setDataGridRows(newRows);
      } else {
        throw new Error(`Failed to fetch student grades: ${studentResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [classes]);
  

  useEffect(() => {
    if (selectedClassId) {
      fetchGradesForClass(selectedClassId);
    }
  }, [selectedClassId, fetchGradesForClass]);

  const pageSizeOptions = [9, 25, 50, 100];
  const [pageSize, setPageSize] = useState<number>(pageSizeOptions[0]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Grid container spacing={2} padding={2}>
        <Grid item xs={12} display="flex" justifyContent="center">
          <Typography variant="h2" gutterBottom>
            Spark Assessment
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h4" gutterBottom>
            Select a Class
          </Typography>
          <Select
            fullWidth
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            label="Class"
          >
            {classes.map((cls) => (
              <MenuItem key={cls.classId} value={cls.classId}>
                {cls.title}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} md={8} style={{ height: 650 }}>
          <Typography variant="h4" gutterBottom>
            Final Grades
          </Typography>
          {isLoading ? (
            <Typography>Loading...</Typography>
          ) : (
            <DataGrid
              rows={dataGridRows}
              columns={dataGridColumns}
              pagination
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              rowsPerPageOptions={pageSizeOptions}
              autoHeight
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
