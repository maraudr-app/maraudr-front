import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from "../components/layout/Sidebar/Sidebar.tsx";


const MaraudrApp = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleSidebarToggle = (isCollapsed: boolean) => {
        setSidebarCollapsed(isCollapsed);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar onToggle={handleSidebarToggle} />

            {/* Contenu principal qui s'adapte à la taille de la sidebar */}
            <div 
                className={`flex-1 bg-gray-100 dark:bg-gray-900 p-4 transition-all duration-300 ${
                    sidebarCollapsed ? 'ml-14' : 'ml-48'
                }`}
            >
                <Outlet />
            </div>
        </div>
    );
};

export default MaraudrApp;