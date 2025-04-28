
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
                <p><span className="font-semibold">src:</span> {tag.src}</p>
                <p><span className="font-semibold">async:</span> {tag.async ? 'true' : 'false'}</p>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
