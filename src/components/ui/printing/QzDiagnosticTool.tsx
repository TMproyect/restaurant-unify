
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle, HelpCircle, RefreshCw, FileCode, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    
    // Check if script exists
    const checkScriptExists = async () => {
      try {
        const response = await fetch('/qz-tray.js');
        
        if (response.ok) {
          setScriptExists(true);
          try {
            const text = await response.text();
            
            // Store the first 100 characters for inspection
            if (text.length > 100) {
              setScriptFirstBytes(text.substring(0, 100) + '...');
            } else {
              setScriptFirstBytes(text);
            }
            
            // Look for a specific string that should be in the version
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
    };
    
    // Check if QZ object exists
    const checkQzObject = () => {
      if (window.qz) {
        setQzObjectExists(true);
        toast.success("QZ Tray object found in window!");
      } else {
        setQzObjectExists(false);
        
        // Check for script tags
        const tags = document.querySelectorAll('script[src*="qz-tray.js"]');
        setScriptTags(Array.from(tags as NodeListOf<HTMLScriptElement>));
        
        if (tags.length === 0) {
          setError((prev) => `${prev ? prev + '. ' : ''}No QZ Tray script tags found in document`);
        } else {
          console.log(`Found ${tags.length} QZ Tray script tags`);
          
          // Check if any have errors
          tags.forEach((tag, index) => {
            console.log(`Script tag ${index}:`, tag);
          });
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
      setErrorDetails(e instanceof Error ? e.stack || "No stack available" : "Error event details not available");
      toast.error("Failed to load QZ Tray script");
      setChecking(false);
    };
    
    // Remove any existing QZ Tray scripts
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
        
        // Look for syntax errors by trying to evaluate without executing
        try {
          // This is a simple syntax check, not execution
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
          
          {/* Script tags information */}
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">Script Tags Found:</span>
            <Badge 
              variant="outline" 
              className={scriptTags.length > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {scriptTags.length}
            </Badge>
          </div>
          
          {scriptTags.length > 0 && (
            <Accordion type="single" collapsible>
              <AccordionItem value="script-tags">
                <AccordionTrigger className="text-xs">
                  View Script Tag Details
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {scriptTags.map((tag, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-xs">
                        <p><strong>src:</strong> {tag.src}</p>
                        <p><strong>async:</strong> {tag.async ? "true" : "false"}</p>
                        <p><strong>defer:</strong> {tag.defer ? "true" : "false"}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
              <p className="font-medium text-red-800">Error Detected</p>
              <p className="text-red-700 mt-1">{error}</p>
              {errorDetails && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="error-details">
                    <AccordionTrigger className="text-xs text-red-600">
                      View Error Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-red-50 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                        {errorDetails}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}
          
          {scriptFirstBytes && (
            <Accordion type="single" collapsible>
              <AccordionItem value="script-content">
                <AccordionTrigger className="text-xs">
                  View Script Beginning
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {scriptFirstBytes}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
            variant="outline" 
            size="sm" 
            onClick={inspectScript}
            disabled={checking}
            className="flex items-center"
          >
            <FileCode className="h-3 w-3 mr-1" />
            Inspect Script
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
              <ExternalLink className="h-3 w-3 mr-1" />
              QZ Tray Download
            </a>
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 italic">
          Note: If you still see syntax errors after these changes, please try opening in a private/incognito window
          or clear your browser cache completely.
        </div>
      </CardContent>
    </Card>
  );
}
