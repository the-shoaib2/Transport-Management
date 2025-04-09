import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRoutes.js'
import dotenv from 'dotenv'
import adminRouter from './routes/adminRoutes.js'
import publicRouter from './routes/publicRoutes.js'
import { setupDatabase } from './database/lib/setup.js'
import { connectToDatabase } from './database/mysql.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Initialize database
setupDatabase()
    .then(() => console.log('Database setup completed'))
    .catch(err => console.error('Database setup failed:', err))

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' })
})

// Routes
app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/public', publicRouter)

app.get('/', (req, res) => {
    res.send("Hello World")
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

// Start server
app.listen(PORT, async () => {
    console.log("====================================")
    console.log(`Server is running on port ${PORT}`)
    console.log("====================================")
    console.log(`CORS enabled for: ${process.env.CLIENT_URL || "http://localhost:5174"}`)
    
    try {
        // Ensure database connection is established
        await connectToDatabase();
        
        // Setup database (roles, etc.)
        await setupDatabase();
        
        console.log("Database setup completed successfully");
    } catch (error) {
        console.error("Error during database setup:", error);
    }
})