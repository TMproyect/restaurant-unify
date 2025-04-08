
import React from 'react';

interface TestResultDisplayProps {
  testResult: string;
  testStatus: 'success' | 'error' | null;
}

export const TestResultDisplay: React.FC<TestResultDisplayProps> = ({ 
  testResult, 
  testStatus 
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Resultado de la prueba</h3>
      <div className={`p-4 rounded font-mono text-sm overflow-auto ${
        testStatus === 'success' ? 'bg-green-50 border border-green-200' :
        testStatus === 'error' ? 'bg-red-50 border border-red-200' :
        'bg-gray-50 border'
      }`}>
        <pre>{testResult}</pre>
      </div>
    </div>
  );
};
