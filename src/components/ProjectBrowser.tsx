import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Folder, FolderOpen, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface ProjectBrowserProps {
  onProjectLoad: (packages: GoPackage[]) => void;
}

export const ProjectBrowser = ({ onProjectLoad }: ProjectBrowserProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { toast } = useToast();

  const parseGoFile = (content: string): GoFunction[] => {
    const functions: GoFunction[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match function declarations: func FunctionName(...) or func (receiver) MethodName(...)
      const funcMatch = line.trim().match(/^func\s+(?:\([^)]*\))?\s*([A-Z][a-zA-Z0-9_]*)\s*\(/);
      if (funcMatch) {
        const functionName = funcMatch[1];
        const startLine = i;
        
        // Find the end of the function by counting braces
        let braceCount = 0;
        let endLine = startLine;
        let foundOpenBrace = false;
        
        for (let j = startLine; j < lines.length; j++) {
          const currentLine = lines[j];
          
          // Count opening and closing braces
          for (const char of currentLine) {
            if (char === '{') {
              braceCount++;
              foundOpenBrace = true;
            } else if (char === '}') {
              braceCount--;
            }
          }
          
          // If we found the opening brace and braces are balanced, we found the end
          if (foundOpenBrace && braceCount === 0) {
            endLine = j;
            break;
          }
        }
        
        const sourceCode = lines.slice(startLine, endLine + 1).join('\n');
        
        functions.push({
          name: functionName,
          sourceCode,
          startLine: startLine + 1, // 1-indexed for display
          endLine: endLine + 1
        });
      }
    }
    
    return functions;
  };

  const parseGoProject = async (files: FileList): Promise<GoPackage[]> => {
    const packages: Map<string, GoPackage> = new Map();
    
    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.go') || file.name.endsWith('_test.go')) {
        continue;
      }
      
      try {
        const content = await file.text();
        const packageMatch = content.match(/^package\s+(\w+)/m);
        
        if (packageMatch) {
          const packageName = packageMatch[1];
          const functions = parseGoFile(content);
          
          if (packages.has(packageName)) {
            const existingPkg = packages.get(packageName)!;
            existingPkg.functions.push(...functions);
          } else {
            packages.set(packageName, {
              name: packageName,
              path: file.webkitRelativePath.split('/').slice(0, -1).join('/') || './',
              functions: functions
            });
          }
        }
      } catch (error) {
        console.error(`Error parsing file ${file.name}:`, error);
      }
    }
    
    return Array.from(packages.values());
  };

  const handleDirectorySelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const packages = await parseGoProject(files);
      
      if (packages.length === 0) {
        toast({
          title: "No Go packages found",
          description: "Please select a directory containing Go source files",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedProject(files[0].webkitRelativePath.split('/')[0] || 'Unknown Project');
      onProjectLoad(packages);
      
        toast({
        title: "Project loaded successfully",
        description: `Found ${packages.length} packages with ${packages.reduce((sum, pkg) => sum + pkg.functions.length, 0)} functions`,
      });
    } catch (error) {
      toast({
        title: "Error loading project",
        description: "Failed to parse Go project files",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Browse Go Project</h3>
        </div>
        
        {selectedProject && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <FolderOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{selectedProject}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="directory-input" className="block">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              asChild
              disabled={isLoading}
            >
              <span>
                <File className="h-4 w-4" />
                {isLoading ? "Loading..." : "Select Project Directory"}
              </span>
            </Button>
          </label>
          <input
            id="directory-input"
            type="file"
            className="hidden"
            // @ts-ignore - webkitdirectory is not in the TypeScript types but is supported
            webkitdirectory=""
            multiple
            onChange={handleDirectorySelect}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Select the root directory of your Go project to automatically detect packages and functions
          </p>
        </div>
      </div>
    </Card>
  );
};