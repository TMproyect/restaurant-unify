
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, Loader2, Terminal, Download, FileSearch } from 'lucide-react';
import { isQzScriptLoaded, loadQzScript } from '@/services/printing/qzDetection';

interface QzDiagnosticToolProps {
  onClose?: () => void;
}

export function QzDiagnosticTool({ onClose }: QzDiagnosticToolProps) {
  const [scriptLoaded, setScriptLoaded] = useState<boolean | null>(null);
  const [qzAvailable, setQzAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scriptPath, setScriptPath] = useState<string>('/qz-tray.min.js');
  const [scriptExists, setScriptExists] = useState<boolean | null>(null);

  // Function to check QZ Tray status
  const checkQzStatus = () => {
    setChecking(true);
    setErrorMsg(null);

    // 1. Check if script is loaded
    const scriptExists = isQzScriptLoaded();
    setScriptLoaded(scriptExists);

    // 2. Check if qz object is available
    setQzAvailable(typeof window.qz !== 'undefined');

    // 3. Check if script file exists on server
    checkScriptFileExists();

    setChecking(false);
  };

  const checkScriptFileExists = async () => {
    try {
      const response = await fetch(scriptPath, { method: 'HEAD' });
      setScriptExists(response.ok);
      if (!response.ok) {
        setErrorMsg(`QZ Tray script not found at ${scriptPath}. Status: ${response.status}`);
      }
    } catch (err) {
      console.error("Error checking script existence:", err);
      setScriptExists(false);
      setErrorMsg(`Error checking script at ${scriptPath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleLoadQzScript = async () => {
    setChecking(true);
    setErrorMsg(null);
    
    try {
      await loadQzScript();
      setTimeout(checkQzStatus, 1000); // Check again after a second
    } catch (err) {
      console.error("Error loading QZ Tray script", err);
      setErrorMsg(err instanceof Error ? err.message : "Unknown error loading QZ Tray script");
      setChecking(false);
    }
  };

  // Initial check when component mounts
  useEffect(() => {
    checkQzStatus();
  }, []);

  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardHeader className="bg-amber-100">
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          QZ Tray Diagnostic Tool
        </CardTitle>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        <div className="space-y-4">
          <h3 className="font-medium">QZ Tray Status</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white rounded-md border">
              <div className="flex items-center gap-2">
                <span>Script file exists on server:</span>
              </div>
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : scriptExists === null ? (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              ) : scriptExists ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-white rounded-md border">
              <div className="flex items-center gap-2">
                <span>QZ Tray script loaded:</span>
              </div>
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : scriptLoaded ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-2 bg-white rounded-md border">
              <div className="flex items-center gap-2">
                <span>window.qz available:</span>
              </div>
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : qzAvailable ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>

          {errorMsg && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {(!qzAvailable || !scriptLoaded || scriptExists === false) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>Problems detected with QZ Tray:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {scriptExists === false && <li>QZ Tray script file not found on server at <code>{scriptPath}</code>.</li>}
                  {!scriptLoaded && <li>QZ Tray script is not loaded correctly.</li>}
                  {!qzAvailable && <li>window.qz object is not available.</li>}
                </ul>
                <p className="mt-2">Recommendations:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verify QZ Tray is installed and running on your computer</li>
                  {scriptExists === false && <li>Make sure the QZ Tray script file exists in your public folder</li>}
                  <li>Try reloading the page</li>
                  <li>Check that the QZ Tray browser plugin is enabled</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-amber-100/50 gap-2">
        <Button variant="outline" size="sm" onClick={checkQzStatus} disabled={checking}>
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            'Check status'
          )}
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleLoadQzScript} disabled={checking}>
            {scriptLoaded ? 'Reload script' : 'Load script'}
          </Button>
          
          <Button variant="default" size="sm" asChild>
            <a href="https://qz.io/download/" target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download QZ Tray
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
