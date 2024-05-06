const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const {UploadedVideo , User }   = require('./schemas/schemas')
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const port = 3001;
app.use(cors());
mongoose.connect('mongodb+srv://sarpertatkoy:Dce2208SCtgCNPuL@capstone.aajahuz.mongodb.net/Capstone');

app.use(bodyParser.json());
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


app.post('/uploadVideo', upload.single('video'), async (req, res) => {
    try {
      const filePath = path.join(__dirname, 'uploads', req.file.filename);
      const compressedFileName = `compressed_${req.file.filename}`;
      
      ffmpeg(filePath)
        .output(path.join(__dirname, 'uploads', compressedFileName))
        .videoCodec('libx264')
        .on('end', () => {
          const compressedFilePath = path.join(__dirname, 'uploads', compressedFileName);
          res.status(201).json({ 
            message: 'Video uploaded and compressed successfully',
            filePath: compressedFilePath // Sıkıştırılmış video dosyasının yolunu döndür
          });
        })
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
  

// User registration endpoint
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred during registration");
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send("User not found");
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send("Invalid password");
        }
        res.status(200).send("Login successful");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred during login");
    }
});

// Get all videos endpoint
app.get("/getVideos", async (req, res) => {
    try {
        const videos = await UploadedVideo.find({});
        res.json(videos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while fetching videos.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
