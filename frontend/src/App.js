import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketContext';
import { DeviceStateProvider } from './context/DeviceStateContext';
import { ProfileProvider } from './context/ProfileContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataSensor from './pages/DataSensor';
import DeviceActivity from './pages/DeviceActivity';
import MyProfile from './pages/MyProfile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
         <ProfileProvider>
            <WebSocketProvider>
                <DeviceStateProvider>
                    <BrowserRouter>
                        <ToastContainer
                                position="top-right"
                                autoClose={5000} // Tự động đóng sau 5 giây
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                theme="light"
                                bodyClassName="toast-body"
                            />
                        <Routes>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="data-sensor" element={<DataSensor />} />
                                <Route path="device-activity" element={<DeviceActivity />} />
                                <Route path="my-profile" element={<MyProfile />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </DeviceStateProvider>
            </WebSocketProvider>
        </ProfileProvider>
    );
}

export default App;