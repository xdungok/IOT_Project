const SensorData = require('../models/sensorData');
const DeviceActivity = require('../models/deviceActivity');

/* Hàm chuyển đổi chuỗi thời gian thành chuỗi ISO */
function parseCustomDateString(customDateString) {
    // Tách phần thời gian và phần ngày theo khoảng trắng đầu tiên
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
    const second = timeComponents.length === 3 ? timeComponents[2] : '00';

    // Ghép lại thành chuỗi định dạng ISO 8601 YYYY-MM-DDTHH:mm:ss
    const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
    
    // Kiểm tra xem chuỗi hợp lệ
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
                // Dịch chuỗi đầu vào
                const isoDateString = parseCustomDateString(searchValue);

                if (isoDateString) {
                    const startDate = new Date(isoDateString);
                    let endDate;
                    if (searchValue.split(' ')[0].split(':').length === 2) {
                        // Nếu không có giây, tìm trong cả phút
                        endDate = new Date(startDate.getTime() + 60 * 1000);
                    } else {
                        // Nếu có giây, tìm trong cả giây
                        endDate = new Date(startDate.getTime() + 1000);
                    }

                    queryObject.createdAt = {
                        $gte: startDate,
                        $lt: endDate
                    };
                }
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
        // Lấy các tham số truy vấn
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        
        const filterDevice = req.query.filterDevice;
        const filterStatus = req.query.filterStatus;
        const searchTime = req.query.searchTime;

        const skip = (page - 1) * limit;

        // Xây dựng đối tượng truy vấn
        let queryObject = {};

        // Thêm điều kiện lọc theo thiết bị
        if (filterDevice) {
            queryObject.device = filterDevice;
        }

        // Thêm điều kiện lọc theo hành động
        if (filterStatus) {
            queryObject.status = filterStatus;
        }

        // Thêm điều kiện tìm kiếm theo thời gian
        if (searchTime) {
            const isoDateString = parseCustomDateString(searchTime);
            if (isoDateString) {
                const startDate = new Date(isoDateString);
                let endDate;
                if (searchTime.split(' ')[0].split(':').length === 2) {
                    endDate = new Date(startDate.getTime() + 60 * 1000);
                } else {
                    endDate = new Date(startDate.getTime() + 1000);
                }
                queryObject.createdAt = { $gte: startDate, $lt: endDate };
            }
        }

        // Truy vấn
        const [data, totalDocuments] = await Promise.all([
            DeviceActivity.find(queryObject)
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit),
            DeviceActivity.countDocuments(queryObject)
        ]);

        const totalPages = Math.ceil(totalDocuments / limit);

        // Trả kết quả về
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
        console.error('Error fetching activity history:', error);
        res.status(500).json({ error: 'Failed to fetch activity history' });
    }
};

module.exports = { getSensorHistory, getActivityHistory };