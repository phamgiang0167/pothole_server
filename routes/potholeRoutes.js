import express from "express";
import Pothole from "../models/Pothole.js"
import axios from "axios";
const router = express.Router();

// Route để lưu thông tin lỗ
router.post('/analyst', async (req, res) => {
  const response = await axios.post('http://127.0.0.1:5001/predict', {
    image: req.body.image,
  });
  const { total_holes, holes, avg_width, avg_length, badness_level, should_across, analysis_image, image_id } = response.data;

  try {
    if (total_holes === 0) {
      res.status(201).json(response.data);
      return;
    }
    const newPothole = new Pothole({
      latitude: req.body.lat,
      longitude: req.body.long,
      totalHoles: total_holes,
      holes,
      avgWidth: avg_width,
      avgLength: avg_length,
      badnessLevel: badness_level,
      shouldAcross: should_across,
      analysisImage: analysis_image,
    });
    const savedPothole = await newPothole.save();
    res.status(201).json(savedPothole);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const potholes = await Pothole.find();
    delete potholes.analysisImage
    res.json(potholes);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
