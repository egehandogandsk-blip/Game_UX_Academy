// Gamification System - XP, Levels, Badges
import { dbOperations } from '../database/schema.js';

export const LEVEL_XP_REQUIREMENTS = {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 1000,
    6: 1750,
    7: 2750,
    8: 4000,
    9: 5500,
    10: 7500,
    11: 10000,
    12: 13000,
    13: 16500,
    14: 20500,
    15: 25000,
    16: 30000,
    17: 36000,
    18: 43000,
    19: 51000,
    20: 60000
};

export const BADGES = {
    first_submission: {
        id: 'first_submission',
        name: 'First Steps',
        description: 'Submitted your first case study',
        icon: '🎯',
        xp: 50
    },
    beginner_complete: {
        id: 'beginner_complete',
        name: 'Beginner Badge',
        description: 'Completed 10 beginner missions',
        icon: '🌱',
        xp: 100
    },
    intermediate_complete: {
        id: 'intermediate_complete',
        name: 'Intermediate Badge',
        description: 'Completed 10 intermediate missions',
        icon: '⚡',
        xp: 200
    },
    expert_complete: {
        id: 'expert_complete',
        name: 'Expert Badge',
        description: 'Completed 10 expert missions',
        icon: '👑',
        xp: 500
    },
    high_scorer: {
        id: 'high_scorer',
        name: 'High Achiever',
        description: 'Received a score of 95+ on a submission',
        icon: '⭐',
        xp: 150
    },
    community_favorite: {
        id: 'community_favorite',
        name: 'Community Favorite',
        description: 'Received 50+ upvotes on a submission',
        icon: '❤️',
        xp: 200
    },
    accessibility_champion: {
        id: 'accessibility_champion',
        name: 'Accessibility Champion',
        description: 'Perfect accessibility score on 5 submissions',
        icon: '♿',
        xp: 300
    },
    consistent_creator: {
        id: 'consistent_creator',
        name: 'Consistent Creator',
        description: 'Submitted designs for 7 consecutive days',
        icon: '🔥',
        xp: 250
    },
    portfolio_builder: {
        id: 'portfolio_builder',
        name: 'Portfolio Builder',
        description: 'Completed 50 total submissions',
        icon: '📁',
        xp: 400
    },
    perfectionist: {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieved 100/100 on a submission',
        icon: '💯',
        xp: 500
    }
};

export class GamificationSystem {
    // Calculate level from XP
    static calculateLevel(xp) {
        const levels = Object.entries(LEVEL_XP_REQUIREMENTS).sort((a, b) => b[1] - a[1]);

        for (const [level, requiredXP] of levels) {
            if (xp >= requiredXP) {
                return parseInt(level);
            }
        }

        return 1;
    }

    // Get XP needed for next level
    static getXPForNextLevel(currentXP) {
        const currentLevel = this.calculateLevel(currentXP);
        const nextLevel = currentLevel + 1;

        if (!LEVEL_XP_REQUIREMENTS[nextLevel]) {
            return { current: currentXP, required: currentXP, percentage: 100 };
        }

        const currentLevelXP = LEVEL_XP_REQUIREMENTS[currentLevel];
        const nextLevelXP = LEVEL_XP_REQUIREMENTS[nextLevel];
        const progress = currentXP - currentLevelXP;
        const required = nextLevelXP - currentLevelXP;
        const percentage = (progress / required) * 100;

        return {
            current: progress,
            required,
            percentage: Math.min(percentage, 100)
        };
    }

    // Award XP for submission
    static async awardSubmissionXP(userId, score, difficulty) {
        const baseXP = {
            beginner: 100,
            intermediate: 300,
            expert: 800
        };

        const difficultyXP = baseXP[difficulty] || 100;
        const scoreMultiplier = score / 100;
        const xpEarned = Math.floor(difficultyXP * scoreMultiplier);

        await this.addXP(userId, xpEarned);
        return xpEarned;
    }

    // Award XP for upvotes
    static async awardUpvoteXP(userId, upvoteCount) {
        const xpPerUpvote = 5;
        const xpEarned = upvoteCount * xpPerUpvote;
        await this.addXP(userId, xpEarned);
        return xpEarned;
    }

    // Add XP to user
    static async addXP(userId, xp) {
        const user = await dbOperations.get('users', userId);
        if (!user) return;

        const oldLevel = this.calculateLevel(user.xp);
        user.xp += xp;
        const newLevel = this.calculateLevel(user.xp);

        if (newLevel > oldLevel) {
            // Level up!
            user.level = newLevel;
            await this.checkLevelUpBadges(user);
        }

        await dbOperations.update('users', user);
        return { xpGained: xp, leveledUp: newLevel > oldLevel, newLevel };
    }

    // Check and award badges
    static async checkBadges(userId, submissions = []) {
        const user = await dbOperations.get('users', userId);
        if (!user) return [];

        const newBadges = [];

        // First submission
        if (submissions.length === 1 && !user.badges.includes('first_submission')) {
            newBadges.push(BADGES.first_submission);
        }

        // Difficulty completions
        const beginnerCount = submissions.filter(s => s.difficulty === 'beginner').length;
        const intermediateCount = submissions.filter(s => s.difficulty === 'intermediate').length;
        const expertCount = submissions.filter(s => s.difficulty === 'expert').length;

        if (beginnerCount >= 10 && !user.badges.includes('beginner_complete')) {
            newBadges.push(BADGES.beginner_complete);
        }

        if (intermediateCount >= 10 && !user.badges.includes('intermediate_complete')) {
            newBadges.push(BADGES.intermediate_complete);
        }

        if (expertCount >= 10 && !user.badges.includes('expert_complete')) {
            newBadges.push(BADGES.expert_complete);
        }

        // High score
        const hasHighScore = submissions.some(s => s.score >= 95);
        if (hasHighScore && !user.badges.includes('high_scorer')) {
            newBadges.push(BADGES.high_scorer);
        }

        // Perfect score
        const hasPerfectScore = submissions.some(s => s.score === 100);
        if (hasPerfectScore && !user.badges.includes('perfectionist')) {
            newBadges.push(BADGES.perfectionist);
        }

        // Portfolio builder
        if (submissions.length >= 50 && !user.badges.includes('portfolio_builder')) {
            newBadges.push(BADGES.portfolio_builder);
        }

        // Award badges
        for (const badge of newBadges) {
            user.badges.push(badge.id);
            await this.addXP(userId, badge.xp);
        }

        await dbOperations.update('users', user);
        return newBadges;
    }

    static async checkLevelUpBadges(user) {
        // Check if any level-based badges should be awarded
        // This is called when a user levels up
    }

    // Get user stats
    static async getUserStats(userId) {
        const user = await dbOperations.get('users', userId);
        const submissions = await dbOperations.query('submissions', 'userId', userId);

        const levelProgress = this.getXPForNextLevel(user.xp);

        return {
            level: user.level,
            xp: user.xp,
            levelProgress,
            totalSubmissions: submissions.length,
            badges: user.badges.map(badgeId => BADGES[badgeId]),
            averageScore: submissions.length > 0
                ? submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length
                : 0
        };
    }

    // Get leaderboard
    static async getLeaderboard(limit = 10) {
        const users = await dbOperations.getAll('users');

        return users
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit)
            .map((user, index) => ({
                rank: index + 1,
                username: user.username,
                level: user.level,
                xp: user.xp,
                badges: user.badges.length
            }));
    }
}

export const gamificationSystem = new GamificationSystem();
