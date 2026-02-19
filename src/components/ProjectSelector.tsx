import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Package, Code } from "lucide-react";

interface GoFunction {
  name: string;
  sourceCode: string;
  startLine: number;
  endLine: number;
}

interface GoPackage {
  name: string;
  path: string;
  functions: GoFunction[];
}

interface ProjectSelectorProps {
  selectedPackage: string;
  selectedMethod: string;
  onPackageChange: (value: string) => void;
  onMethodChange: (value: string) => void;
  packages: GoPackage[];
}

export const ProjectSelector = ({
  selectedPackage,
  selectedMethod,
  onPackageChange,
  onMethodChange,
  packages,
}: ProjectSelectorProps) => {
  const selectedPkg = packages.find(pkg => pkg.name === selectedPackage);
  const availableMethods = selectedPkg ? selectedPkg.functions.map(f => f.name) : [];

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Select Package
          </label>
          <Select value={selectedPackage} onValueChange={onPackageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a package" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((pkg) => (
                <SelectItem key={pkg.name} value={pkg.name}>
                  <div className="flex flex-col">
                    <span>{pkg.name}</span>
                    <span className="text-xs text-muted-foreground">{pkg.path} ({pkg.functions.length} functions)</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Code className="h-4 w-4" />
            Select Method/Function
          </label>
          <Select 
            value={selectedMethod} 
            onValueChange={onMethodChange}
            disabled={!selectedPackage}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a method" />
            </SelectTrigger>
            <SelectContent>
              {availableMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};