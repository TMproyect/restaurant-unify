import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { StatusIndicator } from './diagnostic/StatusIndicators';
import { ScriptContent } from './diagnostic/ScriptContent';
import { ErrorDisplay } from './diagnostic/ErrorDisplay';
import { ActionButtons } from './diagnostic/ActionButtons';
import { ScriptTags } from './diagnostic/ScriptTags';

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
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [scriptTags, setScriptTags] = useState<HTMLScriptElement[]>([]);

  useEffect(() => {
    checkQzTray();
  }, []);

  const checkQzTray = async () => {
    setChecking(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      const response = await fetch('/qz-tray.js');
      
      if (response.ok) {
        setScriptExists(true);
        try {
          const text = await response.text();
          
          if (text.length > 100) {
            setScriptFirstBytes(text.substring(0, 100) + '...');
          } else {
            setScriptFirstBytes(text);
          }
          
          const hasExpectedString = text.includes('var qz=function(){var r={VERSION:"2.2.4"');
          if (!hasExpectedString) {
            setError("Script doesn't match expected QZ Tray v2.2.4 content");
          }
          
          setScriptContent(text);
        } catch (err) {
          console.error("Error reading script content:", err);
          setScriptContent("Error reading script content");
          setError("Failed to read script content");
          setErrorDetails(err instanceof Error ? err.message : String(err));
        }
      } else {
        setScriptExists(false);
        setError(`Script not found: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error checking script file:", err);
      setScriptExists(false);
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
      setErrorDetails(err instanceof Error ? err.stack || "No stack available" : "No detailed error information available");
    }
    
    // Check QZ object
    if (window.qz) {
      setQzObjectExists(true);
      toast.success("QZ Tray object found in window!");
    } else {
      setQzObjectExists(false);
      
      const tags = document.querySelectorAll('script[src*="qz-tray.js"]');
      setScriptTags(Array.from(tags as NodeListOf<HTMLScriptElement>));
      
      if (tags.length === 0) {
        setError((prev) => `${prev ? prev + '. ' : ''}No QZ Tray script tags found in document`);
      }
    }
    
    setChecking(false);
  };

  const reloadScript = () => {
    setChecking(true);
    
    const script = document.createElement('script');
    script.src = `/qz-tray.js?t=${new Date().getTime()}`;
    script.async = false;
    
    script.onload = () => {
      console.log("QZ Tray script reloaded dynamically");
      toast.success("QZ Tray script reloaded!");
      
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
      setErrorDetails(e instanceof Error ? e.stack || "No stack available" : "Error event details not available");
      toast.error("Failed to load QZ Tray script");
      setChecking(false);
    };
    
    const existingScripts = document.querySelectorAll('script[src*="qz-tray.js"]');
    existingScripts.forEach(script => script.remove());
    
    document.body.appendChild(script);
  };

  const inspectScript = async () => {
    try {
      const response = await fetch('/qz-tray.js');
      
      if (response.ok) {
        const text = await response.text();
        console.log("QZ Tray script content:", text);
        
        try {
          new Function(text);
          toast.success("Script syntax check passed");
        } catch (syntaxError) {
          console.error("Syntax error in script:", syntaxError);
          toast.error("Syntax error detected in script");
          setErrorDetails(`Syntax error: ${syntaxError instanceof Error ? syntaxError.message : String(syntaxError)}`);
        }
      }
    } catch (err) {
      console.error("Error inspecting script:", err);
      toast.error("Failed to inspect script");
    }
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
          <StatusIndicator 
            isChecking={checking}
            exists={scriptExists}
            label="QZ Tray Script File:"
          />
          
          <StatusIndicator 
            isChecking={checking}
            exists={qzObjectExists}
            label="QZ Tray Object:"
          />
          
          <ScriptTags scriptTags={scriptTags} />
          
          <ErrorDisplay error={error} errorDetails={errorDetails} />
          
          <ScriptContent scriptFirstBytes={scriptFirstBytes} />
        </div>
        
        <ActionButtons 
          checking={checking}
          onReload={reloadScript}
          onInspect={inspectScript}
        />
        
        <div className="text-xs text-gray-500 italic">
          Note: If you still see syntax errors after these changes, please try opening in a private/incognito window
          or clear your browser cache completely.
        </div>
      </CardContent>
    </Card>
  );
}
