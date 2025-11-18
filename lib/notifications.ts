import { getDb } from './db'

export interface NotificationData {
  userId: number
  message: string
  type?: string
  relatedId?: number
}

export async function sendNotification(data: NotificationData) {
  try {
    const db = getDb()
    
    await db.query(
      'INSERT INTO notifications (user_id, message, type, related_id) VALUES (?, ?, ?, ?)',
      [data.userId, data.message, data.type || 'general', data.relatedId || null]
    )
    
    return true
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}

export async function sendDoubtReplyNotification(doubtId: number, replierId: number) {
  try {
    const db = getDb()
    
    // Get the doubt creator's ID
    const [doubts] = await db.query(
      'SELECT user_id FROM doubts WHERE id = ?',
      [doubtId]
    )
    
    if (!Array.isArray(doubts) || doubts.length === 0) {
      return false
    }
    
    const doubtCreatorId = (doubts as any)[0].user_id
    
    // Don't send notification if the replier is the doubt creator
    if (doubtCreatorId === replierId) {
      return true
    }
    
    // Get the replier's name
    const [users] = await db.query(
      'SELECT name FROM users WHERE id = ?',
      [replierId]
    )
    
    const replierName = (users as any[])[0]?.name || 'Someone'
    
    return await sendNotification({
      userId: doubtCreatorId,
      message: `${replierName} replied to your doubt`,
      type: 'doubt_reply',
      relatedId: doubtId
    })
  } catch (error) {
    console.error('Error sending doubt reply notification:', error)
    return false
  }
}

export async function sendNoteSharedNotification(doubtId: number, uploaderId: number, noteTitle: string) {
  try {
    const db = getDb()
    
    // Get all participants in the doubt (excluding the uploader)
    const [participants] = await db.query(
      `SELECT DISTINCT dm.user_id, u.name as participant_name
       FROM doubt_messages dm
       JOIN users u ON dm.user_id = u.id
       WHERE dm.doubt_id = ? AND dm.user_id != ?`,
      [doubtId, uploaderId]
    )
    
    // Get the uploader's name
    const [uploaders] = await db.query(
      'SELECT name FROM users WHERE id = ?',
      [uploaderId]
    )
    
    const uploaderName = uploaders[0]?.name || 'Someone'
    
    // Send notifications to all participants
    const notifications = (participants as any[]).map((participant: any) =>
      sendNotification({
        userId: participant.user_id,
        message: `${uploaderName} shared a note: "${noteTitle}"`,
        type: 'note_shared',
        relatedId: doubtId
      })
    )
    
    await Promise.all(notifications)
    return true
  } catch (error) {
    console.error('Error sending note shared notification:', error)
    return false
  }
}