const express = require("express");
const router = express.Router();
const axios = require("axios");

// Piston API Configuration
const EXECUTION_API_URL = process.env.EXECUTION_API_URL || "http://98.94.81.73/api/v2/execute";

// Language Alias map for Piston
const LANGUAGE_MAP = {
    javascript: { language: "javascript", version: "18.15.0" },
    python: { language: "python", version: "3.10.0" },
    cpp: { language: "c++", version: "10.2.0" }
};

router.post("/", async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({ error: "Code and language are required" });
        }

        const langConfig = LANGUAGE_MAP[language];
        if (!langConfig) {
            return res.status(400).json({ error: "Unsupported language" });
        }

        // Prepare Piston submission
        const submissionData = {
            language: langConfig.language,
            version: langConfig.version,
            files: [
                {
                    content: code
                }
            ],
            stdin: "",
            args: [],
            compile_timeout: 10000,
            run_timeout: 3000,
        };

        // Submit to Piston
        const response = await axios.post(EXECUTION_API_URL, submissionData, {
            headers: { "Content-Type": "application/json" }
        });

        const result = response.data;

        if (result.run) {
            return res.json({
                output: result.run.output,
                code: result.run.code,
                signal: result.run.signal
            });
        } else {
            return res.json({ error: "No run result returned" });
        }

    } catch (error) {
        console.error("Execution error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to execute code" });
    }
});

module.exports = router;
