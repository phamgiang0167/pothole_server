import express from "express";
import Pothole from "../models/Pothole.js"
import axios from "axios";
const router = express.Router();

// Route để lưu thông tin lỗ
router.post('/analyst', async (req, res) => {
  const response = await axios.post('http://127.0.0.1:5001/predict', {
    image: req.body.image,
  });

  try {
    const { total_holes, holes, avg_width, avg_length, badness_level, should_across, analysis_image, image_id } = response.data;
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
      status: 'pending'
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
    const { page = 1, limit = 10, status } = req.query;
    console.log(page)
    // Tạo điều kiện tìm kiếm
    let filter = {};
    if (status) {
      filter.status = status;
    }

    // Phân trang
    const potholes = await Pothole.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    const total = await Pothole.countDocuments(filter);

    res.json({
      data: potholes,
      totalPotholes: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Endpoint để duyệt ảnh và cập nhật trạng thái là "activated"
router.post('/approve/:id', async (req, res) => {
  try {
    const potholeId = req.params.id;
    const pothole = await Pothole.findByIdAndUpdate(potholeId, { status: 'activated' }, { new: true });

    if (!pothole) {
      return res.status(404).json({ message: 'Pothole not found' });
    }

    res.json({ message: 'Pothole approved successfully', pothole });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/check-and-delete', async (req, res) => {
  try {
    const { lat, long, image } = req.body;

    // Gửi yêu cầu đến Flask để phân tích hình ảnh | Send request to Flask for image analysis
    const response = await axios.post('http://127.0.0.1:5001/predict', { image });

    const { total_holes } = response.data;

    // Nếu không phát hiện ổ gà nào, xóa thông tin ổ gà khỏi cơ sở dữ liệu | If no potholes are detected, delete pothole information from the database
    if (total_holes === 0) {
      // Khoảng dung sai 10m | 10m tolerance
      const latTolerance = 0.00009;
      const longTolerance = 0.00009;

      // Tìm và xóa tất cả các ổ gà trong phạm vi vị trí đã cung cấp | Find and delete all potholes within the given location range
      const deletedPothole = await Pothole.findOneAndDelete({
        latitude: { $gte: lat - latTolerance, $lte: lat + latTolerance },
        longitude: { $gte: long - longTolerance, $lte: long + longTolerance }
      });

      if (!deletedPothole) {
        return res.status(404).json({ message: "Pothole not found or already repaired." });
      }

      return res.json({ message: "Pothole successfully repaired and removed from the database." });
    }

    // Nếu vẫn còn ổ gà, trả về thông tin cảnh báo | If potholes are still detected, return a warning message
    res.json({ message: "Pothole still exists at this location.", data: response.data });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


export default router;
