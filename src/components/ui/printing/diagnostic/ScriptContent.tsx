
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ScriptContentProps {
  scriptFirstBytes: string | null;
}

export function ScriptContent({ scriptFirstBytes }: ScriptContentProps) {
  if (!scriptFirstBytes) return null;

  return (
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
  );
}
