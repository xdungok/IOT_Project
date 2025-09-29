import React from 'react';

function MyProfile() {
    return (
        <div>
            <h2>MY PROFILE</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <img 
                    src="https://via.placeholder.com/150"
                    alt="Profile Avatar" 
                    style={{ borderRadius: '50%', width: '150px', height: '150px' }} 
                />
                <div>
                    <h3>Lưu Xuân Dũng</h3>
                    <p><strong>Mã sinh viên:</strong> B22DCCN129</p>
                    <p>
                        <strong>GitHub:</strong> 
                        <a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer">
                            https://github.com/your-username
                        </a>
                    </p>
                     <p>
                        <strong>Project PDF:</strong> 
                        <a href="/link-to-your-pdf.pdf" target="_blank" rel="noopener noreferrer">
                            Download Project Description
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;