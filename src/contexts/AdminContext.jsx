import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
};

// Admin credentials (hardcoded for now, will be moved to secure storage later)
const ADMIN_CREDENTIALS = [
    {
        id: 'admin-1',
        username: 'admin',
        password: 'admin123',
        role: 'super_admin',
        name: 'Admin User'
    }
];

export const AdminProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    // Check for existing admin session on mount
    useEffect(() => {
        const storedAdmin = localStorage.getItem('gda-admin-session');
        if (storedAdmin) {
            try {
                const admin = JSON.parse(storedAdmin);
                setAdminUser(admin);
                setIsAdminAuthenticated(true);
            } catch (error) {
                console.error('Invalid admin session:', error);
                localStorage.removeItem('gda-admin-session');
            }
        }
    }, []);

    const adminLogin = (username, password) => {
        const admin = ADMIN_CREDENTIALS.find(
            a => a.username === username && a.password === password
        );

        if (admin) {
            const adminSession = {
                id: admin.id,
                username: admin.username,
                role: admin.role,
                name: admin.name,
                loginTime: new Date().toISOString()
            };

            setAdminUser(adminSession);
            setIsAdminAuthenticated(true);
            localStorage.setItem('gda-admin-session', JSON.stringify(adminSession));
            return true;
        }

        return false;
    };

    const adminLogout = () => {
        setAdminUser(null);
        setIsAdminAuthenticated(false);
        localStorage.removeItem('gda-admin-session');
    };

    return (
        <AdminContext.Provider
            value={{
                adminUser,
                isAdminAuthenticated,
                adminLogin,
                adminLogout
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};
