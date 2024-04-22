import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { GradesDataGridRow } from '../types/api_types'; // Ensure this import path is correct based on your project structure

/**
 * Generate dummy data for testing the GradeTable component.
 */
export function dummyData(): GradesDataGridRow[] {
    // Sample data structure based on your api_types.ts definitions
    return [
        { id: '1', studentId: 'S1001', studentName: 'Alice', classId: 'C101', className: 'Math 101', semester: 'Fall 2023', finalGrade: '88.2' },
        { id: '2', studentId: 'S1002', studentName: 'Bob', classId: 'C102', className: 'History 101', semester: 'Fall 2023', finalGrade: '91.5' },
        { id: '3', studentId: 'S1003', studentName: 'Charlie', classId: 'C103', className: 'Science 101', semester: 'Fall 2023', finalGrade: '76.4' }
    ];
}

interface GradeTableProps {
    rows: GradesDataGridRow[];
}

/**
 * Component to display the table of grades using Material-UI DataGrid.
 * @param {GradeTableProps} props The properties passed to the component, including 'rows'.
 */
export const GradeTable = ({ rows }: GradeTableProps) => {
    const columns: GridColDef[] = [
        { field: 'studentId', headerName: 'Student ID', width: 110 },
        { field: 'studentName', headerName: 'Student Name', width: 150 },
        { field: 'classId', headerName: 'Class ID', width: 110 },
        { field: 'className', headerName: 'Class Name', width: 150 },
        { field: 'semester', headerName: 'Semester', width: 120 },
        { field: 'finalGrade', headerName: 'Final Grade', width: 110 }
    ];

    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
            />
        </div>
    );
};
