'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FlipHorizontal } from 'lucide-react'
import type { CharacterData } from '@/lib/maplestory-api'

interface CoupleCharacterDisplayProps {
  character1: CharacterData | null
  character2: CharacterData | null
  onCharacter1Update: (updates: Partial<CharacterData>) => void
  onCharacter2Update: (updates: Partial<CharacterData>) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function CoupleCharacterDisplay({ 
  character1, 
  character2, 
  onCharacter1Update, 
  onCharacter2Update,
  onDragStart,
  onDragEnd
}: CoupleCharacterDisplayProps) {
  const [imageError1, setImageError1] = useState(false)
  const [imageError2, setImageError2] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [activeCharacter, setActiveCharacter] = useState<1 | 2 | null>(null)

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize', charNum: 1 | 2) => {
    setActiveCharacter(charNum)
    if (type === 'drag') {
      setIsDragging(true)
      onDragStart?.()
    } else {
      setIsResizing(true)
      onDragStart?.()
    }
    setDragStart({ x: e.clientX, y: e.clientY })
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activeCharacter) return
    
    const character = activeCharacter === 1 ? character1 : character2
    const onUpdate = activeCharacter === 1 ? onCharacter1Update : onCharacter2Update
    
    if (!character) return

    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      onUpdate({
        cropArea: {
          ...character.cropArea,
          x: Math.max(0, Math.min(300 - character.cropArea.width, character.cropArea.x + deltaX)),
          y: Math.max(0, Math.min(400 - character.cropArea.height, character.cropArea.y + deltaY))
        }
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      onUpdate({
        cropArea: {
          ...character.cropArea,
          width: Math.max(50, Math.min(300 - character.cropArea.x, character.cropArea.width + deltaX)),
          height: Math.max(50, Math.min(400 - character.cropArea.y, character.cropArea.height + deltaY))
        }
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setActiveCharacter(null)
    onDragEnd?.()
  }

  const CharacterImageDisplay = ({ 
    character, 
    characterNum, 
    imageError, 
    setImageError 
  }: {
    character: CharacterData
    characterNum: 1 | 2
    imageError: boolean
    setImageError: (error: boolean) => void
  }) => (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="text-sm font-medium mb-2 text-center">
        {character.name} - 크롭 영역 조정
      </div>
      <div
        className="relative flex items-center justify-center rounded-lg border overflow-hidden bg-white py-1 px-4 w-full max-w-sm aspect-square"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {!imageError ? (
          <div 
            className="relative select-none"
            style={{ transform: 'scale(1.5)', transformOrigin: 'center' }}
          >
            <img
              src={`/api/proxy-image?url=${encodeURIComponent(
                character.emotion 
                  ? character.customUrl.replace(/emotion=[^&]*/, `emotion=${character.emotion}`)
                  : character.customUrl
              )}`}
              alt={character.name}
              width={300}
              height={400}
              className={`transition-transform duration-200 ${character.flipX ? 'scale-x-[-1]' : ''}`}
              onError={() => setImageError(true)}
              style={{ pointerEvents: 'none', display: 'block' }}
            />
            
            {/* 크롭 영역 표시 */}
            <div
              className="absolute border-2 border-pink-500 bg-pink-500 bg-opacity-20"
              style={{
                left: character.cropArea.x,
                top: character.cropArea.y,
                width: character.cropArea.width,
                height: character.cropArea.height,
                cursor: isDragging && activeCharacter === characterNum ? 'grabbing' : 'grab'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'drag', characterNum)}
            >
              {/* 크기 조정 핸들 */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 bg-pink-500 cursor-se-resize"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handleMouseDown(e, 'resize', characterNum)
                }}
              />
            </div>
            
            {/* 이미지 경계선 */}
            <div className="absolute inset-0 border-2 border-gray-300 pointer-events-none" />
            
            {/* 좌우반전 버튼 (우측 상단) */}
            <button
              onClick={() => {
                const onUpdate = characterNum === 1 ? onCharacter1Update : onCharacter2Update
                onUpdate({ flipX: !character.flipX })
              }}
              className="absolute top-12 right-12 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-1.5 rounded-full transition-all z-10"
              title="좌우반전"
            >
              <FlipHorizontal className="w-3 h-3" />
            </button>
            
            {/* 크롭 정보 표시 (하단 중앙) */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none text-center leading-tight">
              위치: ({character.cropArea.x}, {character.cropArea.y})<br />
              크기: {character.cropArea.width} × {character.cropArea.height}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">이미지를 불러올 수 없습니다</div>
            <div className="text-sm">다른 설정을 시도해보세요</div>
          </div>
        )}
      </div>
    </div>
  )

  if (!character1 || !character2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>캐릭터 이미지 및 크롭 영역 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-12">
            두 캐릭터를 모두 검색하면 이미지와 크롭 영역을 설정할 수 있습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>캐릭터 이미지 및 크롭 영역 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <CharacterImageDisplay
            character={character1}
            characterNum={1}
            imageError={imageError1}
            setImageError={setImageError1}
          />
          
          <CharacterImageDisplay
            character={character2}
            characterNum={2}
            imageError={imageError2}
            setImageError={setImageError2}
          />
        </div>
      </CardContent>
    </Card>
  )
}