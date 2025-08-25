'use client'

import { useState, useEffect } from 'react'
import { CharacterDisplay } from '@/components/character-display'
import { MemeCustomizer } from '@/components/meme-customizer'
import { FinalMemeGenerator } from '@/components/final-meme-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { analyzeImageColors } from '@/lib/color-analyzer'
import type { CharacterData } from '@/lib/maplestory-api'

interface MemeGeneratorProps {
  character: CharacterData | null
}

interface MemeSlot {
  character: CharacterData
  backgroundColor: string
}

export function MemeGenerator({ character }: MemeGeneratorProps) {
  const [memeSlots, setMemeSlots] = useState<(MemeSlot | null)[]>([null])
  const [selectedSlot, setSelectedSlot] = useState<number>(0)

  useEffect(() => {
    if (character) {
      const updateSlotWithColorAnalysis = async () => {
        const newSlots = [...memeSlots]
        const currentSlot = newSlots[selectedSlot]
        
        // 이미 슬롯에 캐릭터가 있으면 배경색 유지, 없으면 색상 분석 실행
        let recommendedColor = currentSlot?.backgroundColor || '#ffffff'
        
        // 슬롯이 비어있거나 다른 캐릭터일 때만 색상 분석 수행
        if (!currentSlot || currentSlot.character.ocid !== character.ocid) {
          try {
            if (character.customUrl && character.cropArea) {
              console.log('색상 분석 시작:', character.name, character.customUrl, character.cropArea)
              const colorAnalysis = await analyzeImageColors(character.customUrl, character.cropArea)
              recommendedColor = colorAnalysis.recommendedBackground
              console.log('색상 분석 완료:', character.name, {
                dominantColors: colorAnalysis.dominantColors,
                recommendedBackground: colorAnalysis.recommendedBackground
              })
            }
          } catch (error) {
            console.log('색상 분석 실패, 기본색 사용:', character.name, error)
          }
        }
        
        // 캐릭터 정보 업데이트 (같은 캐릭터의 다른 날짜 외형인 경우 배경색 유지)
        newSlots[selectedSlot] = {
          character: { ...character },
          backgroundColor: recommendedColor
        }
        setMemeSlots(newSlots)
      }
      
      updateSlotWithColorAnalysis()
    }
  }, [character, selectedSlot])

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 캐릭터 미리보기 */}
      <div className="lg:col-span-1">
        {memeSlots.map((slot, index) => (
          <div key={index}>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg min-h-[200px] flex items-center justify-center"
              style={{ backgroundColor: slot?.backgroundColor || '#f9f9f9' }}
            >
              {slot ? (
                <CharacterDisplay
                  character={slot.character}
                  backgroundColor={slot.backgroundColor}
                  onUpdate={(updates) => updateMemeSlot(index, updates)}
                  showFinalMeme={true}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-lg mb-2">캐릭터를 검색해주세요</div>
                  <div className="text-sm">검색된 캐릭터가 여기에 표시됩니다</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 커스터마이징 */}
      <div className="lg:col-span-1">
        {memeSlots[selectedSlot] && (
          <MemeCustomizer
            character={memeSlots[selectedSlot]!.character}
            backgroundColor={memeSlots[selectedSlot]!.backgroundColor}
            onCharacterUpdate={(updates) => updateMemeSlot(selectedSlot, updates)}
            onBackgroundColorUpdate={(color) => updateMemeSlot(selectedSlot, { backgroundColor: color })}
            onCopyToSlot={(toIndex) => copyToSlot(selectedSlot, toIndex)}
          />
        )}
      </div>
    </div>
  )
}