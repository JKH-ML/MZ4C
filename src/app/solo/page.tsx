'use client'

import { useState } from 'react'
import { CharacterSearch } from '@/components/character-search'
import { MemeGenerator } from '@/components/meme-generator'
import { ContactFooter } from '@/components/contact-footer'
import type { CharacterData } from '@/lib/maplestory-api'
import Link from 'next/link'

export default function SoloPage() {
  const [character, setCharacter] = useState<CharacterData | null>(null)

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
            <CharacterSearch onCharacterSelect={setCharacter} />
          </div>
        </div>

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