'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FlipHorizontal2, Eye, EyeOff } from 'lucide-react'
import type { CharacterData } from '@/lib/maplestory-api'

interface CharacterDisplayProps {
  character: CharacterData
  onUpdate: (updates: Partial<CharacterData>) => void
  backgroundColor?: string
}

export function CharacterDisplay({ character, onUpdate, backgroundColor = '#ffffff' }: CharacterDisplayProps) {
  const [imageError, setImageError] = useState(false)

  const toggleFlipX = () => {
    onUpdate({ flipX: !character.flipX })
  }

  const toggleShowName = () => {
    onUpdate({ showName: !character.showName })
  }

  const toggleShowGuild = () => {
    onUpdate({ showGuild: !character.showGuild })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>캐릭터 미리보기</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFlipX}
              title="좌우 반전"
            >
              <FlipHorizontal2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleShowName}
              title="닉네임 표시/숨김"
            >
              {character.showName ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleShowGuild}
              title="길드명 표시/숨김"
            >
              {character.showGuild ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="relative min-h-[300px] flex flex-col items-center justify-center p-4 rounded-lg"
          style={{ backgroundColor }}
        >
          {!imageError ? (
            <div className="relative">
              <Image
                src={character.customUrl}
                alt={character.name}
                width={300}
                height={400}
                className={`transition-transform duration-200 ${character.flipX ? 'scale-x-[-1]' : ''}`}
                onError={() => setImageError(true)}
                unoptimized
              />
              
              {character.showName && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm font-medium">
                    {character.name}
                  </div>
                </div>
              )}
              
              {character.showGuild && character.guild && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="bg-blue-600 bg-opacity-80 text-white px-2 py-1 rounded-md text-xs">
                    {character.guild}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-lg mb-2">이미지를 불러올 수 없습니다</div>
              <div className="text-sm">다른 설정을 시도해보세요</div>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div><strong>캐릭터:</strong> {character.name}</div>
          {character.guild && <div><strong>길드:</strong> {character.guild}</div>}
          <div><strong>액션:</strong> {character.action}</div>
          <div><strong>표정:</strong> {character.emotion}</div>
          <div><strong>무기모션:</strong> {character.wmotion}</div>
        </div>
      </CardContent>
    </Card>
  )
}