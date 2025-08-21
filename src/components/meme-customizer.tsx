'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Copy, Palette } from 'lucide-react'
import { ACTIONS, EMOTIONS, BACKGROUND_COLORS } from '@/lib/meme-options'
import { maplestorycAPI, type CharacterData } from '@/lib/maplestory-api'

interface MemeCustomizerProps {
  character: CharacterData
  backgroundColor: string
  onCharacterUpdate: (updates: Partial<CharacterData>) => void
  onBackgroundColorUpdate: (color: string) => void
  onCopyToSlot: (slotIndex: number) => void
}

export function MemeCustomizer({
  character,
  backgroundColor,
  onCharacterUpdate,
  onBackgroundColorUpdate,
  onCopyToSlot
}: MemeCustomizerProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateCharacterProperty = async (property: keyof CharacterData, value: string) => {
    if (property === 'emotion') {
      setIsUpdating(true)
      try {
        // 랜덤 선택 시 무작위 표정 선택
        let finalValue = value
        if (value === 'RANDOM') {
          const randomIndex = Math.floor(Math.random() * EMOTIONS.length)
          finalValue = EMOTIONS[randomIndex].value
        }
        
        const newCustomUrl = maplestorycAPI.generateCustomImageUrl(character.baseImageUrl, {
          action: character.action,
          emotion: finalValue,
          wmotion: character.wmotion,
          width: 300,
          height: 400
        })
        
        onCharacterUpdate({
          [property]: finalValue,
          customUrl: newCustomUrl
        })
      } finally {
        setIsUpdating(false)
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5" />
          커스터마이징
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 표정 */}
        <div>
          <label className="block text-sm font-medium mb-2">표정</label>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => updateCharacterProperty('emotion', 'RANDOM')}
              className={`px-2 py-1 text-xs rounded border transition-all ${
                character.emotion === 'RANDOM' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
              }`}
              disabled={isUpdating}
            >
              🎲
            </button>
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion.value}
                onClick={() => updateCharacterProperty('emotion', emotion.value)}
                className={`px-2 py-1 text-xs rounded border transition-all ${
                  character.emotion === emotion.value 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                }`}
                disabled={isUpdating}
                title={emotion.label}
              >
                {emotion.label}
              </button>
            ))}
          </div>
        </div>

        {/* 배경색 */}
        <div>
          <label className="block text-sm font-medium mb-2">배경색</label>
          <div className="flex gap-2 items-center">
            {BACKGROUND_COLORS.slice(0, 8).map((color) => (
              <button
                key={color.value}
                onClick={() => onBackgroundColorUpdate(color.value)}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  backgroundColor === color.value
                    ? 'border-blue-500 ring-1 ring-blue-200'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.preview }}
                title={color.label}
              />
            ))}
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorUpdate(e.target.value)}
              className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
              title="사용자 정의 색상"
            />
          </div>
        </div>

        {/* 닉네임 표시 */}
        <div>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={character.showName}
              onChange={(e) => onCharacterUpdate({ showName: e.target.checked })}
              className="mr-2"
            />
            닉네임 표시
          </label>
        </div>

        {isUpdating && (
          <div className="text-center text-xs text-blue-600">
            업데이트 중...
          </div>
        )}
      </CardContent>
    </Card>
  )
}