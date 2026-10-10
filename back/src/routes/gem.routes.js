import express from 'express';
import {
  identifyGem,
  getGemDetails,
  getAllGems,
  createGem,
  updateGem,
  deleteGem,
} from '../controllers/gem.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { handleUpload } from '../middlewares/upload.js';

const router = express.Router();

// Public Routes
router.post('/identify', identifyGem);
router.get('/', getAllGems);
router.get('/:gemId', getGemDetails);

// protect နဲ့ handleUpload middleware အား အသုံးပြုထားပါသည်
router.post('/', protect, handleUpload, createGem);
router.put('/:gemId', protect, handleUpload, updateGem);
router.delete('/:gemId', protect, deleteGem);

export default router;