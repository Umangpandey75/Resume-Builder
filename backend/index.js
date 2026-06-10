import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Analysis from './models/Analysis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ats_analyzer';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// DB connection state
let isMongoConnected = false;
let inMemoryHistory = [];

async function connectDB() {
  console.log('Attempting to connect to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    isMongoConnected = true;
    console.log('MongoDB connected successfully at:', MONGODB_URI);
  } catch (error) {
    isMongoConnected = false;
    console.error('MongoDB connection failed. Falling back to IN-MEMORY storage.');
    console.error('Error details:', error.message);
    console.log('Note: History will be lost when the server restarts. Run a local MongoDB instance to persist history.');
  }
}

connectDB();

// Routes

// Get all history (List summary)
app.get('/api/history', async (req, res) => {
  try {
    if (isMongoConnected) {
      // Exclude large fields to keep response lightweight
      const list = await Analysis.find({}, { fileBlob: 0, resumeText: 0, jobDescription: 0 })
        .sort({ createdAt: -1 });
      return res.json(list);
    } else {
      // Format in-memory list summary (exclude fileBlob, resumeText, jobDescription)
      const list = inMemoryHistory
        .map(({ fileBlob, resumeText, jobDescription, ...summary }) => summary)
        .sort((a, b) => b.createdAt - a.createdAt);
      return res.json(list);
    }
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to retrieve analysis history' });
  }
});

// Get single history entry (Full details)
app.get('/api/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected) {
      const entry = await Analysis.findById(id);
      if (!entry) return res.status(404).json({ error: 'Analysis record not found' });
      return res.json(entry);
    } else {
      const entry = inMemoryHistory.find(item => item.id === id);
      if (!entry) return res.status(404).json({ error: 'Analysis record not found' });
      return res.json(entry);
    }
  } catch (err) {
    console.error('Error fetching detailed record:', err);
    res.status(500).json({ error: 'Failed to retrieve analysis details' });
  }
});

// Save a new analysis
app.post('/api/history', async (req, res) => {
  const { fileName, fileBlob, resumeText, jobDescription, result } = req.body;

  if (!fileName || !fileBlob || !resumeText || !jobDescription || !result) {
    return res.status(400).json({ error: 'Missing required fields in request body' });
  }

  try {
    if (isMongoConnected) {
      const newAnalysis = new Analysis({
        fileName,
        fileBlob,
        resumeText,
        jobDescription,
        result
      });
      await newAnalysis.save();
      return res.status(201).json(newAnalysis);
    } else {
      const newEntry = {
        id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
        fileName,
        fileBlob,
        resumeText,
        jobDescription,
        result,
        createdAt: new Date()
      };
      inMemoryHistory.push(newEntry);
      return res.status(201).json(newEntry);
    }
  } catch (err) {
    console.error('Error saving analysis:', err);
    res.status(500).json({ error: 'Failed to save analysis record' });
  }
});

// Delete an analysis record
app.delete('/api/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected) {
      const result = await Analysis.findByIdAndDelete(id);
      if (!result) return res.status(404).json({ error: 'Analysis record not found' });
      return res.json({ message: 'Record deleted successfully' });
    } else {
      const initialLength = inMemoryHistory.length;
      inMemoryHistory = inMemoryHistory.filter(item => item.id !== id);
      if (inMemoryHistory.length === initialLength) {
        return res.status(404).json({ error: 'Analysis record not found' });
      }
      return res.json({ message: 'Record deleted successfully (in-memory)' });
    }
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// Delete all history
app.delete('/api/history', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Analysis.deleteMany({});
      return res.json({ message: 'All analysis history cleared successfully' });
    } else {
      inMemoryHistory = [];
      return res.json({ message: 'All analysis history cleared successfully (in-memory)' });
    }
  } catch (err) {
    console.error('Error clearing history:', err);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: isMongoConnected ? 'MongoDB (connected)' : 'In-Memory Fallback (MongoDB disconnected)',
    time: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for all origins.`);
});
