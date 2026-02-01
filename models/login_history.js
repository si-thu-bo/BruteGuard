const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  email: { type: String, required: true },
  device: { type: String, default: "Unknown" },
  ip: { type: String, default: "Unknown" },
  lat: { type: Number },
  long: { type: Number },
  loginTime: { type: Date, default: Date.now }
});

// အရင်ရေးထားတဲ့ module.exports = mongoose.model(...) အစား 
// အောက်ပါအတိုင်း ပြောင်းရေးပေးပါ (ဒါအရေးကြီးဆုံးပါ)

module.exports = mongoose.models.LoginHistory || mongoose.model('LoginHistory', loginHistorySchema);