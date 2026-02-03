// Mission Manager - Handles mission state and workflow
import { dbOperations } from '../database/schema.js';
import { aiFeedbackEngine } from './aiFeedback.js';
import { GamificationSystem } from './gamification.js';
import { generateMissionsForGame } from '../database/missions.js';

export class MissionManager {
    // Accept a mission
    static async acceptMission(userId, missionId) {
        try {
            const user = await dbOperations.get('users', userId);
            const mission = await dbOperations.get('missions', missionId);

            if (!user || !mission) {
                throw new Error('User or mission not found');
            }

            // Initialize activeMissions array if it doesn't exist
            if (!user.activeMissions) {
                user.activeMissions = [];
            }

            // Check if already accepted
            if (user.activeMissions.includes(missionId)) {
                return { success: false, message: 'Mission already accepted' };
            }

            // Add to active missions
            user.activeMissions.push(missionId);
            mission.status = 'active';
            mission.acceptedAt = new Date().toISOString();
            mission.acceptedBy = userId;

            await dbOperations.update('users', user);
            await dbOperations.update('missions', mission);

            return { success: true, mission };
        } catch (error) {
            console.error('Error accepting mission:', error);
            return { success: false, error: error.message };
        }
    }

    // Submit a mission
    static async submitMission(userId, missionId, submissionData) {
        try {
            const user = await dbOperations.get('users', userId);
            const mission = await dbOperations.get('missions', missionId);

            if (!user || !mission) {
                throw new Error('User or mission not found');
            }

            // Create submission
            const submission = {
                userId,
                missionId,
                images: submissionData.images,
                description: submissionData.description || '',
                createdAt: new Date().toISOString(),
                status: 'analyzing'
            };

            const submissionId = await dbOperations.add('submissions', submission);

            // Generate AI feedback
            const feedback = await aiFeedbackEngine.generateFeedback(
                { ...submission, id: submissionId },
                mission
            );

            // Save feedback
            await dbOperations.add('ai_feedback', {
                ...feedback,
                read: false
            });

            // Update mission status
            mission.status = 'submitted';
            mission.submittedAt = new Date().toISOString();
            mission.submissionId = submissionId;
            await dbOperations.update('missions', mission);

            // Update submission with score
            submission.id = submissionId;
            submission.score = feedback.overallScore;
            submission.status = 'completed';
            await dbOperations.update('submissions', submission);

            return {
                success: true,
                submission: { ...submission, id: submissionId },
                feedback
            };
        } catch (error) {
            console.error('Error submitting mission:', error);
            return { success: false, error: error.message };
        }
    }

    // Complete a mission
    static async completeMission(userId, missionId, score) {
        try {
            const user = await dbOperations.get('users', userId);
            const mission = await dbOperations.get('missions', missionId);

            if (!user || !mission) {
                throw new Error('User or mission not found');
            }

            // Award XP
            const xpResult = await GamificationSystem.awardSubmissionXP(
                userId,
                score,
                mission.difficulty
            );

            // Move from active to completed
            user.activeMissions = (user.activeMissions || []).filter(id => id !== missionId);
            if (!user.completedMissions) {
                user.completedMissions = [];
            }
            user.completedMissions.push({
                missionId,
                completedAt: new Date().toISOString(),
                score,
                xpEarned: xpResult
            });

            mission.status = 'completed';
            mission.completedAt = new Date().toISOString();
            mission.finalScore = score;

            await dbOperations.update('users', user);
            await dbOperations.update('missions', mission);

            // Check for badges
            const submissions = await dbOperations.query('submissions', 'userId', userId);
            const newBadges = await GamificationSystem.checkBadges(userId, submissions);

            // Generate new mission for this difficulty
            await this.generateNextMission(userId, mission.difficulty, mission.gameId);

            return {
                success: true,
                xpEarned: xpResult,
                newBadges,
                leveledUp: xpResult.leveledUp || false
            };
        } catch (error) {
            console.error('Error completing mission:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate next mission
    static async generateNextMission(userId, difficulty, gameId) {
        try {
            const user = await dbOperations.get('users', userId);
            const game = await dbOperations.get('games', gameId);

            if (!user || !game) {
                return;
            }

            // Check completed missions to avoid repetition
            const completedTypes = (user.completedMissions || [])
                .map(cm => cm.missionId)
                .filter(Boolean);

            // Get all missions for this game
            const gameMissions = await dbOperations.query('missions', 'gameId', gameId);

            // Filter by difficulty and exclude completed types
            const availableMissions = gameMissions.filter(m =>
                m.difficulty === difficulty &&
                !completedTypes.includes(m.id)
            );

            // If all missions of this difficulty are completed, generate new ones
            if (availableMissions.length === 0) {
                await generateMissionsForGame(gameId, game);
            }

            return { success: true };
        } catch (error) {
            console.error('Error generating next mission:', error);
            return { success: false, error: error.message };
        }
    }

    // Get active missions for user
    static async getActiveMissions(userId) {
        try {
            const user = await dbOperations.get('users', userId);
            if (!user || !user.activeMissions || user.activeMissions.length === 0) {
                return [];
            }

            const missions = await Promise.all(
                user.activeMissions.map(id => dbOperations.get('missions', id))
            );

            // Get game details for each mission
            const missionsWithGames = await Promise.all(
                missions.filter(m => m).map(async (mission) => {
                    const game = await dbOperations.get('games', mission.gameId);
                    return { ...mission, game };
                })
            );

            return missionsWithGames;
        } catch (error) {
            console.error('Error getting active missions:', error);
            return [];
        }
    }

    // Get available missions (not accepted yet)
    static async getAvailableMissions(filters = {}) {
        try {
            let missions = await dbOperations.getAll('missions');

            // Filter out accepted/completed missions
            missions = missions.filter(m => !m.status || m.status === 'available');

            // Apply filters
            if (filters.difficulty) {
                missions = missions.filter(m => m.difficulty === filters.difficulty);
            }

            if (filters.gameId) {
                missions = missions.filter(m => m.gameId === filters.gameId);
            }

            // Get game details
            const missionsWithGames = await Promise.all(
                missions.map(async (mission) => {
                    const game = await dbOperations.get('games', mission.gameId);
                    return { ...mission, game };
                })
            );

            return missionsWithGames;
        } catch (error) {
            console.error('Error getting available missions:', error);
            return [];
        }
    }

    // Get mission by ID with game details
    static async getMissionById(missionId) {
        try {
            const mission = await dbOperations.get('missions', missionId);
            if (!mission) return null;

            const game = await dbOperations.get('games', mission.gameId);
            return { ...mission, game };
        } catch (error) {
            console.error('Error getting mission:', error);
            return null;
        }
    }
}

export const missionManager = new MissionManager();
