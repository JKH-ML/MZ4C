'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CoupleCharacterSearch } from '@/components/couple-character-search'
import { CoupleCharacterDisplay } from '@/components/couple-character-display'
import { CoupleMemeGenerator } from '@/components/couple-meme-generator'
import { ContactFooter } from '@/components/contact-footer'
import type { CharacterData } from '@/lib/maplestory-api'

export default function CouplePage() {
  const [character1, setCharacter1] = useState<CharacterData | null>(null)
  const [character2, setCharacter2] = useState<CharacterData | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleCharacterSelect = (char1: CharacterData, char2: CharacterData) => {
    setCharacter1({ 
      ...char1, 
      flipX: true,
      cropArea: { x: 125, y: 122, width: 60, height: 60 },
      emotion: 'E00'
    })
    setCharacter2({
      ...char2,
      emotion: 'E00'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      <main className="p-4">
        <div className="max-w-6xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-left">
            <Link href="/">
              <h1 
                className="text-4xl font-bold text-gray-800 cursor-pointer hover:text-pink-600 transition-colors"
              >
                메짤네컷
              </h1>
            </Link>
            <p className="text-gray-600 mt-2">커플셀카 모드</p>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-6">
          {/* 캐릭터 검색 */}
          {(!character1 || !character2) && (
            <CoupleCharacterSearch onCharacterSelect={handleCharacterSelect} />
          )}
          
          {/* 캐릭터 다시 검색 */}
          {character1 && character2 && (
            <CoupleCharacterSearch 
              onCharacterSelect={handleCharacterSelect}
              defaultNickname1={character1.name}
              defaultNickname2={character2.name}
            />
          )}

          {/* 캐릭터 이미지 및 크롭 영역 설정 */}
          {character1 && character2 && (
            <CoupleCharacterDisplay 
              character1={character1}
              character2={character2}
              onCharacter1Update={(updates) => setCharacter1(prev => prev ? {...prev, ...updates} : null)}
              onCharacter2Update={(updates) => setCharacter2(prev => prev ? {...prev, ...updates} : null)}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            />
          )}

          {/* 커플 짤 생성기 */}
          <CoupleMemeGenerator 
            character1={character1} 
            character2={character2}
            onCharacter1Update={(updates) => setCharacter1(prev => prev ? {...prev, ...updates} : null)}
            onCharacter2Update={(updates) => setCharacter2(prev => prev ? {...prev, ...updates} : null)}
            isDragging={isDragging}
          />
          
        </div>
        </div>
      </main>
      <ContactFooter />
    </div>
  )
}