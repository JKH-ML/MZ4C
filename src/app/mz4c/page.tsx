'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MZ4CCharacterSearch } from '@/components/mz4c-character-search'
import { MZ4CGenerator } from '@/components/mz4c-generator'
import { ContactFooter } from '@/components/contact-footer'
import type { CharacterData } from '@/lib/maplestory-api'

export default function MZ4CPage() {
  const [character1, setCharacter1] = useState<CharacterData | null>(null)
  const [character2, setCharacter2] = useState<CharacterData | null>(null)

  const handleCharacterSelect = (char1: CharacterData, char2: CharacterData) => {
    setCharacter1({
      ...char1,
      flipX: true,
      cropArea: { x: 125, y: 122, width: 60, height: 60 },
      emotion: 'E00',
      showName: false
    })
    setCharacter2({
      ...char2,
      emotion: 'E00',
      showName: false
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <main className="p-4">
        <div className="max-w-6xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-left">
            <Link href="/">
              <h1 
                className="text-4xl font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
              >
                메짤네컷
              </h1>
            </Link>
            <p className="text-gray-600 mt-2">네컷사진 모드</p>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-6">
          {/* 캐릭터 검색 */}
          {(!character1 || !character2) && (
            <MZ4CCharacterSearch onCharacterSelect={handleCharacterSelect} />
          )}
          
          {/* 캐릭터 다시 검색 */}
          {character1 && character2 && (
            <MZ4CCharacterSearch 
              onCharacterSelect={handleCharacterSelect}
              defaultNickname1={character1.name}
              defaultNickname2={character2.name}
            />
          )}

          {/* 네컷 생성기 */}
          <MZ4CGenerator 
            character1={character1} 
            character2={character2}
          />
        </div>
        </div>
      </main>
      <ContactFooter />
    </div>
  )
}