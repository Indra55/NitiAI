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

export const FALLBACK_QUESTIONS: DSAQuestion[] = [
    {
        title: "Low-Latency Rate Limiter (Token Bucket)",
        description: "Design and implement a token bucket rate limiter class that allows up to `capacity` requests every `refillRate` seconds. Given an array of request timestamps in milliseconds, return an array of booleans indicating whether each request was accepted (`true`) or rate-limited (`false`).",
        difficulty: "Medium",
        example: {
            input: "capacity = 3, refillRate = 1000, requests = [0, 100, 200, 300, 1100]",
            output: "[true, true, true, false, true]"
        },
        testCases: [
            { input: "3, 1000, [0, 100, 200, 300, 1100]", output: "[true, true, true, false, true]" },
            { input: "2, 500, [0, 100, 200]", output: "[true, true, false]" }
        ],
        boilerplates: {
            javascript: "// Write your solution below\nfunction solution(capacity, refillRate, requests) {\n  // Your code here\n  return [];\n}",
            python: "# Write your solution below\ndef solution(capacity, refillRate, requests):\n    # Your code here\n    return []",
            cpp: "// Write your solution below\nclass Solution {\npublic:\n    vector<bool> solution(int capacity, int refillRate, vector<int> requests) {\n        // Your code here\n        return {};\n    }\n};"
        }
    },
    {
        title: "LRU Cache Memory Management",
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with fixed `capacity`. Implement `get(key)` and `put(key, value)` with O(1) average time complexity.",
        difficulty: "Medium",
        example: {
            input: "capacity = 2, actions = ['put(1,1)', 'put(2,2)', 'get(1)']",
            output: "[null, null, 1]"
        },
        testCases: [
            { input: "2, ['put(1,1)', 'put(2,2)', 'get(1)']", output: "[null, null, 1]" }
        ],
        boilerplates: {
            javascript: "// Write your solution below\nfunction solution(capacity, actions) {\n  // Your code here\n  return [];\n}",
            python: "# Write your solution below\ndef solution(capacity, actions):\n    # Your code here\n    return []",
            cpp: "// Write your solution below\nclass Solution {\npublic:\n    vector<int> solution(int capacity, vector<string> actions) {\n        // Your code here\n        return {};\n    }\n};"
        }
    }
];

export async function generateCodingQuestions(
    domain: string = "DSA",
    difficulty: string = "Medium",
    topic: string = "General"
): Promise<DSAQuestion[]> {
    try {
        const response = await fetch("http://localhost:5555/api/coding/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ domain, difficulty, topic })
        });

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.questions) && data.questions.length > 0) {
                return data.questions;
            }
        }
    } catch (error) {
        console.warn("Sarvam AI question generation API error, using fallback dataset:", error);
    }
    return FALLBACK_QUESTIONS;
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
