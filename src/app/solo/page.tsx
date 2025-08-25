'use client'

import { useState } from 'react'
import { CharacterSearch } from '@/components/character-search'
import { CharacterHistory } from '@/components/character-history'
import { MemeGenerator } from '@/components/meme-generator'
import { ContactFooter } from '@/components/contact-footer'
import type { CharacterData, CharacterHistoryData } from '@/lib/maplestory-api'
import Link from 'next/link'

export default function SoloPage() {
  const [character, setCharacter] = useState<CharacterData | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  const handleCharacterSelect = (characterData: CharacterData) => {
    setCharacter(characterData)
    setSelectedDate(undefined) // 새 캐릭터 선택 시 날짜 초기화
  }

  const handleDateSelect = (historyData: CharacterHistoryData) => {
    setCharacter(historyData.characterData)
    setSelectedDate(historyData.date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <main className="p-4">
        <div className="max-w-6xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-left">
            <Link href="/">
              <h1 
                className="text-4xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
              >
                메짤네컷
              </h1>
            </Link>
            <p className="text-gray-600 mt-2">혼자찍기 모드</p>
          </div>
          <div className="w-48">
            <CharacterSearch onCharacterSelect={handleCharacterSelect} />
          </div>
        </div>

        {/* 캐릭터 히스토리 */}
        {character && (
          <div className="mb-6">
            <CharacterHistory 
              nickname={character.name} 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="w-full">
          <MemeGenerator character={character} />
        </div>
        </div>
      </main>
      <ContactFooter />
    </div>
  )
}