import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { dbOperations } from '../database/schema';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase listener
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Sync with IndexedDB
                try {
                    let userByEmail = await dbOperations.queryUsersByEmail(user.email);

                    if (!userByEmail) {
                        // Create new user in IDB
                        const newUserId = await dbOperations.add('users', {
                            email: user.email,
                            username: user.displayName || 'New User',
                            photoURL: user.photoURL,
                            role: 'user',
                            subscriptionTier: 'Free',
                            createdAt: new Date().toISOString(),
                            lastLogin: new Date().toISOString(),
                            xp: 0,
                            level: 1,
                            hasCompletedOnboarding: false
                        });
                        userByEmail = await dbOperations.get('users', newUserId);
                    } else {
                        // Update last login
                        const updatedUser = {
                            ...userByEmail,
                            lastLogin: new Date().toISOString()
                        };
                        await dbOperations.update('users', userByEmail.id, updatedUser);
                        userByEmail = updatedUser;
                    }

                    // Set the DATABASE user object as current user (includes .id)
                    setCurrentUser(userByEmail);
                } catch (err) {
                    console.error("Error syncing user to IDB:", err);
                    // Fallback to firebase user if DB fails, but warning
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Auth Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    // Manual/Demo Login helper (for testing without Firebase keys)
    const demoLogin = async () => {
        const demoUser = {
            uid: 'demo-123',
            email: 'demo@gda.com',
            displayName: 'Demo User',
            photoURL: null
        };
        // Demo user usually doesn't need DB sync or might have a static IDB entry
        // For simplicity, we just set state.
        setCurrentUser(demoUser);
        setLoading(false);
        return demoUser;
    };

    const refreshUser = async () => {
        if (!auth.currentUser) return;
        try {
            const userByEmail = await dbOperations.queryUsersByEmail(auth.currentUser.email);
            if (userByEmail) {
                setCurrentUser(userByEmail);
            }
        } catch (error) {
            console.error("Error refreshing user:", error);
        }
    };

    const value = {
        currentUser,
        loginWithGoogle,
        logout,
        demoLogin,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
