const request = require('supertest');
const app = require('../src/app');
const database = require('../src/config/database');
const fs = require('fs');
const path = require('path');

// Load test data
const scenario1 = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'reconciliation/reconciliation-scenario-1.json'), 'utf8')
);

describe('Medication Reconciliation API', () => {
    let server;

    beforeAll(async () => {
        await database.initialize();
    });

    afterAll(async () => {
        await database.close();
        // Close any open handles
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    test('Test 1: Should reconcile medication with valid input', async () => {
        const response = await request(app)
            .post('/api/reconcile/medication')
            .send(scenario1)
        // .expect(200);

        // Log the response to see what's wrong
        if (response.status !== 200) {
            console.log('Response status:', response.status);
            console.log('Response body:', JSON.stringify(response.body, null, 2));
        }

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('reconciled_medication');
        expect(response.body).toHaveProperty('confidence_score');
        expect(response.body).toHaveProperty('reasoning');
        expect(response.body).toHaveProperty('recommended_actions');
        expect(response.body).toHaveProperty('clinical_safety_check');

        // Confidence score should be between 0 and 1
        expect(response.body.confidence_score).toBeGreaterThanOrEqual(0);
        expect(response.body.confidence_score).toBeLessThanOrEqual(1);
    }, 30000); // 30 second timeout for AI

    test('Test 2: Should reject invalid input (missing patient_context)', async () => {
        const invalidData = {
            sources: scenario1.sources
        };

        const response = await request(app)
            .post('/api/reconcile/medication')
            .send(invalidData)
            .expect(400);

        expect(response.body).toHaveProperty('errors');
    });

    test('Test 3: Should reject invalid input (empty sources array)', async () => {
        const invalidData = {
            patient_context: scenario1.patient_context,
            sources: []
        };

        const response = await request(app)
            .post('/api/reconcile/medication')
            .send(invalidData)
            .expect(400);

        expect(response.body).toHaveProperty('errors');
    });
});
