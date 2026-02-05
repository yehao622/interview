import React from 'react';

function DataQualityDashboard({ result, onReset }) {
    const getScoreColor = (score) => {
        if (score >= 70) return '#4caf50';
        if (score >= 40) return '#ff9800';
        return '#f44336';
    };

    const getScoreLabel = (score) => {
        if (score >= 70) return 'GOOD';
        if (score >= 40) return 'FAIR';
        return 'POOR';
    };

    // const overallColor = getScoreColor(result.overall_score);
    const overallLabel = getScoreLabel(result.overall_score);

    return (
        <div>
            <div className="card">
                <h2>Data Quality Assessment</h2>

                {/* Overall Score */}
                <div style={{
                    textAlign: 'center',
                    padding: '30px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    color: 'white',
                    marginBottom: '30px'
                }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>
                        {result.overall_score}
                    </div>
                    <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                        Overall Quality Score
                    </div>
                    <div style={{
                        marginTop: '15px',
                        padding: '8px 20px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '20px',
                        display: 'inline-block'
                    }}>
                        {overallLabel}
                    </div>
                </div>

                {/* Dimension Breakdown */}
                <h3>Quality Dimensions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    {Object.entries(result.breakdown).map(([key, value]) => (
                        <div key={key} style={{
                            padding: '20px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            background: '#fafafa'
                        }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: getScoreColor(value),
                                marginBottom: '5px'
                            }}>
                                {value}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#666',
                                textTransform: 'capitalize'
                            }}>
                                {key.replace(/_/g, ' ')}
                            </div>
                            <div style={{
                                height: '8px',
                                background: '#e0e0e0',
                                borderRadius: '4px',
                                marginTop: '10px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${value}%`,
                                    height: '100%',
                                    background: getScoreColor(value),
                                    transition: 'width 0.5s'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Issues Detected */}
                {result.issues_detected && result.issues_detected.length > 0 && (
                    <div>
                        <h3>Issues Detected ({result.issues_detected.length})</h3>
                        <ul className="issue-list">
                            {result.issues_detected.map((issue, idx) => (
                                <li key={idx} className={`issue-item ${issue.severity}`}>
                                    <div className="issue-field">
                                        {issue.field}
                                        <span className={`badge badge-${issue.severity === 'high' ? 'danger' :
                                            issue.severity === 'medium' ? 'warning' :
                                                'success'
                                            }`} style={{ marginLeft: '10px', fontSize: '0.75rem' }}>
                                            {issue.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="issue-text">{issue.issue}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button className="btn btn-primary" onClick={onReset} style={{ marginTop: '30px' }}>
                    New Assessment
                </button>
            </div>
        </div>
    );
}

export default DataQualityDashboard;
