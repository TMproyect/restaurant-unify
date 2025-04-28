
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Check, X, Info } from "lucide-react";

interface ScriptTagsProps {
  scriptTags: HTMLScriptElement[];
}

export function ScriptTags({ scriptTags }: ScriptTagsProps) {
  if (!scriptTags.length) return null;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="script-tags">
        <AccordionTrigger className="text-xs">
          Found Script Tags ({scriptTags.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-xs">
            {scriptTags.map((tag, i) => (
              <div key={i} className="p-2 bg-gray-100 rounded">
                <div className="flex justify-between items-center mb-1">
                  <p><span className="font-semibold">src:</span> {tag.src}</p>
                  <ScriptStatusBadge tag={tag} />
                </div>
                <div className="flex gap-4">
                  <p><span className="font-semibold">async:</span> {tag.async ? 'true' : 'false'}</p>
                  <p><span className="font-semibold">defer:</span> {tag.defer ? 'true' : 'false'}</p>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function ScriptStatusBadge({ tag }: { tag: HTMLScriptElement }) {
  // Use a simpler check that doesn't rely on readyState or complete property
  // Instead, check if the script has an error attribute or has loaded attribute
  const hasError = tag.hasAttribute('data-error');
  const isLoaded = !hasError && tag.hasAttribute('data-loaded');
  
  if (isLoaded) {
    return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
      <Check className="h-3 w-3" /> Loaded
    </Badge>;
  } else {
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
      <Info className="h-3 w-3" /> Loading
    </Badge>;
  }
}
