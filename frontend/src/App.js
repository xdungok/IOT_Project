import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataSensor from './pages/DataSensor';
// import DeviceActivity from './pages/DeviceActivity';
// import MyProfile from './pages/MyProfile';

function App() {
    return (
        <WebSocketProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {}
                        <Route index element={<Dashboard />} />

                        {}
                        { <Route path="data-sensor" element={<DataSensor />} /> }
                        {/* <Route path="device-activity" element={<DeviceActivity />} /> */}
                        {/* <Route path="my-profile" element={<MyProfile />} /> */}
                        {}
                    </Route>
                </Routes>
            </BrowserRouter>
        </WebSocketProvider>
    );
}
export default App;