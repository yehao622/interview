import React, { useState } from 'react';
import './styles/App.css'
import ReconciliationForm from './components/ReconciliationForm';
import ReconciliationResult from './components/ReconciliationResult';
import DataQualityDashboard from './components/DataQualityDashboard';
import DataQualityForm from './components/DataQualityForm';
import { reconcileMedication, validateDataQuality } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('reconcile');
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [reconcileResult, setReconcileResult] = useState(null);
  const [reconcileError, setReconcileError] = useState(null);
  const [validateLoading, setValidateLoading] = useState(false);
  const [validateResult, setValidateResult] = useState(null);
  const [validateError, setValidateError] = useState(null);


  const handleReconcile = async (data) => {
    setReconcileLoading(true);
    setReconcileError(null);

    try {
      const result = await reconcileMedication(data);
      setReconcileResult(result);
    } catch (error) {
      setReconcileError(error.message);
    } finally {
      setReconcileLoading(false);
    }
  };

  const handleReconcileReset = () => {
    setReconcileResult(null);
    setReconcileError(null);
  };

  const handleValidate = async (data) => {
    setValidateLoading(true);
    setValidateError(null);

    try {
      const result = await validateDataQuality(data);
      setValidateResult(result);
    } catch (error) {
      setValidateError(error.message);
    } finally {
      setValidateLoading(false);
    }
  };

  const handleValidateReset = () => {
    setValidateResult(null);
    setValidateError(null);
  };


  return (
    <div className="app">
      <header className="header">
        <h1>Clinical Data Reconciliation Engine</h1>
        <p>AI-powered medication reconciliation and data quality validation</p>
      </header>

      <nav className='nav-tabs'>
        <button
          className={`nav-tab ${activeTab === 'reconcile' ? 'active' : ''}`}
          onClick={() => setActiveTab('reconcile')}
        >
          Medication Reconciliation
        </button>
        <button
          className={`nav-tab ${activeTab === 'validate' ? 'active' : ''}`}
          onClick={() => setActiveTab('validate')}
        >
          Data Quality Validation
        </button>
      </nav>

      <main>
        {activeTab === 'reconcile' && (
          <div>
            {reconcileError && (
              <div className="error">
                <strong>Error:</strong> {reconcileError}
              </div>
            )}

            {reconcileLoading && (
              <div className="loading">Analyzing medications with AI</div>
            )}

            {!reconcileResult && !reconcileLoading && (
              <ReconciliationForm onSubmit={handleReconcile} loading={reconcileLoading} />
            )}

            {reconcileResult && !reconcileLoading && (
              <ReconciliationResult result={reconcileResult} onReset={handleReconcileReset} />
            )}
          </div>
        )}

        {activeTab === 'validate' && (
          <div>
            {validateError && (
              <div className="error">
                <strong>Error:</strong> {validateError}
              </div>
            )}

            {validateLoading && (
              <div className="loading">Analyzing data quality with AI</div>
            )}

            {!validateResult && !validateLoading && (
              <DataQualityForm onSubmit={handleValidate} loading={validateLoading} />
            )}

            {validateResult && !validateLoading && (
              <DataQualityDashboard result={validateResult} onReset={handleValidateReset} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
