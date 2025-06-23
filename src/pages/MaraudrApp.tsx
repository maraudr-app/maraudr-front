import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from "../components/layout/Sidebar/Sidebar.tsx";
import { useAssoStore } from '../store/assoStore';
import { useAuthStore } from '../store/authStore';

const MaraudrApp = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { fetchUserAssociations } = useAssoStore();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchUserAssociations();
        }
    }, [isAuthenticated, user, fetchUserAssociations]);

    const handleSidebarToggle = (isCollapsed: boolean) => {
        setSidebarCollapsed(isCollapsed);
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar onToggle={handleSidebarToggle} />

            {/* Contenu principal qui s'adapte à la taille de la sidebar */}
            <div 
                className={`flex-1 bg-white dark:bg-gray-900 p-4 pt-20 transition-all duration-300 min-h-screen ${
                    sidebarCollapsed ? 'ml-14' : 'ml-48'
                }`}
            >
                <Outlet />
            </div>
        </div>
    );
};

export default MaraudrApp;