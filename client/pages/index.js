import { useState, useEffect } from 'react';
import Head from 'next/head';
import FileUpload from '../components/FileUpload';
import ComplianceReport from '../components/ComplianceReport';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  const [currentStep, setCurrentStep] = useState('upload'); // upload, analyzing, report
  const [documentId, setDocumentId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Load state from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('complianceCheckerState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.currentStep && state.reportData) {
            setCurrentStep(state.currentStep);
            setDocumentId(state.documentId);
            setReportId(state.reportId);
            setReportData(state.reportData);
          }
        } catch (error) {
          console.error('Error loading saved state:', error);
          localStorage.removeItem('complianceCheckerState');
        }
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentStep !== 'upload') {
      const stateToSave = {
        currentStep,
        documentId,
        reportId,
        reportData
      };
      localStorage.setItem('complianceCheckerState', JSON.stringify(stateToSave));
    }
  }, [currentStep, documentId, reportId, reportData]);

  const handleFileUploaded = (docId) => {
    setDocumentId(docId);
    setCurrentStep('analyzing');
  };

  const handleAnalysisComplete = (repId, data) => {
    setReportId(repId);
    setReportData(data);
    setCurrentStep('report');
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setDocumentId(null);
    setReportId(null);
    setReportData(null);
    
    // Clear saved state from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('complianceCheckerState');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>GDPR Compliance Checker</title>
        <meta name="description" content="AI-powered GDPR compliance analysis for your documents" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${currentStep === 'upload' ? 'text-primary-600' : currentStep === 'analyzing' || currentStep === 'report' ? 'text-success-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'upload' ? 'bg-primary-100 text-primary-600' : currentStep === 'analyzing' || currentStep === 'report' ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Upload Document</span>
              </div>
              
              <div className={`flex-1 h-0.5 mx-4 ${currentStep === 'analyzing' || currentStep === 'report' ? 'bg-success-200' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'analyzing' ? 'text-primary-600' : currentStep === 'report' ? 'text-success-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'analyzing' ? 'bg-primary-100 text-primary-600' : currentStep === 'report' ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Analyze</span>
              </div>
              
              <div className={`flex-1 h-0.5 mx-4 ${currentStep === 'report' ? 'bg-success-200' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'report' ? 'text-success-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'report' ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Report</span>
              </div>
            </div>
          </div>

          {/* Content based on current step */}
          {currentStep === 'upload' && (
            <div className="fade-in">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  GDPR Compliance Checker
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Upload your privacy policy, terms of service, or any GDPR-related document for AI-powered compliance analysis.
                </p>
              </div>
              
              <FileUpload onFileUploaded={handleFileUploaded} />
              
              <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="card text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Analysis</h3>
                  <p className="text-gray-600">Check all 10 key GDPR compliance areas including data rights, consent management, and security measures.</p>
                </div>
                
                <div className="card text-center">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-600">Get intelligent recommendations and actionable improvements using advanced language models.</p>
                </div>
                
                <div className="card text-center">
                  <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Processing</h3>
                  <p className="text-gray-600">Your documents are processed securely and are not stored permanently on our servers.</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'analyzing' && (
            <div className="fade-in">
              <ComplianceReport 
                documentId={documentId}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          )}

          {currentStep === 'report' && reportData && (
            <div className="fade-in">
              <ComplianceReport 
                reportData={reportData}
                onStartOver={handleStartOver}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
