import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface DSAQuestion {
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    example: {
        input: string;
        output: string;
    };
    testCases: Array<{
        input: string;
        output: string;
    }>;
    boilerplates: {
        javascript: string;
        python: string;
        cpp: string;
    };
}

export async function generateCodingQuestions(difficulty: string = "Medium"): Promise<DSAQuestion[]> {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OpenRouter API key is missing");
    }

    const prompt = `
    Generate 1 unique DSA coding problem with ${difficulty} difficulty.
    
    REQUIRED JSON FORMAT:
    {
      "questions": [
        {
          "title": "Problem Title",
          "description": "Problem description...",
          "difficulty": "${difficulty}",
          "example": { "input": "...", "output": "..." },
          "testCases": [
            { "input": "...", "output": "..." },
            { "input": "...", "output": "..." }
          ],
          "boilerplates": {
            "javascript": "function solution(args) {\\n  // code\\n}",
            "python": "def solution(args):\\n    pass",
            "cpp": "class Solution {\\npublic:\\n    // code\\n};"
          }
        }
      ]
    }
  `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
            },
            body: JSON.stringify({
                model: "stepfun/step-3.5-flash:free",
                messages: [{ role: "user", content: prompt }]
            }),
        });

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.questions || [];
        }
        return [];
    } catch (error) {
        console.error("Failed to generate questions:", error);
        return [];
    }
}



const generateDriverCode = (code: string, language: string, testCases: any[]) => {
    // Robust parser that respects arrays, objects, and quotes
    const parseInput = (inputStr: string) => {
        const args: string[] = [];
        let current = '';
        let depth = 0;
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < inputStr.length; i++) {
            const char = inputStr[i];

            // Handle quotes
            if ((char === '"' || char === "'") && (i === 0 || inputStr[i - 1] !== '\\')) {
                if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                } else if (char === quoteChar) {
                    inQuotes = false;
                }
                current += char;
                continue;
            }

            // Track bracket depth
            if (!inQuotes) {
                if (char === '[' || char === '{' || char === '(') depth++;
                if (char === ']' || char === '}' || char === ')') depth--;

                // Split on comma only at depth 0
                if (char === ',' && depth === 0) {
                    args.push(current.trim());
                    current = '';
                    continue;
                }
            }
            current += char;
        }

        if (current.trim()) {
            args.push(current.trim());
        }

        // Process each argument
        return args.map(arg => {
            const value = arg.trim();
            // If already quoted, array, object, number, or boolean, return as-is
            if (value.startsWith('"') || value.startsWith("'") ||
                value.startsWith('[') || value.startsWith('{') ||
                !isNaN(Number(value)) || value === 'true' || value === 'false') {
                return value;
            }
            // Otherwise wrap in quotes (plain string)
            return `"${value}"`;
        }).join(', ');
    };

    if (language === 'javascript') {
        let driver = code + "\n\n// Driver Code\n";
        testCases.forEach((tc) => {
            driver += `try { console.log("---TEST-CASE-START---"); const res = solution(${parseInput(tc.input)}); console.log("---RVAL---"); console.log(JSON.stringify(res)); } catch(e) { console.log(e.message); }\n`;
        });
        return driver;
    } else if (language === 'python') {
        let driver = code + "\n\n# Driver Code\nimport json\n";
        testCases.forEach((tc) => {
            driver += `print("---TEST-CASE-START---")\ntry:\n    res = solution(${parseInput(tc.input)})\n    print("---RVAL---")\n    print(json.dumps(res))\nexcept Exception as e:\n    print(str(e))\n`;
        });
        return driver;
    } else if (language === 'cpp') {
        return code;
    }
    return code;
};

export async function executeCode(code: string, language: string, testCases: any[]) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

    // 1. Generate Driver Code
    const fullCode = generateDriverCode(code, language, testCases);

    try {
        const response = await fetch(`${API_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code: fullCode,
                language,
                testCases // Backend doesn't use this for Piston, but good for logs
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Execution failed");
        }

        const data = await response.json();

        // 2. Parse Results
        const rawOutput = data.output || "";

        // If there's an error signal or stderr (handled by backend returning 'output' usually, but check)

        const parts = rawOutput.split("---TEST-CASE-START---");
        const globalStdout = parts[0].trim();

        const results = testCases.map((tc, index) => {
            const caseOutputRaw = parts[index + 1] || "";
            const [caseStdoutRaw, caseRvalRaw] = caseOutputRaw.split("---RVAL---");

            const caseStdout = caseStdoutRaw ? caseStdoutRaw.trim() : "";
            let actual = caseRvalRaw ? caseRvalRaw.trim() : "undefined";

            // Normalize expected/actual
            const passed = actual.replace(/\s/g, '') === tc.output.toString().replace(/\s/g, '');

            return {
                input: tc.input,
                expected: tc.output,
                actual: actual,
                stdout: caseStdout,
                passed: passed
            };
        });

        const allPassed = results.length > 0 && results.every((r: any) => r.passed);

        return {
            success: allPassed,
            results: results,
            compilerOutput: globalStdout
        };

    } catch (error: any) {
        console.error("Evaluation Error:", error);
        return {
            success: false,
            results: [],
            compilerOutput: `Error executing code: ${error.message}`
        };
    }
}
