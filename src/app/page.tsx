'use client'

import { useState } from 'react'
import { CharacterSearch } from '@/components/character-search'
import { MemeGenerator } from '@/components/meme-generator'
import type { CharacterData } from '@/lib/maplestory-api'

export default function Home() {
  const [character, setCharacter] = useState<CharacterData | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">메짤네컷</h1>
          <p className="text-gray-600">메이플스토리 캐릭터로 짤을 만들어보세요!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CharacterSearch onCharacterSelect={setCharacter} />
          </div>
          <div className="lg:col-span-2">
            <MemeGenerator character={character} />
          </div>
        </div>
      </div>
    </main>
  )
}