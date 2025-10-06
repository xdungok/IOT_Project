const profileData = {
    fullName: 'Lưu Xuân Dũng',
    studentId: 'B22DCCN129',
    className: 'D22HTTT05',
    phone: '0967430627',
    avatarUrl: '/images/avatar.jpg',
    githubUrl: 'https://github.com/xdungok/IOT_Project',
    pdfUrl: '/files/IOT-Lưu Xuân Dũng.pdf',
    apiDocsUrl: "https://luuxuandung24-6567614.postman.co/workspace/B22DCCN129---L%25C6%25B0u-Xu%25C3%25A2n-D%25C5%25A9ng's-Wo~4f8b05a9-2812-42d4-80cb-a5f3a88a02bd/collection/48985759-f377c8d0-8491-4784-92c4-26af817f2dc2?action=share&source=collection_link&creator=48985759"
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