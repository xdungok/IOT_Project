const SensorData = require('../models/sensorData');
const DeviceActivity = require('../models/deviceActivity');

const getSensorHistory = async (req, res) => {
    try {
        // Lấy và Xử lý các tham số truy vấn từ URL
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt'; // Mặc định theo thời gian
        const order = req.query.order === 'asc' ? 1 : -1; // asc -> 1 (tăng dần), desc -> -1 (giảm dần)
        const searchType = req.query.searchType;
        const searchValue = req.query.searchValue;

        const skip = (page - 1) * limit; // Số bản ghi cần bỏ qua cho việc phân trang

        // Xây dựng đối tượng truy vấn
        let queryObject = {};

        if (searchType && searchValue) {
            if (searchType === 'time') {
                const startDate = new Date(searchValue);
                // Xác định endDate dựa trên độ chi tiết của searchValue
                let endDate;
                if (searchValue.length <= 16) { // YYYY-MM-DDTHH:mm
                    endDate = new Date(startDate.getTime() + 60 * 1000);
                } else { // YYYY-MM-DDTHH:mm:ss
                    endDate = new Date(startDate.getTime() + 1000);
                }

                queryObject.createdAt = {
                    $gte: startDate, // Lớn hơn hoặc bằng startDate
                    $lt: endDate    // Nhỏ hơn endDate
                };
            } else if (['temperature', 'humidity', 'light'].includes(searchType)) {
                // Xử lý tìm kiếm theo giá trị cảm biến
                queryObject[searchType] = { $gte: parseFloat(searchValue) };
            }
        }
        
        // Thực hiện truy vấn và đếm tổng số bản ghi với 2 truy vấn song song
        const [data, totalDocuments] = await Promise.all([
            // Lấy dữ liệu đã được lọc, sắp xếp và phân trang
            SensorData.find(queryObject)
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit),
            // Đếm tổng số document khớp với điều kiện tìm kiếm
            SensorData.countDocuments(queryObject)
        ]);
        
        const totalPages = Math.ceil(totalDocuments / limit);

        // Trả kết quả về cho Frontend
        res.status(200).json({
            data,
            pagination: {
                currentPage: page,
                totalPages,
                totalDocuments,
                limit
            }
        });

    } catch (error) {
        console.error('Error fetching sensor history:', error);
        res.status(500).json({ error: 'Failed to fetch sensor history' });
    }
};

const getActivityHistory = async (req, res) => {
    try {
        const data = await DeviceActivity.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity history' });
    }
};

module.exports = { getSensorHistory, getActivityHistory };