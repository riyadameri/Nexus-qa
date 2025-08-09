const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb://riyadammmeri:OmGe6UeG1Q0hVJEq@ac-ujqhcf3-shard-00-00.7xu8hz3.mongodb.net:27017,ac-ujqhcf3-shard-00-01.7xu8hz3.mongodb.net:27017,ac-ujqhcf3-shard-00-02.7xu8hz3.mongodb.net:27017/?ssl=true&replicaSet=atlas-3anew8-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Enhanced Question Model
const Question = mongoose.model('Question', new mongoose.Schema({
    text: String,
    answer: { type: String, default: '' },
    answered: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}));

// Routes
// Submit a new question
app.post('/api/questions', async (req, res) => {
    try {
        const question = new Question({ 
            text: req.body.text,
            featured: req.body.featured || false
        });
        await question.save();
        res.status(201).json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all questions
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find().sort({ 
            featured: -1, 
            createdAt: -1 
        });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Answer a question
app.put('/api/questions/:id/answer', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { 
                answer: req.body.answer, 
                answered: true 
            },
            { new: true }
        );
        res.json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Feature a question
app.put('/api/questions/:id/feature', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { featured: true },
            { new: true }
        );
        res.json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Unfeature a question
app.put('/api/questions/:id/unfeature', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { featured: false },
            { new: true }
        );
        res.json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a question
app.delete('/api/questions/:id', async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve HTML files
app.get('/ask', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ask.html'));
});

app.get('/display', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access the Q&A system at:`);
    console.log(`- Homepage: http://localhost:${PORT}/`);
    console.log(`- Submit questions: http://localhost:${PORT}/ask`);
    console.log(`- Display questions: http://localhost:${PORT}/display`);
});