import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const { user } = await getUserFromRequest(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    const userId = user.id;

    // Get user stats (XP, level, streak)
    const [userStats] = await db.query(
      `SELECT COALESCE(s.xp, 0) as xp, COALESCE(s.coins, 0) as coins, 
              COALESCE(s.streak, 0) as streak, COALESCE(s.level, 1) as level,
              COALESCE(s.xp_to_next, 2000) as xp_to_next
       FROM users u 
       LEFT JOIN user_stats s ON s.user_id = u.id 
       WHERE u.id = ?`,
      [userId]
    );

    // Get recent quiz attempts for activity feed
    const [recentActivity] = await db.query(
      `SELECT qa.id, qa.subject, qa.topic, qa.difficulty, qa.score, 
              qa.total_questions, qa.percentage, qa.completed_at,
              CASE 
                WHEN qa.percentage >= 80 THEN 'achievement'
                WHEN qa.percentage >= 50 THEN 'progress'
                ELSE 'review'
              END as type
       FROM quiz_attempts qa
       WHERE qa.user_id = ?
       ORDER BY qa.completed_at DESC
       LIMIT 10`,
      [userId]
    );

    // Get recommended topics (weakest areas)
    const [recommendedTopics] = await db.query(
      `SELECT DISTINCT qa.subject, qa.topic, qa.difficulty,
              AVG(qa.percentage) as avg_score,
              COUNT(qa.id) as attempts,
              CASE 
                WHEN AVG(qa.percentage) < 50 THEN 'High Priority'
                WHEN AVG(qa.percentage) < 70 THEN 'Medium Priority'
                ELSE 'Low Priority'
              END as priority
       FROM quiz_attempts qa
       WHERE qa.user_id = ? AND qa.percentage < 80
       GROUP BY qa.subject, qa.topic, qa.difficulty
       ORDER BY AVG(qa.percentage) ASC, attempts DESC
       LIMIT 5`,
      [userId]
    );

    // Get study decks with mastery progress
    const [studyDecks] = await db.query(
      `SELECT fd.id, fd.name, fd.total_cards, 
              COALESCE(fd.mastered_cards, 0) as mastered_cards,
              COALESCE(fd.last_reviewed, NOW()) as last_reviewed,
              CASE 
                WHEN fd.total_cards > 0 THEN 
                  ROUND((COALESCE(fd.mastered_cards, 0) / fd.total_cards) * 100, 1)
                ELSE 0
              END as mastery_percentage
       FROM flashcard_decks fd
       WHERE fd.user_id = ?
       ORDER BY fd.last_reviewed DESC
       LIMIT 5`,
      [userId]
    );

    // Get subject mastery levels
    const [subjectMastery] = await db.query(
      `SELECT sm.subject, sm.mastery_level, sm.average_score, 
              sm.quizzes_taken, sm.last_quiz_date
       FROM subject_mastery sm
       WHERE sm.user_id = ?
       ORDER BY sm.last_quiz_date DESC
       LIMIT 5`,
      [userId]
    );

    // Format the response data
    const dashboardData = {
      userStats: userStats[0] || {
        xp: 0,
        coins: 0,
        streak: 0,
        level: 1,
        xp_to_next: 2000
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        message: `You completed the '${activity.topic}' quiz with ${activity.percentage}%`,
        type: activity.type,
        time: new Date(activity.completed_at).toISOString(),
        subject: activity.subject,
        topic: activity.topic,
        score: activity.score,
        totalQuestions: activity.total_questions,
        percentage: activity.percentage
      })),
      recommendedTopics: recommendedTopics.map(topic => ({
        id: `${topic.subject}-${topic.topic}`,
        name: topic.topic,
        subject: topic.subject,
        difficulty: topic.difficulty,
        reason: `${topic.priority} - Avg score: ${Math.round(topic.avg_score)}% (${topic.attempts} attempts)`,
        avgScore: Math.round(topic.avg_score),
        attempts: topic.attempts
      })),
      studyDecks: studyDecks.map(deck => ({
        id: deck.id,
        name: deck.name,
        cards: deck.total_cards,
        mastered: deck.mastered_cards,
        masteryProgress: deck.mastery_percentage,
        nextReview: deck.last_reviewed,
        masteryPercentage: deck.mastery_percentage
      })),
      subjectMastery: subjectMastery.map(mastery => ({
        subject: mastery.subject,
        masteryLevel: mastery.mastery_level,
        averageScore: Math.round(mastery.average_score),
        quizzesTaken: mastery.quizzes_taken,
        lastQuizDate: mastery.last_quiz_date
      }))
    };

    return new Response(JSON.stringify(dashboardData), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
