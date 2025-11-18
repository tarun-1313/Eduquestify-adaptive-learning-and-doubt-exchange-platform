"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Context as GeminiContext } from '@/app/teacher/gemini-study/src/context/Context'
import ContextProvider from '@/app/teacher/gemini-study/src/context/Context'

// Dynamically import the GeminiStudy components with SSR disabled
const Sidebar = dynamic(
  () => import('@/app/teacher/gemini-study/src/components/Sidebar/Sidebar'),
  { ssr: false }
)

const Main = dynamic(
  () => import('@/app/teacher/gemini-study/src/components/Main/Main'),
  { ssr: false }
)

export default function QuestionBankPage() {

  return (
    <div className="h-full">
      <ContextProvider>
        <div className="flex h-full overflow-hidden">
          <Sidebar />
          <Main />
        </div>
      </ContextProvider>
    </div>
  )
}
