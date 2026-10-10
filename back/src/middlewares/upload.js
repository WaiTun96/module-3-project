import multer from 'multer';
import path from 'path';
import fs from 'fs';

// uploads folder ရှိ မရှိ စစ်ဆေးခြင်း မရှိလျှင် အသစ်ဖန်တီးခြင်း
const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// file သိမ်းမည့်လမ်းကြောင်း
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// image file ဟုတ် မဟုတ် စစ်ဆေးခြင်း
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// upload လုပ်ချိန်တွင် သိမ်းရမယ့် file လမ်းကြောင်း၊ file size limit လုပ်ခြင်းနဲ့ အများဆုံး ဘယ်နှစ်ခု တင်ခွင့်ရှိလဲဆိုတာ ကန့်သတ်ခြင်း
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: fileFilter
}).fields([
  { name: 'dichroismPhoto', maxCount: 1 },  
  { name: 'spectrumPhoto', maxCount: 1 },
  { name: 'inclusionsPhoto', maxCount: 1 },
  { name: 'uvFluorescencePhoto', maxCount: 1 },
  { name: 'chelseaFilterPhoto', maxCount: 1 }
]);

export const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

export default handleUpload;