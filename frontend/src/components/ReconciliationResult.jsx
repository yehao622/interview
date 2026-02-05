import React from 'react';

function ReconciliationResult({ result, onReset }) {
    const getConfidenceLevel = (score) => {
        if (score >= 0.8) return 'high';
        if (score >= 0.5) return 'medium';
        return 'low';
    };

    const confidenceLevel = getConfidenceLevel(result.confidence_score);
    const confidencePercent = Math.round(result.confidence_score * 100);

    return (
        <div>
            <div className="card">
                <h2>Reconciliation Result</h2>

                <div style={{ background: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px', color: '#333' }}>Reconciled Medication</h3>
                    <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#667eea', margin: 0 }}>
                        {result.reconciled_medication}
                    </p>
                </div>

                <div className="confidence-score">
                    <span className="confidence-label">{confidencePercent}%</span>
                    <div className="confidence-bar">
                        <div
                            className={`confidence-fill ${confidenceLevel}`}
                            style={{ width: `${confidencePercent}%` }}
                        />
                    </div>
                    <span className={`badge badge-${confidenceLevel === 'high' ? 'success' : confidenceLevel === 'medium' ? 'warning' : 'danger'}`}>
                        {confidenceLevel.toUpperCase()}
                    </span>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h4>Clinical Reasoning</h4>
                    <p style={{ color: '#666', lineHeight: '1.6' }}>{result.reasoning}</p>
                </div>

                {result.recommended_actions && result.recommended_actions.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h4>Recommended Actions</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                            {result.recommended_actions.map((action, idx) => (
                                <li key={idx} style={{ marginBottom: '8px', color: '#666' }}>{action}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div style={{ marginTop: '20px' }}>
                    <h4>Clinical Safety Check</h4>
                    <span className={`badge ${result.clinical_safety_check === 'PASSED' ? 'badge-success' : 'badge-warning'}`}>
                        {result.clinical_safety_check}
                    </span>
                </div>

                <button className="btn btn-primary" onClick={onReset} style={{ marginTop: '30px' }}>
                    New Reconciliation
                </button>
            </div>
        </div>
    );
}

export default ReconciliationResult;
