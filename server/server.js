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
app.use("/api/coding", require("./routes/coding"))

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
app.use("/api/coding", require("./routes/coding"))
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

function hasAny(text, terms) {
    return terms.some((term) => new RegExp(`\\b${term}\\b`, "i").test(String(text || "")))
}

function discoveryRubric(transcript) {
    const requirements = hasAny(transcript, ["requirement", "latency", "scale", "traffic", "throughput", "availability", "consistency", "read", "write"])
    return requirements
        ? { passed: true, feedback: "Great job identifying a meaningful product or scale requirement." }
        : { passed: false, feedback: "A good tip is to name concrete requirements before choosing a framework: try thinking about expected traffic, latency, availability, consistency, read/write patterns, or growth assumptions." }
}

function drawingRubric(nodes, edges) {
    const kinds = new Set(nodes.map((node) => node.data?.kind))
    const adjacency = new Map(nodes.map((node) => [node.id, []]))
    edges.forEach((edge) => adjacency.get(edge.source)?.push(edge.target))
    const canReach = (fromKind, toKind) => nodes.filter((node) => node.data?.kind === fromKind).some((start) => {
        const visited = new Set([start.id]); const queue = [start.id]
        while (queue.length) {
            const current = queue.shift()
            if (nodes.find((node) => node.id === current)?.data?.kind === toKind) return true
            for (const next of adjacency.get(current) || []) if (!visited.has(next)) { visited.add(next); queue.push(next) }
        }
        return false
    })
    const hasRequestPath = canReach("client", "web-server") && canReach("web-server", "database")
    if (!kinds.has("client") || !kinds.has("web-server") || !kinds.has("database")) {
        return { passed: false, feedback: "We need a complete request path first. Try adding a Client, Web Server, and Database." }
    }
    if (!hasRequestPath) return { passed: false, feedback: "Make sure to connect the request path so traffic can flow from Client to Web Server to Database. Intermediate nodes are fine." }
    return { passed: true, feedback: "Excellent, the core request path is represented and connected." }
}

function deepDiveRubric(transcript) {
    const covered = hasAny(transcript, ["cache", "replica", "queue", "idempot", "retry", "failure", "availability", "consistency", "partition", "rate limit", "load", "scale", "fan-out"])
    return covered
        ? { passed: true, feedback: "Great explanation of a concrete reliability or scaling trade-off." }
        : { passed: false, feedback: "Try to be a bit more specific about one failure or scale trade-off: caching, retries, idempotency, queues, replicas, consistency, rate limits, or load spikes." }
}

async function phraseWireItUpCritique({ issue, graph, transcript, languageCode }) {
    const fallback = `Let's think about this part: ${issue.description} How might we improve or fix that?`
    if (!process.env.SARVAM_API_KEY) return { critique: fallback, usedFallback: true }
    const prompt = `You are a supportive tech lead acting as a mentor in a system design learning session. Current architecture (JSON): ${JSON.stringify(graph)}. Candidate's recent explanation, spoken in ${languageCode}: ${transcript || "No spoken explanation yet."}. Check ONLY for this already-detected issue: ${issue.description}. Respond with ONE short, conversational hint or guiding question under 3 sentences, written in ${languageCode}, the same language the candidate just spoke. Do not give the exact answer immediately unless they seem completely stuck or have failed multiple times. Help them figure it out. Return only the hint.`
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
        return { critique: critique || fallback, usedFallback: !critique }
    } catch (error) {
        console.error("[wire-it-up] Sarvam-105B critique failed:", error.response?.data || error.message)
        return { critique: fallback, usedFallback: true }
    }
}

const interviewFallbacks = {
    "flash-sale": [
        "Good start. Now imagine hundreds of thousands of buyers hit Checkout together. How do you reserve inventory without overselling?",
        "Where would you make the payment and inventory operations idempotent, and why?",
        "What work can leave the request path and move into a queue without hurting the buyer experience?",
    ],
    "social-feed": [
        "Good start. Would you fan out posts when they are written, or build feeds when users read them? Walk me through that trade-off.",
        "How do you protect the feed database when a celebrity publishes a post?",
        "Which parts of this path would you cache, and how would you handle invalidation?",
    ],
    "photo-sharing": [
        "Good start. What happens immediately after a user uploads a large image, and which work should be asynchronous?",
        "How will a user in another region receive a popular image quickly?",
        "How would you retry failed image transformations without duplicating work?",
    ],
}

