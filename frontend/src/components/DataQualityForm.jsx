import React, { useState } from 'react';

function DataQualityForm({ onSubmit, loading }) {
    const [patientData, setPatientData] = useState({
        demographics: {
            name: 'John Doe',
            dob: '1955-03-15',
            gender: 'M'
        },
        medications: ['Metformin 500mg', 'Lisinopril 10mg'],
        allergies: [],
        conditions: ['Type 2 Diabetes'],
        vital_signs: {
            blood_pressure: '340/180',
            heart_rate: 72
        },
        last_updated: '2024-06-15'
    });

    const [jsonMode, setJsonMode] = useState(false);
    const [jsonInput, setJsonInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (jsonMode) {
            try {
                const parsed = JSON.parse(jsonInput);
                onSubmit(parsed);
            } catch (error) {
                alert('Invalid JSON format. Please check your input.');
            }
        } else {
            onSubmit(patientData);
        }
    };

    const loadSample = () => {
        const sample = {
            demographics: {
                name: 'Jane Smith',
                dob: '1960-08-22',
                gender: 'F'
            },
            medications: ['Aspirin 81mg', 'Atorvastatin 20mg'],
            allergies: ['Penicillin'],
            conditions: ['Hypertension', 'Hyperlipidemia'],
            vital_signs: {
                blood_pressure: '145/92',
                heart_rate: 78,
                temperature: 98.6
            },
            last_updated: '2026-01-15'
        };

        if (jsonMode) {
            setJsonInput(JSON.stringify(sample, null, 2));
        } else {
            setPatientData(sample);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Patient Data</h3>
                    <div>
                        <button type="button" className="btn-secondary" onClick={loadSample}>
                            Load Sample
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setJsonMode(!jsonMode)}
                            style={{ marginLeft: '10px' }}
                        >
                            {jsonMode ? 'Form Mode' : 'JSON Mode'}
                        </button>
                    </div>
                </div>

                {!jsonMode ? (
                    <>
                        <h4>Demographics</h4>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={patientData.demographics.name}
                                onChange={(e) => setPatientData({
                                    ...patientData,
                                    demographics: { ...patientData.demographics, name: e.target.value }
                                })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                value={patientData.demographics.dob}
                                onChange={(e) => setPatientData({
                                    ...patientData,
                                    demographics: { ...patientData.demographics, dob: e.target.value }
                                })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                value={patientData.demographics.gender}
                                onChange={(e) => setPatientData({
                                    ...patientData,
                                    demographics: { ...patientData.demographics, gender: e.target.value }
                                })}
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>

                        <h4 style={{ marginTop: '20px' }}>Clinical Data</h4>
                        <div className="form-group">
                            <label>Medications (comma-separated)</label>
                            <input
                                type="text"
                                value={patientData.medications.join(', ')}
                                onChange={(e) => setPatientData({
                                    ...patientData,
                                    medications: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                                })}
                                placeholder="Metformin 500mg, Lisinopril 10mg"
                            />
                        </div>

                        <div className="form-group">
                            <label>Allergies (comma-separated)</label>
                            <input
                                type="text"
                                value={patientData.allergies.join(', ')}
                                onChange={(e) => setPatientData({
                                    ...patientData,
                                    allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                                })}
                                placeholder="Penicillin, Sulfa drugs"
                            />
                        </div>

                        <div className="form-group">
                            <label>Conditions (comma-separated)</label>
                            <input
                                type="text"
                                value={patientData.conditions.join(', ')}
                                onChange={(e) => setPatientData({
                                    ...patientData,
                                    conditions: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                                })}
                                placeholder="Type 2 Diabetes, Hypertension"
                            />
                        </div>

                        <h4 style={{ marginTop: '20px' }}>Vital Signs</h4>
                        <div className="form-group">
                            <label>Blood Pressure</label>
                            <input
                                type="text"
                                value={patientData.vital_signs.blood_pressure}
                                onChange={(e) => setPatientData({
                                    ...patientData,
                                    vital_signs: { ...patientData.vital_signs, blood_pressure: e.target.value }
                                })}
                                placeholder="120/80"
                            />
                        </div>

                        <div className="form-group">
                            <label>Heart Rate</label>
                            <input
                                type="number"
                                value={patientData.vital_signs.heart_rate}
                                onChange={(e) => setPatientData({
                                    ...patientData,
                                    vital_signs: { ...patientData.vital_signs, heart_rate: parseInt(e.target.value) }
                                })}
                                placeholder="72"
                            />
                        </div>

                        <div className="form-group">
                            <label>Last Updated</label>
                            <input
                                type="date"
                                value={patientData.last_updated}
                                onChange={(e) => setPatientData({ ...patientData, last_updated: e.target.value })}
                            />
                        </div>
                    </>
                ) : (
                    <div className="form-group">
                        <label>JSON Input</label>
                        <textarea
                            value={jsonInput || JSON.stringify(patientData, null, 2)}
                            onChange={(e) => setJsonInput(e.target.value)}
                            style={{ minHeight: '400px', fontFamily: 'monospace' }}
                            placeholder='{"demographics": {...}, "medications": [...], ...}'
                        />
                    </div>
                )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Validating...' : 'Validate Data Quality'}
            </button>
        </form>
    );
}

export default DataQualityForm;
