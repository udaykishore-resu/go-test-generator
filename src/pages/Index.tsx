import { useState } from "react";
import { ProjectSelector } from "@/components/ProjectSelector";
import { ProjectBrowser } from "@/components/ProjectBrowser";
import { CodeEditor } from "@/components/CodeEditor";
import { TestGenerator } from "@/components/TestGenerator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileCode, TestTube, Sparkles } from "lucide-react";
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

const Index = () => {
  const [selectedPackage, setSelectedPackage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [generatedTest, setGeneratedTest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<GoPackage[]>([]);
  const { toast } = useToast();

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    // Reset generated test when method changes
    setGeneratedTest("");
    
    // Load the source code for the selected method
    if (selectedPackage && method) {
      const pkg = packages.find(p => p.name === selectedPackage);
      const func = pkg?.functions.find(f => f.name === method);
      if (func) {
        setInputCode(func.sourceCode);
      }
    }
  };

  const handleProjectLoad = (loadedPackages: GoPackage[]) => {
    setPackages(loadedPackages);
    // Reset selections when new project is loaded
    setSelectedPackage("");
    setSelectedMethod("");
    setInputCode("");
    setGeneratedTest("");
  };

  const generateSampleCode = () => {
    const sampleCode = `package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"github.com/gorilla/mux"
)

type User struct {
	ID    int    \`json:"id"\`
	Name  string \`json:"name"\`
	Email string \`json:"email"\`
}

var users = []User{
	{ID: 1, Name: "John Doe", Email: "john@example.com"},
	{ID: 2, Name: "Jane Smith", Email: "jane@example.com"},
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	
	for _, user := range users {
		if user.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(user)
			return
		}
	}
	
	http.Error(w, "User not found", http.StatusNotFound)
}`;
    setInputCode(sampleCode);
    setSelectedPackage("handlers");
    setSelectedMethod("GetUser");
  };

  const handleGenerate = async (testType: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedTestCode = generateMockTest(testType, selectedPackage, selectedMethod);
    setGeneratedTest(generatedTestCode);
    setIsLoading(false);
    
    toast({
      title: "Test Generated Successfully",
      description: `Generated ${testType} test for ${selectedPackage}.${selectedMethod}`,
    });
  };

  const generateMockTest = (testType: string, pkg: string, method: string) => {
    switch (testType) {
      case "rest":
        return `package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
)

func TestGetUser(t *testing.T) {
	tests := []struct {
		name           string
		userID         string
		expectedStatus int
		expectedUser   *User
	}{
		{
			name:           "Valid user ID",
			userID:         "1",
			expectedStatus: http.StatusOK,
			expectedUser:   &User{ID: 1, Name: "John Doe", Email: "john@example.com"},
		},
		{
			name:           "Invalid user ID format",
			userID:         "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedUser:   nil,
		},
		{
			name:           "User not found",
			userID:         "999",
			expectedStatus: http.StatusNotFound,
			expectedUser:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, err := http.NewRequest("GET", "/users/"+tt.userID, nil)
			assert.NoError(t, err)

			rr := httptest.NewRecorder()
			router := mux.NewRouter()
			router.HandleFunc("/users/{id}", GetUser)
			router.ServeHTTP(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)

			if tt.expectedUser != nil {
				var user User
				err := json.Unmarshal(rr.Body.Bytes(), &user)
				assert.NoError(t, err)
				assert.Equal(t, *tt.expectedUser, user)
			}
		})
	}
}`;
      
      case "unit":
        return `package ${pkg}

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func Test${method}(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected interface{}
		wantErr  bool
	}{
		{
			name:     "Valid input",
			input:    "test input",
			expected: "expected output",
			wantErr:  false,
		},
		{
			name:     "Invalid input",
			input:    nil,
			expected: nil,
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := ${method}(tt.input)
			
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}`;
      
      case "grpc":
        return `package ${pkg}

import (
	"context"
	"testing"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func Test${method}(t *testing.T) {
	tests := []struct {
		name     string
		req      interface{}
		expected interface{}
		wantErr  codes.Code
	}{
		{
			name:     "Valid request",
			req:      &pb.TestRequest{},
			expected: &pb.TestResponse{},
			wantErr:  codes.OK,
		},
		{
			name:     "Invalid request",
			req:      nil,
			expected: nil,
			wantErr:  codes.InvalidArgument,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx := context.Background()
			server := &TestServer{}
			
			resp, err := server.${method}(ctx, tt.req)
			
			if tt.wantErr != codes.OK {
				assert.Error(t, err)
				st, ok := status.FromError(err)
				assert.True(t, ok)
				assert.Equal(t, tt.wantErr, st.Code())
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, resp)
			}
		})
	}
}`;
      
      default:
        return `package ${pkg}

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func Test${method}(t *testing.T) {
	// TODO: Implement test for ${method}
	t.Skip("Test not implemented yet")
}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TestTube className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Go Test Generator</h1>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={generateSampleCode}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Load Sample
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Generate comprehensive unit tests for your Go functions, REST APIs, GraphQL, and gRPC services
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <ProjectBrowser onProjectLoad={handleProjectLoad} />
            <ProjectSelector
              selectedPackage={selectedPackage}
              selectedMethod={selectedMethod}
              onPackageChange={setSelectedPackage}
              onMethodChange={handleMethodChange}
              packages={packages}
            />
            <TestGenerator
              selectedPackage={selectedPackage}
              selectedMethod={selectedMethod}
              inputCode={inputCode}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-[700px]">
              {/* Input Code */}
              <Card className="flex flex-col">
                <CodeEditor
                  value={inputCode}
                  onChange={setInputCode}
                  placeholder="Paste your Go code here..."
                  title="Source Code"
                />
              </Card>

              {/* Generated Test */}
              <Card className="flex flex-col">
                <CodeEditor
                  value={generatedTest}
                  onChange={() => {}}
                  readOnly
                  title="Generated Test"
                  placeholder={isLoading ? "Generating test..." : "Generated test will appear here"}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;