async function phraseWireItUpFollowup({ graph, transcript, languageCode, challengeId, challengePrompt, turn }) {
    const fallbackList = interviewFallbacks[challengeId] || ["What is the first scaling bottleneck you expect in this design, and how would you address it?"]
    const fallback = fallbackList[Math.min(turn, fallbackList.length - 1)]
    if (!process.env.SARVAM_API_KEY) return { critique: fallback, usedFallback: true }
    const prompt = `You are a supportive tech lead acting as a mentor in a live system design learning session. The exercise is: ${challengePrompt}. The candidate just said in ${languageCode}: ${transcript}. Their current architecture is: ${JSON.stringify(graph)}. Ask exactly ONE concise, natural follow-up question that gives them a hint to explain a missing trade-off, bottleneck, failure mode, or scaling decision. Guide them gently instead of giving the answer outright, but provide the answer if they seem completely stuck. Write in ${languageCode} in under two sentences. Return only the question or guidance.`
    try {
        const response = await axios.post("https://api.sarvam.ai/v1/chat/completions", {
            model: "sarvam-105b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.45,
            max_tokens: 160,
            reasoning_effort: null,
        }, {
            headers: { "api-subscription-key": process.env.SARVAM_API_KEY, "Content-Type": "application/json" },
            timeout: 45_000,
        })
        return { critique: keepThreeSentences(response.data?.choices?.[0]?.message?.content) || fallback, usedFallback: false }
    } catch (error) {
        console.error("[wire-it-up] Sarvam-105B follow-up failed:", error.response?.data || error.message)
        return { critique: fallback, usedFallback: true }
    }
}

