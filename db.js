const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.CONNECTION_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Kết thúc ứng dụng nếu không thể kết nối
    }
}

module.exports = { connectToDatabase };

async function getPotholes(req, res) {
    try {
        const potholes = await Pothole.find(); // Truy vấn tất cả dữ liệu từ collection 'pothole'
        res.json(potholes);
    } catch (err) {
        res.status(500).send('Error retrieving potholes');
    }
}