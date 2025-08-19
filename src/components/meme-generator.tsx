'use client'

import { useState, useEffect } from 'react'
import { CharacterDisplay } from '@/components/character-display'
import { MemeCustomizer } from '@/components/meme-customizer'
import { FinalMemeGenerator } from '@/components/final-meme-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CharacterData } from '@/lib/maplestory-api'

interface MemeGeneratorProps {
  character: CharacterData | null
}

interface MemeSlot {
  character: CharacterData
  backgroundColor: string
}

export function MemeGenerator({ character }: MemeGeneratorProps) {
  const [memeSlots, setMemeSlots] = useState<(MemeSlot | null)[]>([null, null, null, null])
  const [selectedSlot, setSelectedSlot] = useState<number>(0)

  useEffect(() => {
    if (character && !memeSlots[selectedSlot]) {
      const newSlots = [...memeSlots]
      newSlots[selectedSlot] = {
        character: { ...character },
        backgroundColor: '#ffffff'
      }
      setMemeSlots(newSlots)
    }
  }, [character, selectedSlot, memeSlots])

  const updateMemeSlot = (slotIndex: number, updates: Partial<CharacterData | { backgroundColor: string }>) => {
    const newSlots = [...memeSlots]
    if (newSlots[slotIndex]) {
      if ('backgroundColor' in updates) {
        newSlots[slotIndex]!.backgroundColor = updates.backgroundColor as string
      } else {
        newSlots[slotIndex]!.character = { ...newSlots[slotIndex]!.character, ...updates }
      }
      setMemeSlots(newSlots)
    }
  }

  const clearSlot = (slotIndex: number) => {
    const newSlots = [...memeSlots]
    newSlots[slotIndex] = null
    setMemeSlots(newSlots)
  }

  const copyToSlot = (fromIndex: number, toIndex: number) => {
    const newSlots = [...memeSlots]
    if (newSlots[fromIndex]) {
      newSlots[toIndex] = {
        character: { ...newSlots[fromIndex]!.character },
        backgroundColor: newSlots[fromIndex]!.backgroundColor
      }
      setMemeSlots(newSlots)
    }
  }

  if (!character) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>짤 생성</CardTitle>
          <CardDescription>
            먼저 캐릭터를 검색해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-12">
            캐릭터를 검색하면 짤 생성을 시작할 수 있습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memeSlots.map((slot, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">슬롯 {index + 1}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSlot(index)}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedSlot === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  편집
                </button>
                {slot && (
                  <button
                    onClick={() => clearSlot(index)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                  >
                    지우기
                  </button>
                )}
              </div>
            </div>
            
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg min-h-[200px] flex items-center justify-center"
              style={{ backgroundColor: slot?.backgroundColor || '#f9f9f9' }}
            >
              {slot ? (
                <CharacterDisplay
                  character={slot.character}
                  backgroundColor={slot.backgroundColor}
                  onUpdate={(updates) => updateMemeSlot(index, updates)}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-lg mb-2">빈 슬롯</div>
                  <div className="text-sm">편집 버튼을 눌러 캐릭터를 추가하세요</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {memeSlots[selectedSlot] && (
        <MemeCustomizer
          character={memeSlots[selectedSlot]!.character}
          backgroundColor={memeSlots[selectedSlot]!.backgroundColor}
          onCharacterUpdate={(updates) => updateMemeSlot(selectedSlot, updates)}
          onBackgroundColorUpdate={(color) => updateMemeSlot(selectedSlot, { backgroundColor: color })}
          onCopyToSlot={(toIndex) => copyToSlot(selectedSlot, toIndex)}
        />
      )}

      <FinalMemeGenerator memeSlots={memeSlots.filter(Boolean) as MemeSlot[]} />
    </div>
  )
}