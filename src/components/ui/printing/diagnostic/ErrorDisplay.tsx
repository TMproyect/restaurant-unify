
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ErrorDisplayProps {
  error: string | null;
  errorDetails: string | null;
}

export function ErrorDisplay({ error, errorDetails }: ErrorDisplayProps) {
  if (!error) return null;

  return (
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
  );
}
