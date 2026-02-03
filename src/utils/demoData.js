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
