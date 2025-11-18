import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the current user for authentication
    const { user } = await getUserFromRequest()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id
    
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const topic = searchParams.get('topic')
    const department = searchParams.get('department')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 50
    
    const db = getDb()
    
    // Base query for download statistics
    let query = `
      SELECT 
        subject,
        topic,
        department,
        year,
        COUNT(DISTINCT user_id) as unique_downloaders,
        COUNT(*) as total_downloads,
        ROUND(COUNT(*) / NULLIF(COUNT(DISTINCT user_id), 0), 1) as avg_downloads_per_user,
        MIN(download_timestamp) as first_download,
        MAX(download_timestamp) as latest_download
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
      LIMIT 50
    `
    
    const [stats] = await db.execute(query, values)
    
    // Get recent downloads
    const [recentDownloads] = await db.execute(`
      SELECT 
        qbd.*,
        u.name as user_name,
        u.email as user_email
      FROM question_bank_downloads qbd
      JOIN users u ON qbd.user_id = u.id
      ORDER BY qbd.download_timestamp DESC
      LIMIT 20
    `)
    
    // Get top subjects
    const [topSubjects] = await db.execute(`
      SELECT 
        subject,
        COUNT(*) as download_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM question_bank_downloads
      GROUP BY subject
      ORDER BY download_count DESC
      LIMIT 10
    `)
    
    // Get top topics
    const [topTopics] = await db.execute(`
      SELECT 
        topic,
        COUNT(*) as download_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM question_bank_downloads
      GROUP BY topic
      ORDER BY download_count DESC
      LIMIT 10
    `)
    
    return NextResponse.json({
      success: true,
      stats,
      recentDownloads,
      topSubjects,
      topTopics,
      summary: {
        totalDownloads: Array.isArray(stats) ? stats.reduce((sum: number, stat: any) => sum + stat.total_downloads, 0) : 0,
        uniqueUsers: Array.isArray(stats) ? stats.reduce((sum: number, stat: any) => sum + stat.unique_downloaders, 0) : 0,
        totalSubjects: Array.isArray(topSubjects) ? topSubjects.length : 0,
        totalTopics: Array.isArray(topTopics) ? topTopics.length : 0
      }
    })
    
  } catch (error) {
    console.error('Error fetching download stats:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}