import mongo from 'mongoose';

const userSchema = new mongo.Schema({
  google_mail: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: ' ' },
  profilePhoto: { type: String, default: 'default.png' },
});

export default mongo.model('user_data', userSchema);
