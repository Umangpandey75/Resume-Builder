import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileBlob: {
    type: String, // Base64 representation of the PDF file
    required: true
  },
  resumeText: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed, // The full analysis JSON output from LLM
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Analysis', AnalysisSchema);
