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
        // Trích xuất và Chuẩn hóa Tham số
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortOption = req.query.sortOption || 'newest';
        const searchField = req.query.searchField || 'all';
        const searchValue = req.query.searchValue || '';
        const skip = (page - 1) * limit;

        // Xây dựng Đối tượng Sắp xếp
        let sortObject = {};
        switch (sortOption) {
            case 'oldest':
                sortObject = { createdAt: 1 };
                break;
            case 'highest':
                if (searchField !== 'all' && searchField !== 'time') {
                    sortObject = { [searchField]: -1 };
                } else {
                    sortObject = { createdAt: -1 };
                }
                break;
            case 'lowest':
                if (searchField !== 'all' && searchField !== 'time') {
                    sortObject = { [searchField]: 1 };
                } else {
                    sortObject = { createdAt: -1 };
                }
                break;
            case 'newest':
            default:
                sortObject = { createdAt: -1 };
                break;
        }
        
        // Xây dựng Đối tượng Truy vấn
        let queryObject = {};
        if (searchValue) {
            const isoDateString = parseCustomDateString(searchValue);
            const numericValue = parseFloat(searchValue);
            const isNumeric = !isNaN(numericValue) && isFinite(numericValue);
            
            // Quy tắc 0: Kiểm tra định dạng không hợp lệ
            if (!isNumeric && !isoDateString) {
                return res.status(400).json({ error: 'Định dạng tìm kiếm không hợp lệ. Vui lòng nhập số hoặc thời gian (HH:mm DD/MM/YYYY).' });
            }

            const searchConditions = [];

            // Quy tắc 1: Nếu giá trị nhập là thời gian hợp lệ
            if (isoDateString) {
                if (searchField === 'all' || searchField === 'time') {
                    const startDate = new Date(isoDateString);
                    let endDate;
                    if (searchValue.split(' ')[0].split(':').length === 2) {
                        endDate = new Date(startDate.getTime() + 60 * 1000); // Cả phút
                    } else {
                        endDate = new Date(startDate.getTime() + 1000); // Cả giây
                    }
                    searchConditions.push({ createdAt: { $gte: startDate, $lt: endDate } });
                }
                // Nếu searchField là cảm biến nhưng nhập thời gian -> searchConditions sẽ rỗng -> không ra kết quả
            } 
            // Quy tắc 2: Nếu giá trị nhập là một con số
            else if (isNumeric) {
                const numericRangeQuery = { $gte: numericValue, $lt: numericValue + 1 };
                
                if (searchField === 'all') {
                    // Tìm trên cả 3 trường cảm biến trước
                    searchConditions.push({ temperature: numericRangeQuery });
                    searchConditions.push({ humidity: numericRangeQuery });
                    searchConditions.push({ light: numericRangeQuery });
                    
                    // Rồi tìm trên các thành phần thời gian
                    searchConditions.push({ $expr: { $eq: [{ $year: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $month: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $dayOfMonth: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $hour: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $minute: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $second: '$createdAt' }, numericValue] } });
                } 
                else if (searchField === 'time') {
                     // Chỉ tìm trên các thành phần thời gian
                    searchConditions.push({ $expr: { $eq: [{ $year: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $month: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $dayOfMonth: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $hour: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $minute: '$createdAt' }, numericValue] } });
                    searchConditions.push({ $expr: { $eq: [{ $second: '$createdAt' }, numericValue] } });
                }
                else { // Nếu là một trường cảm biến cụ thể (temperature, humidity, light)
                    searchConditions.push({ [searchField]: numericRangeQuery });
                }
            }

            // Gộp các điều kiện tìm kiếm
            if (searchConditions.length > 0) {
                queryObject = { $or: searchConditions };
            } else {
                // Nếu không có điều kiện nào hợp lệ được tạo ra, không trả về kết quả nào
                queryObject = { _id: null }; 
            }
        }

        // Thực hiện Truy vấn
        const [data, totalDocuments] = await Promise.all([
            SensorData.find(queryObject)
                .sort(sortObject)
                .skip(skip)
                .limit(limit),
            SensorData.countDocuments(queryObject)
        ]);
        
        const totalPages = Math.ceil(totalDocuments / limit);

        // Trả kết quả
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        
        const { filterDevice, filterStatus, searchTime } = req.query;

        const skip = (page - 1) * limit;
        let queryObject = {};

        if (filterDevice) queryObject.device = filterDevice;
        if (filterStatus) queryObject.status = filterStatus;
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

        const [data, totalDocuments] = await Promise.all([
            DeviceActivity.find(queryObject)
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit),
            DeviceActivity.countDocuments(queryObject)
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
        console.error('Error fetching activity history:', error);
        res.status(500).json({ error: 'Failed to fetch activity history' });
    }
};

module.exports = { getSensorHistory, getActivityHistory };