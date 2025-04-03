
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QzDiagnosticToolProps {
  onClose: () => void;
}

export function QzDiagnosticTool({ onClose }: QzDiagnosticToolProps) {
  const [scriptExists, setScriptExists] = useState<boolean | null>(null);
  const [qzObjectExists, setQzObjectExists] = useState<boolean>(false);
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkQzTray = async () => {
      setChecking(true);
      
      // Check if script exists
      const checkScriptExists = async () => {
        try {
          const response = await fetch('/qz-tray.min.js');
          if (response.ok) {
            setScriptExists(true);
            try {
              const text = await response.text();
              setScriptContent(text.substring(0, 100) + '...');
            } catch (err) {
              console.error("Error reading script content:", err);
              setScriptContent("Error reading script content");
            }
          } else {
            setScriptExists(false);
          }
        } catch (err) {
          console.error("Error checking script file:", err);
          setScriptExists(false);
        }
      };
      
      // Check if QZ object exists
      const checkQzObject = () => {
        if (window.qz) {
          setQzObjectExists(true);
        } else {
          setQzObjectExists(false);
          
          // Check for script tags
          const scriptTags = document.querySelectorAll('script[src*="qz-tray"]');
          setScriptExists(scriptTags.length > 0);
        }
      };
      
      await checkScriptExists();
      checkQzObject();
      
      setChecking(false);
    };
    
    checkQzTray();
  }, []);

  const reloadScript = async () => {
    setChecking(true);
    
    // Remove existing script tags
    const scriptTags = document.querySelectorAll('script[src*="qz-tray"]');
    scriptTags.forEach(tag => tag.remove());
    
    // Add new script tag
    const script = document.createElement('script');
    script.src = '/qz-tray.min.js?' + new Date().getTime(); // Add timestamp to bypass cache
    script.async = false;
    document.body.appendChild(script);
    
    // Wait and check
    setTimeout(() => {
      if (window.qz) {
        setQzObjectExists(true);
        window.dispatchEvent(new CustomEvent('qz-tray-available', { detail: window.qz }));
      } else {
        setQzObjectExists(false);
      }
      setChecking(false);
    }, 2000);
  };

  return (
    <Card className="border-amber-200 bg-amber-50 mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
            QZ Tray Diagnostic Tool
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">QZ Tray Script File:</span>
            {checking ? (
              <Badge variant="outline" className="bg-slate-100">
                Checking...
              </Badge>
            ) : (
              <Badge 
                variant="outline" 
                className={scriptExists ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {scriptExists ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                {scriptExists ? "Found" : "Not Found"}
              </Badge>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">QZ Tray Object:</span>
            {checking ? (
              <Badge variant="outline" className="bg-slate-100">
                Checking...
              </Badge>
            ) : (
              <Badge 
                variant="outline" 
                className={qzObjectExists ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {qzObjectExists ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                {qzObjectExists ? "Available" : "Not Available"}
              </Badge>
            )}
          </div>
          
          {scriptExists === false && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
              <p className="font-medium text-red-800">Script file not found</p>
              <p className="text-red-700 mt-1">
                The QZ Tray script file could not be found at '/qz-tray.min.js'. 
                This is required for the printing system to work.
              </p>
            </div>
          )}
          
          {scriptExists && !qzObjectExists && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
              <p className="font-medium text-amber-800">Script found but not properly loaded</p>
              <p className="text-amber-700 mt-1">
                The QZ Tray script file exists but didn't initialize correctly.
                This could be due to a script error or interference from other scripts.
              </p>
            </div>
          )}
        </div>
        
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reloadScript}
            disabled={checking}
            className="mr-2"
          >
            Reload QZ Tray Script
          </Button>
          
          <Button
            variant="ghost" 
            size="sm"
            asChild
          >
            <a 
              href="https://qz.io/download/" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              QZ Tray Documentation
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
