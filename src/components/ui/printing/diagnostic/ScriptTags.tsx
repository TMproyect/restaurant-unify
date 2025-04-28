
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ScriptTagsProps {
  scriptTags: HTMLScriptElement[];
}

export function ScriptTags({ scriptTags }: ScriptTagsProps) {
  if (scriptTags.length === 0) return null;

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm">Script Tags Found:</span>
        <Badge 
          variant="outline" 
          className={scriptTags.length > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
        >
          {scriptTags.length}
        </Badge>
      </div>
      
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
    </>
  );
}
