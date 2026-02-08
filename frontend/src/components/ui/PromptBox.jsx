import { Card, CardContent } from "./card";
import { Textarea } from "./textarea";

export function PromptBox() {
  return (
    <div className="shadow-none rounded-l bg-white mt-10 mb-6">
      <Card className="bg-transparent shadow-none">
        <CardContent className="p-4 md:p-6 bg-transparent shadow-none ">
          <Textarea
            placeholder="Prompt the AI..."
            className="min-h-[70px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 text-center text-foreground"
          />
        </CardContent>
      </Card>
    </div>
  );
}
