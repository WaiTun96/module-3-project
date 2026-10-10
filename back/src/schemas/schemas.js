import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. USER SCHEMA (Admin Authentication အတွက်)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Password ကို Database ထဲ မသိမ်းမီ Hash လုပ်ပေးမည့် Middleware
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password တိုက်စစ်ဆေးပေးမည့် Helper Method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// 2. GEM DETAILS SCHEMA 
const gemDetailSchema = new mongoose.Schema({
  gemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gem',
    required: true,
    unique: true
  },
  dichroism: {
    value: { type: String, default: 'None' },
    photo: { type: String, default: '' } 
  },
  spectrum: {
    value: { type: String, default: 'N/A' },
    photo: { type: String, default: '' }
  },
  inclusions: {
    value: { type: String, default: 'N/A' },
    photo: { type: String, default: '' }
  },
  uvFluorescence: {
    value: { type: String, default: 'N/A' },
    photo: { type: String, default: '' }
  },
  chelseaFilter: {
    value: { type: String, default: 'N/A' },
    photo: { type: String, default: '' }
  }
}, {
  timestamps: true
});


// 3. MAIN GEMS SCHEMA (ပင်မစစ်ဆေးမည့် အချက်အလက်များ)
const gemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  riMin: { type: Number, required: true },
  riMax: { type: Number, required: true },
  sgMin: { type: Number, required: true },
  sgMax: { type: Number, required: true },
  opticalNature: {
    type: String,
    uppercase: true,
    default: 'N/A'
  },
  
  birefringence: { 
    type: Number, 
    default: 0 
  },
  
  details: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GemDetail'
  }
}, {
  timestamps: true
});

// Fast Searching Index
gemSchema.index({ riMin: 1, riMax: 1, sgMin: 1, sgMax: 1 });

// Models တည်ဆောက်ခြင်း
export const User = mongoose.model('User', userSchema);
export const Gem = mongoose.model('Gem', gemSchema);
export const GemDetail = mongoose.model('GemDetail', gemDetailSchema);

export default {
  User,
  Gem,
  GemDetail
};