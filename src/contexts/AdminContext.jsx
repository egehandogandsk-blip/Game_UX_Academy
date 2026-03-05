import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
};

// Admin credentials (Initially seeded, then from DB)
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
    role: 'super_admin',
    name: 'Admin User'
};

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

    const adminLogin = async (username, password) => {
        // First, try DB admins
        try {
            // Lazy import to avoid circular dep issues during init if any
            const { dbOperations } = await import('../database/schema.js');
            const admins = await dbOperations.getAll('admins');

            let admin = admins.find(a => a.username === username && a.password === password);

            // Fallback to default if DB is empty/not seeded yet (Safety net)
            if (!admin && admins.length === 0 && username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
                admin = { ...DEFAULT_ADMIN, id: 'master_root' };
                // Optionally seed it? For now just allow login
            }

            if (admin) {
                const adminSession = {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    name: admin.name || admin.username,
                    loginTime: new Date().toISOString()
                };

                setAdminUser(adminSession);
                setIsAdminAuthenticated(true);
                localStorage.setItem('gda-admin-session', JSON.stringify(adminSession));

                // Track login in analytics
                dbOperations.add('analytics_logs', {
                    type: 'admin_login',
                    user: admin.username,
                    date: new Date().toISOString()
                });

                return true;
            }
        } catch (e) {
            console.error("Admin login error", e);
            // Fallback for hardcoded during dev if DB fails
            if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
                const session = { ...DEFAULT_ADMIN, id: 'dev_fallback' };
                setAdminUser(session);
                setIsAdminAuthenticated(true);
                localStorage.setItem('gda-admin-session', JSON.stringify(session));
                return true;
            }
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
