import { getDb } from './db'

export interface QuestionBankDownloadData {
  userId: number
  questionBankId: number
  subject: string
  topic: string
  department?: string
  year?: string
  ipAddress?: string
  userAgent?: string
}

export async function recordQuestionBankDownload(
  downloadData: QuestionBankDownloadData
): Promise<{ success: boolean; message: string; downloadId?: number }> {
  try {
    const db = getDb()
    
    const query = `
      INSERT INTO question_bank_downloads 
      (user_id, question_bank_id, subject, topic, department, year, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const values = [
      downloadData.userId,
      downloadData.questionBankId,
      downloadData.subject,
      downloadData.topic,
      downloadData.department || null,
      downloadData.year || null,
      downloadData.ipAddress || null,
      downloadData.userAgent || null
    ]
    
    const [result] = await db.execute(query, values)
    
    return {
      success: true,
      message: 'Download recorded successfully',
      downloadId: (result as any).insertId
    }
  } catch (error) {
    console.error('Error recording question bank download:', error)
    
    // Check if this is a duplicate download attempt
    if ((error as any)?.code === 'ER_DUP_ENTRY') {
      return {
        success: false,
        message: 'Download already recorded for today'
      }
    }
    
    return {
      success: false,
      message: 'Failed to record download'
    }
  }
}

export async function getUserDownloadHistory(
  userId: number,
  limit: number = 50
): Promise<any[]> {
  try {
    const db = getDb()
    
    const query = `
      SELECT 
        qbd.*,
        qb.title as question_bank_title,
        qb.description as question_bank_description
      FROM question_bank_downloads qbd
      LEFT JOIN question_banks qb ON qbd.question_bank_id = qb.id
      WHERE qbd.user_id = ?
      ORDER BY qbd.download_timestamp DESC
      LIMIT ?
    `
    
    const [rows] = await db.execute(query, [userId, limit])
    return rows as any[]
  } catch (error) {
    console.error('Error fetching user download history:', error)
    return []
  }
}

export async function getDownloadStats(
  subject?: string,
  topic?: string,
  department?: string
): Promise<any> {
  try {
    const db = getDb()
    
    let query = `
      SELECT 
        subject,
        topic,
        department,
        year,
        COUNT(DISTINCT user_id) as unique_downloaders,
        COUNT(*) as total_downloads,
        COUNT(*) / NULLIF(COUNT(DISTINCT user_id), 0) as avg_downloads_per_user
      FROM question_bank_downloads
      WHERE 1=1
    `
    
    const values: any[] = []
    
    if (subject) {
      query += ' AND subject = ?'
      values.push(subject)
    }
    
    if (topic) {
      query += ' AND topic = ?'
      values.push(topic)
    }
    
    if (department) {
      query += ' AND department = ?'
      values.push(department)
    }
    
    query += `
      GROUP BY subject, topic, department, year
      ORDER BY total_downloads DESC
    `
    
    const [rows] = await db.execute(query, values)
    return rows
  } catch (error) {
    console.error('Error fetching download stats:', error)
    return []
  }
}