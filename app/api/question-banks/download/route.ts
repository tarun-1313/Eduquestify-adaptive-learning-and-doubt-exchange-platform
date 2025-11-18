import { NextRequest, NextResponse } from 'next/server'
import { recordQuestionBankDownload } from '@/lib/questionBankDownloads'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get the current user from JWT authentication
    const { user } = await getUserFromRequest()
    
    if (!user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { questionBankId, subject, topic, department, year } = body
    
    // Validate required fields
    if (!questionBankId || !subject || !topic) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: questionBankId, subject, and topic are required' },
        { status: 400 }
      )
    }
    
    // Get client IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Record the download
    const result = await recordQuestionBankDownload({
      userId: parseInt(user.id.toString()),
      questionBankId: parseInt(questionBankId),
      subject,
      topic,
      department,
      year,
      ipAddress,
      userAgent
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        downloadId: result.downloadId
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 409 }) // Conflict status for duplicate downloads
    }
    
  } catch (error) {
    console.error('Error in download tracking API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}