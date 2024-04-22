import React, { useEffect, useState, useCallback } from 'react';
import { Select, MenuItem, Typography, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IUniversityClass, Assignment, AssignmentWithWeight, GradesDataGridRow, StudentProfile } from './types/api_types';

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
        console.log('Class data fetched:', classData); // Log fetched class data
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
        console.log('Assignment data fetched:', assignmentData);
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
  
      if (studentResponse.ok) {
        const studentIds: string[] = await studentResponse.json();
  
        // Assuming your data has this structure based on the data types you've provided earlier
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
  
        const studentsGrades: { studentId: string; grades: { courseId: string; grade: number; }[]; name: string; }[] = await Promise.all(studentsGradesPromises);
  
        // Mapping to construct the new rows
        const newRows = studentsGrades.map(({ studentId, grades, name }) => {
          const finalGrade = grades.reduce((total: number, { courseId, grade }: { courseId: string; grade: number; }) => {
            const weight = assignmentWeights[courseId];
            return total + (grade * (weight ?? 0));
          }, 0);
  
          // Construct the row object with typed fields
          return {
            id: studentId,
            studentId: studentId,
            studentName: name, // Use the fetched name
            classId: classId,
            className: classes.find(cls => cls.classId === classId)?.title || 'Unknown',
            semester: classes.find(cls => cls.classId === classId)?.semester || 'Unknown',
            finalGrade: isNaN(finalGrade) ? 'N/A' : finalGrade.toFixed(1),
          };
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
            Classroom Overview
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
