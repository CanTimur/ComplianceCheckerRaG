import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Download,
  TrendingUp,
  Shield,
  FileText,
  Clock
} from 'lucide-react';
import axios from 'axios';

// Create axios instance for ComplianceReport with proper baseURL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  timeout: 30000,
});

export default function ComplianceReport({ documentId, reportData, onAnalysisComplete, onStartOver }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(reportData);
  const [reportId, setReportId] = useState(null);

  useEffect(() => {
    if (documentId && !reportData) {
      startAnalysis();
    }
  }, [documentId, reportData]);

  const startAnalysis = async (retryCount = 0) => {
    const maxRetries = 3;
    setLoading(true);
    setError(null);

    try {
      // Add a small delay before first attempt to ensure backend is ready
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Start analysis
      const response = await api.post('/analyze', {
        documentId: documentId
      });

      if (response.data.success) {
        const repId = response.data.reportId;
        setReportId(repId);
        
        // Poll for results
        pollForResults(repId);
      } else {
        setError(response.data.message || 'Analysis failed to start');
        setLoading(false);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && (
        err.code === 'ERR_NETWORK' || 
        err.code === 'ECONNABORTED' ||
        err.response?.status >= 500
      )) {
        console.log(`Retrying analysis... Attempt ${retryCount + 1}/${maxRetries}`);
        setTimeout(() => startAnalysis(retryCount + 1), 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      let errorMessage = 'Failed to start analysis';
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const pollForResults = async (repId) => {
    const maxAttempts = 30; // 30 attempts with 2-second intervals = 1 minute max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await api.get(`/reports/${repId}`);
        
        if (response.data.success) {
          const reportData = response.data.report;
          
          if (reportData.status === 'completed') {
            setReport(reportData);
            setLoading(false);
            onAnalysisComplete && onAnalysisComplete(repId, reportData);
            return;
          } else if (reportData.status === 'failed') {
            setError(reportData.error || 'Analysis failed');
            setLoading(false);
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setError('Analysis timed out. Please try again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setError('Failed to get analysis results');
          setLoading(false);
        }
      }
    };

    poll();
  };

  const getComplianceColor = (level) => {
    switch (level) {
      case 'Fully Compliant':
        return 'text-success-600';
      case 'Mostly Compliant':
        return 'text-success-500';
      case 'Partially Compliant':
        return 'text-warning-600';
      case 'Non-Compliant':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const getComplianceBadge = (level) => {
    switch (level) {
      case 'Fully Compliant':
        return 'status-compliant';
      case 'Mostly Compliant':
        return 'status-compliant';
      case 'Partially Compliant':
        return 'status-partial';
      case 'Non-Compliant':
        return 'status-non-compliant';
      default:
        return 'status-badge bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-warning-500" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-danger-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  if (loading) {
    return (
      <div className="card text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Analyzing Your Document
        </h3>
        <p className="text-gray-600 mb-6">
          Our AI is performing a comprehensive GDPR compliance analysis. This may take a few moments...
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Checking data subject rights, consent mechanisms, security measures, and more...
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full progress-bar"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <XCircle className="w-16 h-16 text-danger-500 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Analysis Failed</h3>
        <p className="text-danger-600 mb-4">{error}</p>
        <p className="text-gray-600 text-sm mb-6">
          This sometimes happens when the backend is starting up. Please try again in a moment.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => documentId ? startAnalysis() : onStartOver && onStartOver()}
            className="btn-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          <button
            onClick={() => onStartOver && onStartOver()}
            className="btn-secondary"
          >
            Upload Different File
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const { analysis, improvements, documentName } = report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              GDPR Compliance Report
            </h2>
            <p className="text-gray-600 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              {documentName}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onStartOver}
              className="btn-secondary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Another
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}%
            </div>
            <p className="text-gray-600">Overall Score</p>
          </div>
          
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getComplianceBadge(analysis.complianceLevel)}`}>
              {analysis.complianceLevel}
            </div>
            <p className="text-gray-600">Compliance Level</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-lg font-semibold text-gray-700">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600">Analysis Date</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Executive Summary
        </h3>
        <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-success-700 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="w-4 h-4 text-success-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-danger-700 mb-4 flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {analysis.weaknesses?.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <XCircle className="w-4 h-4 text-danger-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Analysis */}
      {analysis.detailedAnalysis && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Detailed GDPR Analysis
          </h3>
          
          <div className="grid gap-4">
            {Object.entries(analysis.detailedAnalysis).map(([key, value]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <div className="flex items-center">
                    {getStatusIcon(value.status)}
                    <span className={`ml-2 text-sm font-medium capitalize ${
                      value.status === 'compliant' ? 'text-success-600' :
                      value.status === 'partial' ? 'text-warning-600' : 'text-danger-600'
                    }`}>
                      {value.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{value.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Recommendations
        </h3>
        <div className="space-y-4">
          {analysis.recommendations?.map((recommendation, index) => (
            <div key={index} className="flex items-start p-4 bg-primary-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary-600 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Suggestions */}
      {improvements?.prioritizedImprovements && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Prioritized Improvements
          </h3>
          <div className="space-y-4">
            {improvements.prioritizedImprovements.map((improvement, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{improvement.area}</h4>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                      improvement.priority === 'High' ? 'bg-danger-100 text-danger-800' :
                      improvement.priority === 'Medium' ? 'bg-warning-100 text-warning-800' :
                      'bg-success-100 text-success-800'
                    }`}>
                      {improvement.priority} Priority
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{improvement.timeline}</span>
                </div>
                <p className="text-gray-700 mb-3">{improvement.description}</p>
                <div className="bg-gray-50 rounded p-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Implementation Steps:</h5>
                  <p className="text-sm text-gray-600">{improvement.implementation}</p>
                </div>
                {improvement.templateText && (
                  <div className="bg-blue-50 rounded p-3 mt-3">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Suggested Language:</h5>
                    <p className="text-sm text-blue-700 italic">{improvement.templateText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
