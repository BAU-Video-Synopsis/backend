const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uploadedVideoSchema = new Schema({
  name: { type: String, default: 'Untitled Video' },
  videoUrl: { type: String, required: true },
  time: { type: String, default: 'Unknown' },
  size: { type: Number, default: 0 }
});

const UploadedVideo = mongoose.model('UploadedVideo', uploadedVideoSchema);
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
module.exports ={ UploadedVideo , User};
