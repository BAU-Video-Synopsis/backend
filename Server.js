const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://sarpertatkoy:Dce2208SCtgCNPuL@capstone.aajahuz.mongodb.net/Capstone', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Middleware for parsing form data
const upload = multer({ dest: 'uploads/' });

// Define a schema for Video model
const videoSchema = new mongoose.Schema({
    title: String,
    videoUrl: String
});
const Video = mongoose.model('Video', videoSchema);
// Handle video upload
app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        // Compress video using Ffmpeg
        const compressedFileName = compressed_${req.file.originalname};
        ffmpeg(req.file.path)
            .output(compressedFileName)
            .videoCodec('libx264') // Specify video codec for compression
            .on('end', async () => {
                // Save video details to MongoDB
                const video = new Video({
                    title: req.body.title || 'Untitled Video',
                    videoUrl: /videos/${compressedFileName}
                });
                await video.save();

                // Respond with success message
                res.status(201).json({ message: 'Video uploaded and compressed successfully' });
            }
            .on('error', (err) => {
                console.error('Error compressing video:', err);
                res.status(500).json({ error: 'Error compressing video' });
            })
            .run();
        } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Error uploading video' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(Server is running on http://localhost:${PORT});
});