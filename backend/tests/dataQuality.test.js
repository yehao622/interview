const fs = require('fs');
const path = require('path');

// Load test data
const goodData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'quality/data-quality-good.json'), 'utf8')
);
const poorData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'quality/data-quality-poor.json'), 'utf8')
);
const emptyData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'quality/data-quality-empty.json'), 'utf8')
);

describe('Data Quality Logic', () => {
    test('Test 4: Should detect implausible vital signs (BP 340/180)', () => {
        const issues = [];

        // Extract blood pressure
        const bp = poorData.vital_signs?.blood_pressure;
        if (bp) {
            const [systolic, diastolic] = bp.split('/').map(Number);

            // Check plausibility
            if (systolic > 250 || systolic < 60 || diastolic > 150 || diastolic < 40) {
                issues.push({
                    field: 'vital_signs.blood_pressure',
                    issue: `Blood pressure ${bp} is physiologically implausible`,
                    severity: 'high'
                });
            }
        }

        // Should detect the issue
        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0].severity).toBe('high');
    });

    test('Test 5: Empty data should have missing critical fields', () => {
        const requiredFields = [
            'demographics.name',
            'demographics.dob',
            'demographics.gender',
            'medications',
            'conditions',
            'vital_signs'
        ];

        let missingCount = 0;

        // Check demographics
        if (!emptyData.demographics || Object.keys(emptyData.demographics).length === 0) {
            missingCount += 3; // name, dob, gender
        }

        // Check arrays
        if (!emptyData.medications || emptyData.medications.length === 0) missingCount++;
        if (!emptyData.conditions || emptyData.conditions.length === 0) missingCount++;
        if (!emptyData.vital_signs || Object.keys(emptyData.vital_signs).length === 0) missingCount++;

        // Empty data should be missing most fields
        expect(missingCount).toBeGreaterThanOrEqual(4);
    });
});
