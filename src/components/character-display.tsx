'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { CharacterData } from '@/lib/maplestory-api'

interface CharacterDisplayProps {
  character: CharacterData
  onUpdate: (updates: Partial<CharacterData>) => void
  backgroundColor?: string
  showFinalMeme?: boolean
}

export function CharacterDisplay({ character, onUpdate, backgroundColor = '#ffffff', showFinalMeme = false }: CharacterDisplayProps) {
  const [imageError, setImageError] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isGenerating, setIsGenerating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const toggleFlipX = () => {
    onUpdate({ flipX: !character.flipX })
  }

  const toggleShowName = () => {
    onUpdate({ showName: !character.showName })
  }

  const toggleShowGuild = () => {
    onUpdate({ showGuild: !character.showGuild })
  }

  // 짤 생성 함수
  const generateFinalMeme = async () => {
    if (!showFinalMeme) return
    
    setIsGenerating(true)
    
    try {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      
      // 크롭 영역의 크기를 4배 확대하여 캔버스 크기로 사용
      const crop = character.cropArea
      const canvasWidth = crop.width * 4
      const canvasHeight = crop.height * 4
      
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      
      // 이미지 로드하고 그리기
      await new Promise<void>((resolve) => {
        const img = new Image()
        
        img.onload = async () => {
          // 던파 비트비트체 폰트를 직접 로드
          try {
            const font = new FontFace('DNFBitBitv2', 'url(//cdn.df.nexon.com/img/common/font/DNFBitBitv2.otf)')
            await font.load()
            document.fonts.add(font)
          } catch (error) {
            console.log('DNFBitBitv2 폰트 로드 실패:', error)
          }
          
          // 폰트 로드를 위해 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // 배경색 그리기
          ctx.fillStyle = backgroundColor
          ctx.fillRect(0, 0, canvasWidth, canvasHeight)
          
          // 픽셀 아트 느낌을 위해 부드러운 렌더링 비활성화
          ctx.imageSmoothingEnabled = false
          
          const scaledWidth = crop.width * 4
          const scaledHeight = crop.height * 4
          
          ctx.save()
          
          if (character.flipX) {
            ctx.scale(-1, 1)
            ctx.drawImage(
              img,
              crop.x, crop.y, crop.width, crop.height,
              -scaledWidth, 0, scaledWidth, scaledHeight
            )
          } else {
            ctx.drawImage(
              img,
              crop.x, crop.y, crop.width, crop.height,
              0, 0, scaledWidth, scaledHeight
            )
          }
          
          ctx.restore()
          
          // 도트 스타일 닉네임 그리기 (우측 하단)
          if (character.showName) {
            ctx.fillStyle = '#000000'
            ctx.font = '12px "DNFBitBitv2", "Courier New", "monospace"'
            ctx.textAlign = 'right'
            ctx.imageSmoothingEnabled = false
            
            ctx.save()
            
            const textScale = 1.5
            ctx.scale(textScale, textScale)
            
            const pixelX = (scaledWidth - 8) / textScale
            const pixelY = (scaledHeight - 8) / textScale
            
            // 흰색 테두리 효과
            ctx.strokeStyle = '#FFFFFF'
            ctx.lineWidth = 3 / textScale
            ctx.strokeText(character.name, pixelX, pixelY)
            
            // 검은색 텍스트
            ctx.fillText(character.name, pixelX, pixelY)
            
            ctx.restore()
          }
          
          resolve()
        }
        
        img.onerror = () => {
          console.error('이미지 로드 실패:', character.customUrl)
          
          ctx.fillStyle = backgroundColor
          ctx.fillRect(0, 0, canvasWidth, canvasHeight)
          
          ctx.fillStyle = '#666666'
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('이미지 로드 실패', canvasWidth / 2, canvasHeight / 2)
          
          resolve()
        }
        
        img.src = `/api/proxy-image?url=${encodeURIComponent(character.customUrl)}`
      })
      
    } catch (error) {
      console.error('이미지 생성 중 오류:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 다운로드 함수
  const downloadImage = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `${character.name}_짤_${new Date().getTime()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // character나 backgroundColor가 변경될 때마다 자동으로 짤 생성
  useEffect(() => {
    if (showFinalMeme) {
      generateFinalMeme()
    }
  }, [character, backgroundColor, showFinalMeme])

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize') => {
    if (type === 'drag') {
      setIsDragging(true)
    } else {
      setIsResizing(true)
    }
    setDragStart({ x: e.clientX, y: e.clientY })
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
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
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          <span>캐릭터 미리보기</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showFinalMeme ? (
          // 이미지 2개 나란히 배치 (원본 + 최종 짤)
          <div className="grid grid-cols-2 gap-4">
            {/* 왼쪽: 원본 이미지 (크롭 영역 조정) */}
            <div>
              <div className="text-sm font-medium mb-2 text-center">크롭 영역 조정</div>
              <div
                className="relative flex items-center justify-center p-2 rounded-lg border overflow-hidden"
                style={{ backgroundColor, minHeight: '280px' }}
              >
                {!imageError ? (
                  <div 
                    className="relative select-none"
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    style={{ transform: 'scale(0.93)', transformOrigin: 'center' }}
                  >
                    <img
                      ref={imageRef}
                      src={`/api/proxy-image?url=${encodeURIComponent(character.customUrl)}`}
                      alt={character.name}
                      width={300}
                      height={400}
                      className={`transition-transform duration-200 ${character.flipX ? 'scale-x-[-1]' : ''}`}
                      onError={() => setImageError(true)}
                      style={{ pointerEvents: 'none', display: 'block' }}
                    />
                    
                    {/* 크롭 영역 표시 */}
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                      style={{
                        left: character.cropArea.x,
                        top: character.cropArea.y,
                        width: character.cropArea.width,
                        height: character.cropArea.height,
                        cursor: isDragging ? 'grabbing' : 'grab'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'drag')}
                    >
                      {/* 크기 조정 핸들 */}
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          handleMouseDown(e, 'resize')
                        }}
                      />
                    </div>
                    
                    {/* 이미지 경계선 */}
                    <div className="absolute inset-0 border-2 border-gray-300 pointer-events-none" />
                    
                    {/* 크롭 정보 표시 (우측 하단) */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none">
                      ({character.cropArea.x}, {character.cropArea.y}) {character.cropArea.width}x{character.cropArea.height}
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

            {/* 오른쪽: 최종 짤 */}
            <div>
              <div className="text-sm font-medium mb-2 text-center">최종 짤</div>
              <div className="flex flex-col items-center space-y-3">
                {isGenerating && (
                  <div className="text-center text-sm text-blue-600">
                    짤 생성 중...
                  </div>
                )}
                <div className="border rounded-lg p-2 bg-gray-50">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto border border-gray-300 bg-white"
                    style={{ display: 'block', margin: '0 auto' }}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={downloadImage}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  다운로드
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // 기존 단일 이미지 표시
          <div
            className="relative min-h-[300px] flex flex-col items-center justify-center p-4 rounded-lg"
            style={{ backgroundColor }}
          >
            {!imageError ? (
              <div 
                className="relative select-none"
                ref={containerRef}
                onMouseMove={handleMouseMove}
              >
                <img
                  ref={imageRef}
                  src={`/api/proxy-image?url=${encodeURIComponent(character.customUrl)}`}
                  alt={character.name}
                  width={300}
                  height={400}
                  className={`transition-transform duration-200 ${character.flipX ? 'scale-x-[-1]' : ''}`}
                  onError={() => setImageError(true)}
                  style={{ pointerEvents: 'none', display: 'block' }}
                />
                
                {/* 크롭 영역 표시 */}
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                  style={{
                    left: character.cropArea.x,
                    top: character.cropArea.y,
                    width: character.cropArea.width,
                    height: character.cropArea.height,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'drag')}
                >
                  {/* 크기 조정 핸들 */}
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      handleMouseDown(e, 'resize')
                    }}
                  />
                </div>
                
                {/* 이미지 경계선 */}
                <div className="absolute inset-0 border-2 border-gray-300 pointer-events-none" />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-lg mb-2">이미지를 불러올 수 없습니다</div>
                <div className="text-sm">다른 설정을 시도해보세요</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}