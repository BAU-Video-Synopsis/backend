const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { UploadedVideo, User } = require('./schemas/schemas');
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/uploadVideo', upload.single('video'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const compressedFileName = `compressed_${req.file.filename}`;
    const compressedFilePath = path.join(__dirname, 'uploads', compressedFileName);

    ffmpeg(filePath)
      .output(compressedFilePath)
      .videoCodec('libx264')
      .on('end', async () => {
        ffmpeg.ffprobe(compressedFilePath, async (err, metadata) => {
          if (err) {
            console.error('Video boyutu alınamadı:', err);
            return res.status(500).json({ error: 'Error getting video size' });
          }

          const { width, height } = metadata.streams[0];
          const sizeInBytes = metadata.format.size;
          const duration = metadata.format.duration;

          const newVideo = new UploadedVideo({
            name: 'enyenivideo',
            time: duration,
            size: sizeInBytes,
            videoUrl: `/uploads/${compressedFileName}` // HTTP yolu kullanıyoruz
          });

          await newVideo.save();

          res.status(201).json({
            message: 'Video uploaded and compressed successfully',
            videoUrl: newVideo.videoUrl,
            videoSize: { width, height }
          });
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
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    if (error.code === 11000) {
      console.log(error);
      res.status(400).send('Email already exists');
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

// User login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
    const videos = await UploadedVideo.find();
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
