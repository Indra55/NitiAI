const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")
const multer = require("multer")
const axios = require("axios")
const FormData = require("form-data")

require("dotenv").config()

// CORS configuration - allow frontend to communicate with backend
const allowedOrigins = [
    "http://localhost:3000",
    "https://singularity-skill-sphere-hacksync.vercel.app",
    "http://localhost:3001",
    process.env.FRONTEND_URL
].filter((origin, index, self) => origin && self.indexOf(origin) === index);

const corsOptions = {
    origin: allowedOrigins,
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}
// Middleware
app.use(cors(corsOptions))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({ limit: '50mb' }))

// Catch malformed JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error(`❌ JSON Syntax Error: ${err.message}`);
        return res.status(400).json({
            error: "Malformed JSON request",
            details: err.message
        });
    }
    next();
});

app.use(cookieParser())

// Routes
app.use("/api/users", require("./routes/users"))
app.use("/api/jobs", require("./routes/jobs"))
app.use("/api/onboarding", require("./routes/onboarding"))
app.use("/api/profile", require("./routes/profile"))
app.use("/api/recommendations", require("./routes/recommendations"))
app.use("/api/skills", require("./routes/skills"))
app.use("/api/resume", require("./routes/resume"))
app.use("/api/planner", require("./routes/planner"))
app.use("/api/execute", require("./routes/execute"))
app.use("/api/voice-resume", require("./routes/voiceResume"))

// Wire It Up Phase 2 — utterances are intentionally request/response. Saaras
// streaming remains an upgrade path; VAD creates clean, short REST utterances.
const wireItUpUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
})

app.post("/api/system-design/transcribe", wireItUpUpload.single("audio"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "An audio utterance is required." })
    if (!process.env.SARVAM_API_KEY) {
        return res.status(503).json({
            error: "SARVAM_API_KEY is not configured on the server.",
            code: "SARVAM_NOT_CONFIGURED",
        })
    }

    // Active mode is auto-detection. A client can deliberately provide a known
    // fallback code if recognition needs stabilising for a particular session.
    const languageCode = req.body.languageCode && req.body.languageCode !== "auto"
        ? req.body.languageCode
        : "unknown"
    const form = new FormData()
    form.append("file", req.file.buffer, {
        filename: req.file.originalname || "utterance.webm",
        contentType: req.file.mimetype || "audio/webm",
    })
    form.append("model", "saaras:v3")
    form.append("mode", "transcribe")
    form.append("language_code", languageCode)

    try {
        const response = await axios.post("https://api.sarvam.ai/speech-to-text", form, {
            headers: { ...form.getHeaders(), "api-subscription-key": process.env.SARVAM_API_KEY },
            timeout: 45_000,
        })
        const data = response.data
        return res.json({
            transcript: data.transcript || "",
            languageCode: data.language_code || (languageCode === "unknown" ? "en-IN" : languageCode),
            languageProbability: data.language_probability ?? null,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        const status = error.response?.status || 502
        const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || "Sarvam transcription failed."
        console.error("[wire-it-up] Saaras transcription failed:", message)
        return res.status(status).json({ error: message, code: "SARVAM_STT_FAILED" })
    }
})
// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        message: "HackSync API Server",
        version: "1.0.0",
        status: "running"
    })
})

// TEMPORARY DEBUG: Test match analysis without auth - REMOVE AFTER DEBUGGING
app.post("/debug/test-match", async (req, res) => {
    console.log("[DEBUG] /debug/test-match hit!");
    const resumeService = require("./routes/resumeParser");
    try {
        const resumeText = "John Doe, Software Engineer with 2 years experience. Skills: JavaScript, Node.js, React, Python, SQL, Git. Education: B.Tech Computer Science from IIT Delhi 2024. Experience: Software Intern at Google (2023-2024) - built REST APIs using Node.js and Express.";
        const jd = req.body.jobDescription || "Backend Engineer - Requirements: Node.js, Python, REST APIs, SQL, Docker, Git. 0-2 years experience.";

        console.log("[DEBUG] Calling matchAnalysis...");
        const result = await resumeService.matchAnalysis(resumeText, jd);
        console.log("[DEBUG] matchAnalysis returned:", JSON.stringify(result).substring(0, 300));
        res.json(result);
    } catch (error) {
        console.error("[DEBUG] matchAnalysis FAILED:", error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: "Internal server error" })
})

