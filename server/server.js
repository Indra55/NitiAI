const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")

require("dotenv").config()

// CORS configuration - allow frontend to communicate with backend
const allowedOrigins = [
    "http://localhost:3000",
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

// Catch malformed JSON (must be right after express.json())
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


// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        message: "HackSync API Server",
        version: "1.0.0",
        status: "running"
    })
})



// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: "Internal server error" })
})


const PORT = process.env.PORT || 5555
app.listen(PORT, () => console.log(`🚀 API Server running on port ${PORT}`))
