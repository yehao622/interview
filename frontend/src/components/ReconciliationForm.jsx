import React, { useState } from 'react';

function ReconciliationForm({ onSubmit, loading }) {
    const [patientContext, setPatientContext] = useState({
        age: 67,
        conditions: ['Type 2 Diabetes', 'Hypertension'],
        recent_labs: { eGFR: 45 }
    });

    const [sources, setSources] = useState([
        {
            system: 'Hospital EHR',
            medication: 'Metformin 1000mg twice daily',
            last_updated: '2024-10-15',
            source_reliability: 'high'
        }
    ]);

    const addSource = () => {
        setSources([...sources, {
            system: '',
            medication: '',
            last_updated: '',
            source_reliability: 'medium'
        }]);
    };

    const removeSource = (index) => {
        setSources(sources.filter((_, i) => i !== index));
    };

    const updateSource = (index, field, value) => {
        const newSources = [...sources];
        newSources[index][field] = value;
        setSources(newSources);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            patient_context: {
                ...patientContext,
                conditions: patientContext.conditions.filter(c => c.trim())
            },
            sources
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="card">
                <h3>Patient Context</h3>

                <div className="form-group">
                    <label>Age</label>
                    <input
                        type="number"
                        value={patientContext.age}
                        onChange={(e) => setPatientContext({ ...patientContext, age: parseInt(e.target.value) })}
                        required
                        min="0"
                        max="120"
                    />
                </div>

                <div className="form-group">
                    <label>Conditions (comma-separated)</label>
                    <input
                        type="text"
                        value={patientContext.conditions.join(', ')}
                        onChange={(e) => setPatientContext({
                            ...patientContext,
                            conditions: e.target.value.split(',').map(c => c.trim())
                        })}
                        placeholder="Type 2 Diabetes, Hypertension"
                    />
                </div>

                <div className="form-group">
                    <label>Recent Labs (eGFR)</label>
                    <input
                        type="number"
                        value={patientContext.recent_labs.eGFR}
                        onChange={(e) => setPatientContext({
                            ...patientContext,
                            recent_labs: { eGFR: parseInt(e.target.value) }
                        })}
                        placeholder="45"
                    />
                </div>
            </div>

            <div className="card">
                <h3>Medication Sources</h3>

                {sources.map((source, index) => (
                    <div key={index} style={{ border: '1px solid #e0e0e0', padding: '15px', marginBottom: '15px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0 }}>Source {index + 1}</h4>
                            {sources.length > 1 && (
                                <button type="button" className="btn-secondary" onClick={() => removeSource(index)}>
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="form-group">
                            <label>System Name</label>
                            <input
                                type="text"
                                value={source.system}
                                onChange={(e) => updateSource(index, 'system', e.target.value)}
                                placeholder="Hospital EHR, Primary Care, Pharmacy"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Medication</label>
                            <input
                                type="text"
                                value={source.medication}
                                onChange={(e) => updateSource(index, 'medication', e.target.value)}
                                placeholder="Metformin 500mg twice daily"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Last Updated</label>
                            <input
                                type="date"
                                value={source.last_updated}
                                onChange={(e) => updateSource(index, 'last_updated', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Source Reliability</label>
                            <select
                                value={source.source_reliability}
                                onChange={(e) => updateSource(index, 'source_reliability', e.target.value)}
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>
                ))}

                <button type="button" className="btn-secondary" onClick={addSource}>
                    + Add Source
                </button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Reconciling...' : 'Reconcile Medications'}
            </button>
        </form>
    );
}

export default ReconciliationForm;
