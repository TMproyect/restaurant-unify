
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";

interface QzDiagnosticToolProps {
  onClose: () => void;
}

export function QzDiagnosticTool({ onClose }: QzDiagnosticToolProps) {
  const [scriptExists, setScriptExists] = useState<boolean | null>(null);
  const [qzObjectExists, setQzObjectExists] = useState<boolean>(false);
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [scriptFirstBytes, setScriptFirstBytes] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkQzTray();
  }, []);

  const checkQzTray = async () => {
    setChecking(true);
    setError(null);
    
    // Check if script exists
    const checkScriptExists = async () => {
      try {
        const response = await fetch('/qz-tray.js');
        if (response.ok) {
          setScriptExists(true);
          try {
            const text = await response.text();
            // Store the first 100 characters for inspection
            setScriptFirstBytes(text.substring(0, 100) + '...');
            
            // Look for a specific string that should be in the non-minified version
            const hasExpectedString = text.includes('var qz=function(){var r={VERSION:"2.2.4"');
            if (!hasExpectedString) {
              setError("Script doesn't match expected QZ Tray v2.2.4 content");
            }
            
            // Save script content for debugging
            setScriptContent(text);
          } catch (err) {
            console.error("Error reading script content:", err);
            setScriptContent("Error reading script content");
            setError("Failed to read script content");
          }
        } else {
          setScriptExists(false);
          setError(`Script not found: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error checking script file:", err);
        setScriptExists(false);
        setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    // Check if QZ object exists
    const checkQzObject = () => {
      if (window.qz) {
        setQzObjectExists(true);
        toast.success("QZ Tray object found in window!");
      } else {
        setQzObjectExists(false);
        
        // Check for script tags
        const scriptTags = document.querySelectorAll('script[src*="qz-tray.js"]');
        if (scriptTags.length === 0) {
          setError((prev) => `${prev ? prev + '. ' : ''}No QZ Tray script tags found in document`);
        } else {
          console.log(`Found ${scriptTags.length} QZ Tray script tags`);
        }
      }
    };
    
    await checkScriptExists();
    checkQzObject();
    
    setChecking(false);
  };

  const reloadScript = () => {
    setChecking(true);
    
    // Create a fresh script element with timestamp to avoid cache
    const script = document.createElement('script');
    script.src = `/qz-tray.js?t=${new Date().getTime()}`; // Add timestamp to bypass cache
    script.async = false;
    
    script.onload = () => {
      console.log("QZ Tray script reloaded dynamically");
      toast.success("QZ Tray script reloaded!");
      
      // Wait a bit and check for the object
      setTimeout(() => {
        if (window.qz) {
          setQzObjectExists(true);
          window.dispatchEvent(new CustomEvent('qz-tray-available', { detail: window.qz }));
          toast.success("QZ Tray object is available now!");
        } else {
          setQzObjectExists(false);
          toast.error("QZ Tray object still not available after reload");
        }
        setChecking(false);
      }, 1000);
    };
    
    script.onerror = (e) => {
      console.error("Error loading QZ Tray script", e);
      setError(`Script load error: ${e instanceof Error ? e.message : "Unknown error"}`);
      toast.error("Failed to load QZ Tray script");
      setChecking(false);
    };
    
    document.body.appendChild(script);
  };

  return (
    <Card className="border-amber-200 bg-amber-50 mb-4 max-w-2xl mx-auto">
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
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
              <p className="font-medium text-red-800">Error Detected</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}
          
          {scriptFirstBytes && (
            <div className="mt-2">
              <p className="font-medium text-sm">Script content beginning:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mt-1">
                {scriptFirstBytes}
              </pre>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reloadScript}
            disabled={checking}
            className="flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reload QZ Tray Script
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkQzTray}
            disabled={checking}
            className="flex items-center"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Check Status
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
        
        <div className="text-xs text-gray-500 italic">
          Note: If you still see syntax errors after these changes, please clear your browser cache 
          completely or try opening in a private/incognito window.
        </div>
      </CardContent>
    </Card>
  );
}
