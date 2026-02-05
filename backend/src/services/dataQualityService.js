const GeminiService = require('./geminiService');

class DataQualityService {
    static async assessQuality(patientData) {
        // Get AI assessment
        const aiIssues = await GeminiService.assessDataQuality(patientData);

        // Calculate scores for each dimension
        const completenessScore = this.calculateCompletenessScore(patientData, aiIssues.completeness_issues);
        const accuracyScore = this.calculateAccuracyScore(patientData, aiIssues.accuracy_issues);
        const timelinessScore = this.calculateTimelinessScore(patientData, aiIssues.timeliness_issues);
        const plausibilityScore = this.calculatePlausibilityScore(patientData, aiIssues.plausibility_issues);

        // Calculate overall score (weighted average)
        const overallScore = Math.round(
            completenessScore * 0.30 +
            accuracyScore * 0.25 +
            timelinessScore * 0.20 +
            plausibilityScore * 0.25
        );

        // Build issues array with severity
        const issuesDetected = this.buildIssuesArray(aiIssues, patientData);

        return {
            overall_score: overallScore,
            breakdown: {
                completeness: completenessScore,
                accuracy: accuracyScore,
                timeliness: timelinessScore,
                clinical_plausibility: plausibilityScore
            },
            issues_detected: issuesDetected
        };
    }

    // Calculate completeness score (0-100)
    static calculateCompletenessScore(data, issues) {
        const requiredFields = ['name', 'dob', 'gender', 'medications', 'allergies', 'conditions', 'vital_signs'];
        const demographics = data.demographics || {};

        let presentFields = 0;
        if (demographics.name) presentFields++;
        if (demographics.dob) presentFields++;
        if (demographics.gender) presentFields++;
        if (data.medications?.length > 0) presentFields++;
        if (data.allergies?.length > 0) presentFields++;
        if (data.conditions?.length > 0) presentFields++;
        if (data.vital_signs && Object.keys(data.vital_signs).length > 0) presentFields++;

        const baseScore = (presentFields / requiredFields.length) * 100;
        const penalty = issues.length * 5; // -5 points per missing field

        return Math.max(0, Math.round(baseScore - penalty));
    }

    // Calculate accuracy score (0-100)
    static calculateAccuracyScore(data, issues) {
        let score = 100;

        // Check if data is essentially empty
        const isEmpty = !data.demographics &&
            (!data.medications || data.medications.length === 0) &&
            (!data.conditions || data.conditions.length === 0) &&
            !data.vital_signs;

        if (isEmpty) return 0;

        // Deduct points for format/validation issues
        issues.forEach(issue => {
            if (issue.includes('format') || issue.includes('invalid')) {
                score -= 15;
            } else {
                score -= 10;
            }
        });

        return Math.max(0, score);
    }

    // Calculate timeliness score (0-100)
    static calculateTimelinessScore(data, issues) {
        if (!data.last_updated) return 50; // Unknown = medium score

        const lastUpdated = new Date(data.last_updated);
        const now = new Date();
        const daysSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60 * 24);

        let score = 100;
        if (daysSinceUpdate > 180) {
            score = 30;
        } else if (daysSinceUpdate > 90) {
            score = 50;
        } else if (daysSinceUpdate > 30) {
            score = 70;
        }

        const penalty = issues.length * 10;
        return Math.max(0, score - penalty);
    }

    // Calculate plausibility score (0-100)
    static calculatePlausibilityScore(data, issues) {
        // Check if data is essentially empty
        const isEmpty = !data.demographics &&
            (!data.medications || data.medications.length === 0) &&
            (!data.conditions || data.conditions.length === 0) &&
            !data.vital_signs;

        if (isEmpty) return 0;

        let score = 100;

        // Hard-coded checks for physiologically impossible values
        const vitalSigns = data.vital_signs || {};

        // Blood pressure check
        if (vitalSigns.blood_pressure) {
            const [systolic, diastolic] = vitalSigns.blood_pressure.split('/').map(Number);
            if (systolic > 250 || systolic < 60 || diastolic > 150 || diastolic < 40) {
                score -= 40;
            }
        }

        // Heart rate check
        if (vitalSigns.heart_rate) {
            const hr = Number(vitalSigns.heart_rate);
            if (hr > 220 || hr < 30) {
                score -= 30;
            }
        }

        // Temperature check (if exists)
        if (vitalSigns.temperature) {
            const temp = Number(vitalSigns.temperature);
            if (temp > 110 || temp < 90) { // Fahrenheit
                score -= 30;
            }
        }

        // AI-detected issues
        const penalty = issues.length * 15;

        return Math.max(0, score - penalty);
    }

    // Build structured issues array
    static buildIssuesArray(aiIssues, patientData) {
        const issues = [];

        // Completeness issues
        aiIssues.completeness_issues?.forEach(issue => {
            issues.push({
                field: this.extractFieldName(issue),
                issue: issue,
                severity: 'medium'
            });
        });

        // Accuracy issues
        aiIssues.accuracy_issues?.forEach(issue => {
            issues.push({
                field: this.extractFieldName(issue),
                issue: issue,
                severity: 'medium'
            });
        });

        // Plausibility issues (HIGH severity)
        aiIssues.plausibility_issues?.forEach(issue => {
            issues.push({
                field: this.extractFieldName(issue),
                issue: issue,
                severity: 'high'
            });
        });

        // Timeliness issues
        aiIssues.timeliness_issues?.forEach(issue => {
            issues.push({
                field: this.extractFieldName(issue),
                issue: issue,
                severity: 'medium'
            });
        });

        return issues;
    }

    // Extract field name from issue description
    static extractFieldName(issueText) {
        const lowerText = issueText.toLowerCase();

        if (lowerText.includes('blood pressure') || lowerText.includes('blood_pressure')) return 'vital_signs.blood_pressure';
        if (lowerText.includes('heart rate')) return 'vital_signs.heart_rate';
        if (lowerText.includes('temperature')) return 'vital_signs.temperature';
        if (lowerText.includes('allerg')) return 'allergies';
        if (lowerText.includes('medication')) return 'medications';
        if (lowerText.includes('condition')) return 'conditions';
        if (lowerText.includes('last_updated') || lowerText.includes('updated')) return 'last_updated';
        if (lowerText.includes('demographics')) return 'demographics';

        return 'unknown';
    }
}

module.exports = DataQualityService;
