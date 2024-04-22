import React, { useEffect, useState, useCallback } from "react";
import { Select, MenuItem, Typography, Grid } from "@mui/material";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IUniversityClass, Assignment, GradesDataGridRow, StudentProfile } from "./types/api_types";
import { calculateFinalGrade } from "./utils/calculate_grade"; 


function App() {
  const [currentClassId, setCurrentClassId] = useState<string>("");
  const [classList, setClassList] = useState<IUniversityClass[]>([]);
  const [rows, setRows] = useState<GradesDataGridRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const columns: GridColDef[] = [
    { field: 'studentId', headerName: 'Student ID', width: 110 },
    { field: 'studentName', headerName: 'Student Name', width: 130 },
    { field: 'classId', headerName: 'Class ID', width: 100 },
    { field: 'className', headerName: 'Class Name', width: 130 },
    { field: 'semester', headerName: 'Semester', width: 100 },
    { field: 'finalGrade', headerName: 'Final Grade', width: 110 }
  ];

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://spark-se-assessment-api.azurewebsites.net/api/class/listBySemester/fall2022?buid=U11586865', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-functions-key': '6se7z2q8WGtkxBlXp_YpU-oPq53Av-y_GSYiKyS_COn6AzFuTjj4BQ==',
        }
      });
      if (!response.ok) throw new Error('Failed to fetch class list');
      const classesData = await response.json() as IUniversityClass[];
      setClassList(classesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchGradesForClass = useCallback(async (classId: string) => {
    setLoading(true);
    try {
      const assignmentsResponse = await fetch(`https://spark-se-assessment-api.azurewebsites.net/api/class/listAssignments/${classId}?buid=U11586865`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-functions-key': '6se7z2q8WGtkxBlXp_YpU-oPq53Av-y_GSYiKyS_COn6AzFuTjj4BQ==',
        }
      });
      if (!assignmentsResponse.ok) throw new Error('Failed to fetch assignments');
      
      const assignments: Assignment[] = await assignmentsResponse.json();
      const assignmentsWeights = assignments.reduce<Record<string, number>>((acc, current) => {
        acc[current.assignmentId] = current.weight;
        return acc;
      }, {});

      const gradesResponse = await fetch(`https://spark-se-assessment-api.azurewebsites.net/api/class/listStudents/${classId}?buid=U11586865`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-functions-key': '6se7z2q8WGtkxBlXp_YpU-oPq53Av-y_GSYiKyS_COn6AzFuTjj4BQ==',
        }
      });
      if (!gradesResponse.ok) throw new Error('Failed to fetch student grades');

      const students: StudentProfile[] = await gradesResponse.json();
      const newRows: GradesDataGridRow[] = students.map(student => ({
        id: student.studentId,
        studentId: student.studentId,
        studentName: student.studentName,
        classId: classId,
        className: classList.find(cls => cls.classId === classId)?.title || 'Unknown',
        semester: classList.find(cls => cls.classId === classId)?.semester || 'Unknown',
        finalGrade: calculateFinalGrade(student.studentId, assignmentsWeights, student.enrollments)
      }));
      setRows(newRows);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [classList]);

  useEffect(() => {
    if (currentClassId) {
      fetchGradesForClass(currentClassId);
    }
  }, [currentClassId, fetchGradesForClass]);



  const [pageSize, setPageSize] = useState<number>(9);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Grid container spacing={2} style={{ padding: "1rem" }}>
        <Grid item xs={12} container alignItems="center" justifyContent="center">
          <Typography variant="h2">Classroom Overview</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h4">Select a Class</Typography>
          <Select
            fullWidth
            value={currentClassId}
            onChange={(e) => {
              setCurrentClassId(e.target.value as string);
            }}
            label="Class"
          >
            {classList.map((cls) => (
              <MenuItem key={cls.classId} value={cls.classId}>{cls.title}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h4">Final Grades</Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              rowsPerPageOptions={[9, 25, 50, 100]}
              pagination
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
