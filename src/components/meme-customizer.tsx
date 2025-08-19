'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Copy, Palette } from 'lucide-react'
import { ACTIONS, EMOTIONS, WMOTIONS, BACKGROUND_COLORS } from '@/lib/meme-options'
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
    if (property === 'action' || property === 'emotion' || property === 'wmotion') {
      setIsUpdating(true)
      try {
        const newCustomUrl = maplestorycAPI.generateCustomImageUrl(character.baseImageUrl, {
          action: property === 'action' ? value : character.action,
          emotion: property === 'emotion' ? value : character.emotion,
          wmotion: property === 'wmotion' ? value : character.wmotion,
          width: 300,
          height: 400
        })
        
        onCharacterUpdate({
          [property]: value,
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
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">자세</label>
            <Select
              value={character.action}
              onChange={(e) => updateCharacterProperty('action', e.target.value)}
              disabled={isUpdating}
            >
              {ACTIONS.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">표정</label>
            <Select
              value={character.emotion}
              onChange={(e) => updateCharacterProperty('emotion', e.target.value)}
              disabled={isUpdating}
            >
              {EMOTIONS.map((emotion) => (
                <option key={emotion.value} value={emotion.value}>
                  {emotion.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">무기 모션</label>
            <Select
              value={character.wmotion}
              onChange={(e) => updateCharacterProperty('wmotion', e.target.value)}
              disabled={isUpdating}
            >
              {WMOTIONS.map((wmotion) => (
                <option key={wmotion.value} value={wmotion.value}>
                  {wmotion.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">배경색</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => onBackgroundColorUpdate(color.value)}
                className={`h-12 rounded-md border-2 transition-all ${
                  backgroundColor === color.value
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.preview }}
                title={color.label}
              />
            ))}
          </div>
          <div className="mt-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorUpdate(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300"
              title="사용자 정의 색상"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">다른 슬롯에 복사</label>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onCopyToSlot(index)}
              >
                <Copy className="h-4 w-4 mr-1" />
                슬롯 {index + 1}
              </Button>
            ))}
          </div>
        </div>

        {isUpdating && (
          <div className="text-center text-sm text-blue-600">
            이미지를 업데이트하는 중...
          </div>
        )}
      </CardContent>
    </Card>
  )
}