const profileData = {
    fullName: 'Lưu Xuân Dũng',
    studentId: 'B22DCCN129',
    className: 'D22HTTT05',
    phone: '0967430627',
    avatarUrl: '/images/avatar.jpg',
    githubUrl: 'https://github.com/xdungok/IOT_Project',
    pdfUrl: '/files/IOT-Lưu Xuân Dũng.pdf',
    apiDocsUrl: 'http://localhost:3001/api-docs'
};

const getProfileData = (req, res) => {
    try {
        res.status(200).json(profileData);
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).json({ error: 'Failed to fetch profile data' });
    }
};

module.exports = {
    getProfileData
};