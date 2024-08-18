const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Fixed typo: 'uniqure' to 'unique'
  },
  password: {
    type: String,  // Fixed typo: 'string' to 'String'
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  sentRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  receivedRequests: [{  // Fixed typo: 'recieved' to 'received'
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  images: [String],
  bio: String,
  hobbies: [String],
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;