// Demo data generator for showcasing AI feedback system
import { dbOperations } from '../database/schema.js';
import { aiFeedbackEngine } from '../utils/aiFeedback.js';

export const generateDemoFeedback = async () => {
    try {
        // Check if demo feedback already exists
        const existingFeedback = await dbOperations.getAll('ai_feedback');
        if (existingFeedback && existingFeedback.length > 0) {
            console.log('Demo feedback already exists');
            return;
        }

        // Create demo submission
        const demoSubmission = {
            userId: 1,
            missionId: 1,
            images: [
                'https://picsum.photos/seed/demo1/800/600',
                'https://picsum.photos/seed/demo2/800/600'
            ],
            description: 'Redesigned the inventory UI with improved categorization',
            createdAt: new Date().toISOString(),
            score: 0
        };

        const submissionId = await dbOperations.add('submissions', demoSubmission);

        // Generate AI feedback
        const feedback = await aiFeedbackEngine.generateFeedback(
            { ...demoSubmission, id: submissionId },
            { difficulty: 'intermediate', type: 'Inventory Management' }
        );

        // Save feedback to database
        await dbOperations.add('ai_feedback', {
            ...feedback,
            read: false
        });

        console.log('✅ Demo feedback generated successfully');
    } catch (error) {
        console.error('Error generating demo feedback:', error);
    }
};

export const seedLeaderboardUsers = async () => {
    try {
        const existingUsers = await dbOperations.getAll('users');
        // If we have more than just the current user, don't re-seed
        if (existingUsers && existingUsers.length > 5) {
            console.log('Leaderboard already seeded');
            return;
        }

        const demoUsers = [
            { id: 'bot-1', username: 'CyberNinja', fullName: 'Aiden Storm', xp: 15420, level: 42, workField: 'Senior UI Artist', photoURL: 'https://i.pravatar.cc/150?u=aiden' },
            { id: 'bot-2', username: 'PixelMaster', fullName: 'Elena Vance', xp: 14200, level: 38, workField: 'Visual Designer', photoURL: 'https://i.pravatar.cc/150?u=elena' },
            { id: 'bot-3', username: 'UX_Wizard', fullName: 'Marcus Wright', xp: 13850, level: 36, workField: 'Lead UX Researcher', photoURL: 'https://i.pravatar.cc/150?u=marcus' },
            { id: 'bot-4', username: 'DesignBot', fullName: 'Sarah Connor', xp: 12100, level: 32, workField: 'AI Interface Specialist', photoURL: 'https://i.pravatar.cc/150?u=sarah' },
            { id: 'bot-5', username: 'CreativeSoul', fullName: 'Leo Tanaka', xp: 11500, level: 30, workField: 'Senior Game Designer', photoURL: 'https://i.pravatar.cc/150?u=leo' },
            { id: 'bot-6', username: 'VectorVortex', fullName: 'Nina Williams', xp: 9800, level: 28, workField: 'Technical Artist', photoURL: 'https://i.pravatar.cc/150?u=nina' },
            { id: 'bot-7', username: 'GlowGuru', fullName: 'David Bloom', xp: 8400, level: 24, workField: 'Lighting Expert', photoURL: 'https://i.pravatar.cc/150?u=david' },
            { id: 'bot-8', username: 'SpriteKing', fullName: 'Ken Masters', xp: 7200, level: 20, workField: '2D Artist', photoURL: 'https://i.pravatar.cc/150?u=ken' },
            { id: 'bot-9', username: 'MotionMagic', fullName: 'Julia Chang', xp: 6550, level: 18, workField: 'Motion Designer', photoURL: 'https://i.pravatar.cc/150?u=julia' },
            { id: 'bot-10', username: 'AlphaDesigner', fullName: 'Kazuya Mishima', xp: 5100, level: 15, workField: 'UI/UX Designer', photoURL: 'https://i.pravatar.cc/150?u=kazuya' }
        ];

        for (const [index, user] of demoUsers.entries()) {
            try {
                // Check if user exists by id
                const existing = await dbOperations.get('users', user.id);
                if (!existing) {
                    await dbOperations.add('users', {
                        ...user,
                        email: `${user.username.toLowerCase()}@demo.com`,
                        subscriptionTier: index < 3 ? 'Premium' : 'Free',
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString()
                    });
                }
            } catch {
                // Ignore key collisions
            }
        }
        console.log('✅ Leaderboard demo users seeded successfully');
    } catch (error) {
        console.error('Error seeding leaderboard:', error);
    }
};