const http = require("http")
const { Server } = require("socket.io")

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
})

const wireItUpAntiPatterns = [
    {
        id: "web_server_direct_database",
        description: "A Web Server connects directly to a Database with no Cache node in between.",
        matches: (nodes, edges) => {
            const byId = new Map(nodes.map((node) => [node.id, node]))
            return edges.some((edge) => {
                const source = byId.get(edge.source)?.data?.kind
                const target = byId.get(edge.target)?.data?.kind
                return (source === "web-server" && target === "database") || (source === "database" && target === "web-server")
            })
        },
    },
    {
        id: "multiple_web_servers_without_load_balancer",
        description: "Multiple Web Servers exist with no Load Balancer in front of them.",
        matches: (nodes) => nodes.filter((node) => node.data?.kind === "web-server").length > 1 && !nodes.some((node) => node.data?.kind === "load-balancer"),
    },
    {
        id: "async_work_without_queue",
        description: "Async/background work is named in the design but there is no Queue.",
        matches: (nodes) => {
            const mentionsAsyncWork = nodes.some((node) => /async|background|worker|job|email|notification|processing/i.test(String(node.data?.label || "")))
            return mentionsAsyncWork && !nodes.some((node) => node.data?.kind === "queue")
        },
    },
    {
        id: "single_point_of_failure",
        description: "There is a single Web Server, or a single Database with no Read Replica.",
        matches: (nodes) => {
            const webServers = nodes.filter((node) => node.data?.kind === "web-server").length
            const databases = nodes.filter((node) => node.data?.kind === "database").length
            const replicas = nodes.filter((node) => node.data?.kind === "read-replica").length
            return webServers === 1 || (databases === 1 && replicas === 0)
        },
    },
    {
        id: "static_content_without_cdn_or_cache",
        description: "Static/content delivery is implied, but no CDN or Cache is in front of the client-facing setup.",
        matches: (nodes) => {
            const staticContentIsImplied = nodes.some((node) => /static|asset|image|video|content/i.test(String(node.data?.label || "")))
            const deliveryLayerExists = nodes.some((node) => ["cdn", "cache"].includes(node.data?.kind))
            return staticContentIsImplied && !deliveryLayerExists
        },
    },
]

function selectWireItUpIssue(graph, raisedPatterns) {
    const nodes = Array.isArray(graph?.nodes) ? graph.nodes : []
    const edges = Array.isArray(graph?.edges) ? graph.edges : []
    return wireItUpAntiPatterns.find((issue) => !raisedPatterns.has(issue.id) && issue.matches(nodes, edges)) || null
}

function keepThreeSentences(text) {
    const sentences = String(text || "").match(/[^.!?।]+[.!?।]*/g) || []
    return sentences.slice(0, 3).join(" ").trim()
}

async function phraseWireItUpCritique({ issue, graph, transcript, languageCode }) {
    if (!process.env.SARVAM_API_KEY) {
        const error = new Error("SARVAM_API_KEY is not configured on the server.")
        error.code = "SARVAM_NOT_CONFIGURED"
        throw error
    }
    const prompt = `You are an aggressive but fair senior tech lead running a system design interview. Current architecture (JSON): ${JSON.stringify(graph)}. Candidate's recent explanation, spoken in ${languageCode}: ${transcript || "No spoken explanation yet."}. Check ONLY for this already-detected issue: ${issue.description}. Respond with ONE short, conversational critique or challenge question under 3 sentences, written in ${languageCode}, the same language the candidate just spoke. Do not mention other issues. Return only the critique.`
    try {
        const response = await axios.post("https://api.sarvam.ai/v1/chat/completions", {
            model: "sarvam-105b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.35,
            max_tokens: 180,
            reasoning_effort: null,
        }, {
            headers: { "api-subscription-key": process.env.SARVAM_API_KEY, "Content-Type": "application/json" },
            timeout: 45_000,
        })
        const critique = keepThreeSentences(response.data?.choices?.[0]?.message?.content)
        if (!critique) throw new Error("Sarvam-105B returned an empty critique.")
        return { critique }
    } catch (error) {
        console.error("[wire-it-up] Sarvam-105B critique failed:", error.response?.data || error.message)
        throw error
    }
}

