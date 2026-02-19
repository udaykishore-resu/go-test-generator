import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Zap, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TestGeneratorProps {
  selectedPackage: string;
  selectedMethod: string;
  inputCode: string;
  onGenerate: (testType: string) => void;
  isLoading?: boolean;
}

const testTypes = [
  { id: "unit", name: "Unit Test", description: "Basic unit test with mocks" },
  { id: "integration", name: "Integration Test", description: "Test with real dependencies" },
  { id: "rest", name: "REST API Test", description: "HTTP endpoint testing" },
  { id: "grpc", name: "gRPC Test", description: "gRPC service testing" },
  { id: "graphql", name: "GraphQL Test", description: "GraphQL resolver testing" },
];

export const TestGenerator = ({
  selectedPackage,
  selectedMethod,
  inputCode,
  onGenerate,
  isLoading = false,
}: TestGeneratorProps) => {
  const canGenerate = selectedPackage && selectedMethod && inputCode.trim();

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Test Generator</h2>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {testTypes.map((type) => (
            <Button
              key={type.id}
              variant="outline"
              onClick={() => onGenerate(type.id)}
              disabled={!canGenerate || isLoading}
              className="justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-medium">{type.name}</div>
                <div className="text-xs text-muted-foreground">{type.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {selectedPackage && selectedMethod && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">Selected Target:</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedPackage}</Badge>
              <span className="text-sm">→</span>
              <Badge variant="outline">{selectedMethod}</Badge>
            </div>
          </div>
        )}

        {!canGenerate && (
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            Please select a package, method, and provide input code to generate tests.
          </div>
        )}
      </div>
    </Card>
  );
};