// controllers/historyController.js
const SensorData = require('../models/sensorData');
const DeviceActivity = require('../models/deviceActivity');

/**
 * Hàm đặc biệt để chuyển đổi chuỗi thời gian tùy chỉnh (HH:mm:ss DD/MM/YYYY)
 * thành một chuỗi ISO mà new Date() có thể hiểu được.
 * @param {string} customDateString - Chuỗi đầu vào, ví dụ: "10:26 1/10/2025"
 * @returns {string|null} - Chuỗi ISO (YYYY-MM-DDTHH:mm:ss) hoặc null nếu không hợp lệ.
 */
function parseCustomDateString(customDateString) {
    // Tách phần thời gian và phần ngày dựa vào khoảng trắng đầu tiên
    const parts = customDateString.split(' ');
    if (parts.length < 2) return null;

    const timePart = parts[0];
    const datePart = parts[1];

    // Tách phần ngày (DD/MM/YYYY)
    const dateComponents = datePart.split('/');
    if (dateComponents.length !== 3) return null;
    const [day, month, year] = dateComponents;

    // Tách phần thời gian (HH:mm:ss hoặc HH:mm)
    const timeComponents = timePart.split(':');
    if (timeComponents.length < 2) return null;
    const hour = timeComponents[0];
    const minute = timeComponents[1];
    const second = timeComponents.length === 3 ? timeComponents[2] : '00'; // Nếu không có giây, mặc định là 00

    // Ghép lại thành chuỗi định dạng ISO 8601 YYYY-MM-DDTHH:mm:ss
    // padStart(2, '0') để đảm bảo tháng, ngày, giờ, phút, giây luôn có 2 chữ số (ví dụ: 1 -> 01)
    const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
    
    // Kiểm tra xem chuỗi vừa tạo có hợp lệ không
    if (isNaN(new Date(isoString).getTime())) {
        return null;
    }
    
    return isoString;
}


const getSensorHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const searchType = req.query.searchType;
        const searchValue = req.query.searchValue;

        const skip = (page - 1) * limit;
        let queryObject = {};

        if (searchType && searchValue) {
            if (searchType === 'time') {
                // --- THAY ĐỔI CHÍNH NẰM Ở ĐÂY ---
                // "Dịch" chuỗi đầu vào của người dùng
                const isoDateString = parseCustomDateString(searchValue);

                if (isoDateString) {
                    const startDate = new Date(isoDateString);
                    let endDate;

                    // Nếu người dùng không nhập giây (ví dụ: "10:26 1/10/2025")
                    // chuỗi đầu vào sẽ có <= 14 ký tự (HH:mm DD/MM/YY)
                    // (chúng ta sẽ dùng một cách kiểm tra an toàn hơn)
                    if (searchValue.split(' ')[0].split(':').length === 2) {
                        // Tìm trong cả phút đó
                        endDate = new Date(startDate.getTime() + 60 * 1000); // Thêm 1 phút
                    } else {
                        // Nếu có giây, tìm trong cả giây đó
                        endDate = new Date(startDate.getTime() + 1000); // Thêm 1 giây
                    }

                    queryObject.createdAt = {
                        $gte: startDate,
                        $lt: endDate
                    };
                }
                // --- KẾT THÚC THAY ĐỔI ---
            } else if (['temperature', 'humidity', 'light'].includes(searchType)) {
                queryObject[searchType] = { $gte: parseFloat(searchValue) };
            }
        }
        
        const [data, totalDocuments] = await Promise.all([
            SensorData.find(queryObject)
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit),
            SensorData.countDocuments(queryObject)
        ]);
        
        const totalPages = Math.ceil(totalDocuments / limit);

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