async function phraseWireItUpFinalFeedback({ graph, challengePrompt, languageCode }) {
    const fallback = "That completes our learning session. You made the core request path clear; now you can continue to strengthen failure handling, capacity assumptions, and the consistency trade-offs we discussed."
    if (!process.env.SARVAM_API_KEY) return { critique: fallback, usedFallback: true }
    const prompt = `You are closing a system design learning session. Question: ${challengePrompt}. Architecture JSON: ${JSON.stringify(graph)}. Give the candidate a balanced closing review in ${languageCode}: one concrete strength, one concrete improvement, and one next step. Keep it conversational, encouraging, and under three sentences. Return only the feedback.`
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
        return { critique: keepThreeSentences(response.data?.choices?.[0]?.message?.content) || fallback, usedFallback: false }
    } catch (error) {
        console.error("[wire-it-up] Sarvam-105B final feedback failed:", error.response?.data || error.message)
        return { critique: fallback, usedFallback: true }
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

    socket.on("interview_start", ({ challengeId, challengePrompt } = {}) => {
        if (socket.data.wireItUpIntroSent && socket.data.wireItUpChallenge?.challengeId === challengeId) return
        socket.data.wireItUpChallenge = { challengeId, challengePrompt }
        socket.data.wireItUpInterviewStage = "discovery"
        socket.data.wireItUpConversationTurn = 0
        socket.data.wireItUpDeepDiveTurns = 0
        socket.data.wireItUpPendingTranscript = ""
        socket.data.wireItUpLastEvaluationId = 0
        socket.data.wireItUpRaisedPatterns = new Set()
        socket.data.wireItUpIntroSent = true
        const intro = `Welcome to your system design learning session. I’ll be your tech lead and mentor. Today we'll collaboratively design this system on the canvas while you explain your decisions out loud. I’ll let you finish each thought, then I’ll provide hints and guiding questions about scale, reliability, and trade-offs to help you learn. The scenario is: ${challengePrompt} Before you draw anything, what are the key requirements and assumptions you would clarify first?`
        socket.emit("architecture_evaluation", { critique: intro, kind: "introduction", languageCode: "en-IN", nextStage: "discovery" })
        synthesizeWireItUpCritique(intro, "en-IN").then((audioBase64) => {
            socket.emit("critique_audio", { audioBase64, mimeType: "audio/wav", languageCode: "en-IN" })
        }).catch((error) => {
            console.error("[wire-it-up] Intro synthesis failed:", error.message)
            socket.emit("critique_audio_error", { message: "The introduction voice is unavailable; you can still continue by speaking or replaying the text." })
        })
    })

    socket.on("evaluate_architecture", async ({ graph, transcript, languageCode, challengeId, challengePrompt, triggerSource, evaluationId } = {}) => {
        if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return
        if (Number.isFinite(evaluationId) && evaluationId <= (socket.data.wireItUpLastEvaluationId || 0)) return
        if (Number.isFinite(evaluationId)) socket.data.wireItUpLastEvaluationId = evaluationId
        socket.data.wireItUpRaisedPatterns ??= new Set()
        const issue = selectWireItUpIssue(graph, socket.data.wireItUpRaisedPatterns)
        socket.data.wireItUpConversationTurn ??= 0
        socket.data.wireItUpInterviewStage ??= "discovery"

        try {
            // Specific architecture critiques take precedence; otherwise this is a
            // normal interview follow-up so the session feels conversational.
            // A canvas edge can raise a concrete architecture concern, but it is
            // never treated as a candidate answer that warrants a new question.
            const stage = socket.data.wireItUpInterviewStage
            if (!issue && triggerSource !== "user_pause") {
                return socket.emit("architecture_evaluation", { critique: null })
            }
            let candidateTranscript = transcript || ""
            if (triggerSource === "user_pause") {
                socket.data.wireItUpPendingTranscript = `${socket.data.wireItUpPendingTranscript || ""} ${candidateTranscript}`.trim()
                candidateTranscript = socket.data.wireItUpPendingTranscript
                // VAD pauses are not necessarily complete thoughts. Hold short
                // fragments such as “Okay” or “Yeah, so my main…” until the next
                // pause instead of advancing the interview state.
                if (candidateTranscript.length < 35) {
                    return socket.emit("architecture_evaluation", { critique: null, waitingForMoreSpeech: true })
                }
            }
            let result
            let nextStage = stage
            if (triggerSource === "user_pause" && stage === "discovery") {
                const rubric = discoveryRubric(candidateTranscript)
                result = { critique: rubric.passed ? `Great job identifying those requirements. Before you draw, what do you think about the feed's latency target, read and write shape, and how fresh the content needs to be? Then we’ll sketch the main request path.` : `I heard the framework choice, but let’s ground this in the product first as a learning exercise. What latency, traffic pattern, availability, and freshness should this feed support?`, usedFallback: true }
                nextStage = rubric.passed ? "drawing" : "discovery"
            } else if (triggerSource === "user_pause" && stage === "drawing" && !issue) {
                const rubric = drawingRubric(graph.nodes, graph.edges)
                if (!rubric.passed) {
                    result = { critique: `Let's hold off on the trade-offs for a moment. ${rubric.feedback} Try adding that core path, then walk me through the request flow.`, usedFallback: true }
                } else {
                    const followup = await phraseWireItUpFollowup({ graph, transcript: candidateTranscript, languageCode: languageCode || "en-IN", challengeId, challengePrompt, turn: socket.data.wireItUpConversationTurn })
                    result = { critique: `Great, I can see the core request path now. ${followup.critique}`, usedFallback: followup.usedFallback }
                    nextStage = "deep_dive"
                }
            } else if (stage === "deep_dive" && triggerSource === "user_pause") {
                const rubric = deepDiveRubric(candidateTranscript)
                if (!rubric.passed) {
                    result = { critique: `You're on the right track, but let's consider one more concrete trade-off. ${rubric.feedback} Try thinking about a specific failure or scale scenario.`, usedFallback: true }
                } else {
                    socket.data.wireItUpDeepDiveTurns = (socket.data.wireItUpDeepDiveTurns || 0) + 1
                    if (socket.data.wireItUpDeepDiveTurns >= 3) {
                    result = await phraseWireItUpFinalFeedback({ graph, challengePrompt, languageCode: languageCode || "en-IN" })
                    nextStage = "feedback"
                    } else {
                        result = await phraseWireItUpFollowup({ graph, transcript: candidateTranscript, languageCode: languageCode || "en-IN", challengeId, challengePrompt, turn: socket.data.wireItUpConversationTurn })
                    }
                }
            } else if (issue) {
                result = await phraseWireItUpCritique({ issue, graph, transcript: candidateTranscript, languageCode: languageCode || "en-IN" })
            } else {
                return socket.emit("architecture_evaluation", { critique: null })
            }
            if (issue) result.critique = `Let's pause here and look at one design risk to learn from. ${result.critique}`
            if (issue) socket.data.wireItUpRaisedPatterns.add(issue.id)
            if (triggerSource === "user_pause") socket.data.wireItUpPendingTranscript = ""
            if (stage !== "deep_dive") socket.data.wireItUpConversationTurn += 1
            socket.data.wireItUpInterviewStage = nextStage
            socket.emit("architecture_evaluation", {
                issueId: issue?.id || null,
                critique: result.critique,
                languageCode: languageCode || "en-IN",
                nextStage,
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
            if (issue) socket.data.wireItUpRaisedPatterns.delete(issue.id)
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
