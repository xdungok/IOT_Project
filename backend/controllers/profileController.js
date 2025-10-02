const profileData = {
    fullName: 'Lưu Xuân Dũng',
    studentId: 'B22DCCN129',
    className: 'D22HTTT05',
    phone: '0967430627',
    avatarUrl: '/images/avatar.jpg',
    githubUrl: 'https://github.com/xdungok/IOT_Project',
    pdfUrl: '/files/IOT-Bài thực hành 1-Lưu Xuân Dũng.pdf',
    apiDocsUrl: 'https://docs.google.com/document/d/1FYtPp6mpBgwxHzUQit3BjDZAs5r3A15Yt6ulBjnbbw8/edit?usp=sharing'
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