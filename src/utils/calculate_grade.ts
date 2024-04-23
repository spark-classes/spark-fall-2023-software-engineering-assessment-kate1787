// src/utils/calculate_grade.ts
export const calculateFinalGrade = (gradesArray: number[], weightsArray: number[]): number => {
    let weightedSum = 0;


    // Calculate the weighted sum
    for (let i = 0; i < gradesArray.length; i++) {
        const grade = gradesArray[i];
        const weight = weightsArray[i];

        if (grade === null || grade === undefined || isNaN(grade)) {
            console.error(`Invalid grade encountered at index ${i}: ${grade}`);
            continue; // Skip invalid grades
        }

        if (weight === null || weight === undefined || isNaN(weight)) {
            console.error(`Invalid weight encountered at index ${i}: ${weight}`);
            continue; // Skip invalid weights
        }

        weightedSum += grade * (weight / 100); // Calculate weighted grade, assuming weight is a percentage
    }

    // Return the weighted sum without dividing by total weight
    return weightedSum;
};
