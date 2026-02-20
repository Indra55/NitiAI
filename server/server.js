const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")

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
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

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

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`)

    socket.on("join_room", (data) => {
        socket.join(data)
        console.log(`User with ID: ${socket.id} joined room: ${data}`)
    })

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data)
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id)
    })
})

const PORT = process.env.PORT || 5555
server.listen(PORT, () => console.log(`🚀 API Server running on port ${PORT}`))
