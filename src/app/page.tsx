'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ContactFooter } from '@/components/contact-footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <main className="flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
        {/* 메인 제목 */}
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          메짤네컷
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          메이플스토리 캐릭터로 재미있는 짤을 만들어보세요!
        </p>

        {/* 서비스 선택 카드들 */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* 혼자찍기 */}
          <Card className="p-8 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">혼자찍기</h3>
              <p className="text-gray-600 mb-6">
                나만의 캐릭터로<br />
                개성 넘치는 짤을 만들어보세요
              </p>
            </div>
            <Link href="/solo">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg">
                시작하기
              </Button>
            </Link>
          </Card>

          {/* 커플셀카 */}
          <Card className="p-8 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="mb-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💕</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">커플셀카</h3>
              <p className="text-gray-600 mb-6">
                연인과 함께<br />
                달콤한 추억을 만들어보세요
              </p>
            </div>
            <Link href="/couple">
              <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 text-lg">
                시작하기
              </Button>
            </Link>
          </Card>

          {/* 메짤네컷 */}
          <Card className="p-8 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎭</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">메짤네컷</h3>
              <p className="text-gray-600 mb-6">
                네 컷으로 이루어진<br />
                스토리텔링 짤을 만들어보세요
              </p>
            </div>
            <Link href="/mz4c">
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 text-lg">
                시작하기
              </Button>
            </Link>
          </Card>
        </div>

        </div>
      </main>
      <ContactFooter />
    </div>
  )
}