const bulbulSupportedLanguages = new Set(["en-IN", "hi-IN", "bn-IN", "ta-IN", "te-IN", "kn-IN", "ml-IN", "mr-IN", "gu-IN", "pa-IN", "od-IN"])

async function synthesizeWireItUpCritique(text, languageCode) {
    if (!bulbulSupportedLanguages.has(languageCode)) {
        const error = new Error(`Bulbul v3 does not support ${languageCode}; choose a supported language fallback for voice playback.`)
        error.code = "BULBUL_LANGUAGE_UNSUPPORTED"
        throw error
    }
    const response = await axios.post("https://api.sarvam.ai/text-to-speech", {
        text,
        model: "bulbul:v3",
        target_language_code: languageCode,
        speaker: "shubh",
        pace: 1.05,
        output_audio_codec: "wav",
    }, {
        headers: { "api-subscription-key": process.env.SARVAM_API_KEY, "Content-Type": "application/json" },
        timeout: 45_000,
    })
    const audio = response.data?.audios?.join("")
    if (!audio) throw new Error("Bulbul returned no audio.")
    return audio
}

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`)

    socket.on("join_room", (data) => {
        socket.join(data)
        console.log(`User with ID: ${socket.id} joined room: ${data}`)
    })

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data)
    })

    // Wire It Up Phase 1: receive the debounced React Flow graph from a client.
    // Evaluation is intentionally not triggered here until the audio/evaluator phase.
    socket.on("canvas_update", (graph) => {
        if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
            socket.emit("canvas_sync_error", { message: "Invalid canvas graph payload." })
            return
        }

        socket.data.wireItUpGraph = graph
        socket.emit("canvas_synced", {
            nodeCount: graph.nodes.length,
            edgeCount: graph.edges.length,
            receivedAt: new Date().toISOString(),
        })
    })

    socket.on("evaluate_architecture", async ({ graph, transcript, languageCode } = {}) => {
        if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return
        socket.data.wireItUpRaisedPatterns ??= new Set()
        const issue = selectWireItUpIssue(graph, socket.data.wireItUpRaisedPatterns)
        if (!issue) return socket.emit("architecture_evaluation", { critique: null })

        // Mark before the remote call so close-together pause/edge events cannot duplicate it.
        socket.data.wireItUpRaisedPatterns.add(issue.id)
        try {
            const result = await phraseWireItUpCritique({
                issue,
                graph,
                transcript,
                languageCode: languageCode || "en-IN",
            })
            socket.emit("architecture_evaluation", {
                issueId: issue.id,
                critique: result.critique,
                languageCode: languageCode || "en-IN",
            })
            try {
                const audioBase64 = await synthesizeWireItUpCritique(result.critique, languageCode || "en-IN")
                socket.emit("critique_audio", { audioBase64, mimeType: "audio/wav", languageCode: languageCode || "en-IN" })
            } catch (error) {
                console.error("[wire-it-up] Bulbul synthesis failed:", error.response?.data || error.message)
                socket.emit("critique_audio_error", {
                    message: error.code === "BULBUL_LANGUAGE_UNSUPPORTED" ? error.message : "Voice critique is temporarily unavailable.",
                })
            }
        } catch (error) {
            socket.data.wireItUpRaisedPatterns.delete(issue.id)
            socket.emit("architecture_evaluation_error", {
                message: error.code === "SARVAM_NOT_CONFIGURED" ? error.message : "The critique service is temporarily unavailable.",
            })
        }
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id)
    })
})

const PORT = process.env.PORT || 5555
server.listen(PORT, () => console.log(`🚀 API Server running on port ${PORT}`))
