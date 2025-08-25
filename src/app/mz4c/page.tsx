'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MZ4CCharacterSearch } from '@/components/mz4c-character-search'
import { MZ4CGenerator } from '@/components/mz4c-generator'
import { CharacterHistory } from '@/components/character-history'
import { ContactFooter } from '@/components/contact-footer'
import type { CharacterData, CharacterHistoryData } from '@/lib/maplestory-api'

export default function MZ4CPage() {
  const [character1, setCharacter1] = useState<CharacterData | null>(null)
  const [character2, setCharacter2] = useState<CharacterData | null>(null)
  const [selectedDate1, setSelectedDate1] = useState<string | undefined>(undefined)
  const [selectedDate2, setSelectedDate2] = useState<string | undefined>(undefined)
  
  // 4장의 사진에 사용할 캐릭터 데이터 배열
  const [frameCharacters, setFrameCharacters] = useState<{
    char1: CharacterData | null,
    char2: CharacterData | null
  }[]>([
    { char1: null, char2: null },
    { char1: null, char2: null },
    { char1: null, char2: null },
    { char1: null, char2: null }
  ])
  
  // 현재 어떤 프레임을 선택하고 있는지
  const [selectedFrame, setSelectedFrame] = useState<number>(0)

  const handleCharacterSelect = (char1: CharacterData, char2: CharacterData) => {
    setCharacter1({
      ...char1,
      flipX: true,
      cropArea: { x: 132, y: 127, width: 50, height: 50 },
      emotion: 'E00',
      showName: false
    })
    setCharacter2({
      ...char2,
      cropArea: { x: 120, y: 127, width: 50, height: 50 },
      emotion: 'E00',
      showName: false
    })
    setSelectedDate1(undefined) // 새 캐릭터 선택 시 날짜 초기화
    setSelectedDate2(undefined)
  }

  const handleDateSelect1 = (historyData: CharacterHistoryData) => {
    const newChar1 = {
      ...historyData.characterData,
      flipX: true,
      cropArea: { x: 132, y: 127, width: 50, height: 50 },
      emotion: 'E00',
      showName: false
    }
    
    setCharacter1(newChar1)
    setSelectedDate1(historyData.date)
    
    // 선택된 프레임에 적용
    const newFrameCharacters = [...frameCharacters]
    newFrameCharacters[selectedFrame].char1 = newChar1
    setFrameCharacters(newFrameCharacters)
  }

  const handleDateSelect2 = (historyData: CharacterHistoryData) => {
    const newChar2 = {
      ...historyData.characterData,
      cropArea: { x: 120, y: 127, width: 50, height: 50 },
      emotion: 'E00',
      showName: false
    }
    
    setCharacter2(newChar2)
    setSelectedDate2(historyData.date)
    
    // 선택된 프레임에 적용
    const newFrameCharacters = [...frameCharacters]
    newFrameCharacters[selectedFrame].char2 = newChar2
    setFrameCharacters(newFrameCharacters)
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

          {/* 프레임 선택 및 캐릭터 히스토리 */}
          {character1 && character2 && (
            <div className="mb-6 space-y-4">
              {/* 프레임 선택 버튼 */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3 text-center">날짜 선택 (4장에 순서대로 적용)</h3>
                <div className="flex justify-center gap-2 mb-4">
                  {[0, 1, 2, 3].map((frameIndex) => (
                    <button
                      key={frameIndex}
                      onClick={() => setSelectedFrame(frameIndex)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedFrame === frameIndex
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {frameIndex + 1}번째 사진
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {selectedFrame + 1}번째 사진에 적용할 캐릭터 날짜를 선택하세요 (중복 선택 가능)
                </p>
              </div>

              {/* 캐릭터 히스토리 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 캐릭터1 히스토리 */}
                <div>
                  <CharacterHistory 
                    nickname={character1.name} 
                    onDateSelect={handleDateSelect1}
                    selectedDate={selectedDate1}
                  />
                </div>
                
                {/* 캐릭터2 히스토리 */}
                <div>
                  <CharacterHistory 
                    nickname={character2.name} 
                    onDateSelect={handleDateSelect2}
                    selectedDate={selectedDate2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 네컷 생성기 */}
          <MZ4CGenerator 
            character1={character1} 
            character2={character2}
            frameCharacters={frameCharacters}
          />
        </div>
        </div>
      </main>
      <ContactFooter />
    </div>
  )
}