# Go Test Generator

A web-based tool that helps Go developers scaffold tests for their code. Pick a project and package, select a function, choose a test type, and it generates a starting test template you can copy out.

## Key features

Simulated project/package/function navigation for picking what to generate a test for. Supports five test types: unit tests (with mocks), integration tests (with real dependencies), REST API tests, gRPC tests, and GraphQL tests. Paste Go source code directly into the app, generate a test in real time, and copy the result with one click. Responsive layout that works on desktop and mobile.

## User workflow

Select a project directory (simulated), choose a package from the detected packages, pick a function from that package, choose a test type, paste or edit the Go source in the code area, click Generate Test, then Copy Code to grab the result.

## Tech stack

React 18 and TypeScript, built with Vite, UI components from shadcn-ui and Radix, Tailwind CSS.

## Running locally

```bash
git clone <this-repo-url>
cd go-test-generator
npm install
npm run dev
```

Then open the local dev server URL printed in your terminal.

## Build

```bash
npm run build
npm run preview
```

## Where this could go next

Right now test generation runs entirely in the browser against templates. A real backend that actually parses Go source (rather than templating off the pasted text) would make the generated tests more accurate, and would open the door to saving/reusing templates, exporting generated tests as files, and remembering generation history.
