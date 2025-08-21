'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react'

interface MemeSlot {
  character: {
    name: string
    customUrl: string
    flipX: boolean
    showName: boolean
    showGuild: boolean
    guild: string
    cropArea: {
      x: number
      y: number
      width: number
      height: number
    }
  }
  backgroundColor: string
}

interface FinalMemeGeneratorProps {
  memeSlots: MemeSlot[]
}

export function FinalMemeGenerator({ memeSlots }: FinalMemeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // memeSlots가 변경될 때마다 자동으로 짤 생성
  useEffect(() => {
    if (memeSlots.length > 0) {
      generateFinalMeme()
    }
  }, [memeSlots])

  const generateFinalMeme = async () => {
    if (memeSlots.length === 0) return

    setIsGenerating(true)
    
    try {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      
      // 크롭 영역의 크기를 4배 확대하여 캔버스 크기로 사용
      const crop = memeSlots[0]?.character.cropArea || { width: 300, height: 400 }
      const canvasWidth = crop.width * 4
      const canvasHeight = crop.height * 4
      
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      
      // 배경을 흰색으로 채움
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      // 첫 번째 슬롯의 이미지 로드하고 그리기
      const slot = memeSlots[0]
      if (slot) {
        await new Promise<void>((resolve) => {
          const img = new Image()
          
          img.onload = async () => {
            // 던파 비트비트체 폰트를 직접 로드
            try {
              const font = new FontFace('DNFBitBitv2', 'url(//cdn.df.nexon.com/img/common/font/DNFBitBitv2.otf)')
              await font.load()
              document.fonts.add(font)
              console.log('DNFBitBitv2 폰트 로드 성공')
            } catch (error) {
              console.log('DNFBitBitv2 폰트 로드 실패:', error)
            }
            
            // 폰트 로드를 위해 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 100))
            // 배경색 그리기
            ctx.fillStyle = slot.backgroundColor
            ctx.fillRect(0, 0, canvasWidth, canvasHeight)
            
            // 크롭 영역에서 이미지를 그리기
            const crop = slot.character.cropArea
            
            // 크롭 영역은 이미 300x400 기준이므로 그대로 사용
            const sourceX = crop.x
            const sourceY = crop.y
            const sourceWidth = crop.width
            const sourceHeight = crop.height
            
            // 캔버스에 크롭된 이미지를 4배 확대하여 그리기
            ctx.save()
            
            // 픽셀 아트 느낌을 위해 부드러운 렌더링 비활성화
            ctx.imageSmoothingEnabled = false
            
            const scaledWidth = sourceWidth * 4
            const scaledHeight = sourceHeight * 4
            
            if (slot.character.flipX) {
              ctx.scale(-1, 1)
              ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                -scaledWidth, 0, scaledWidth, scaledHeight
              )
            } else {
              ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, scaledWidth, scaledHeight
              )
            }
            
            ctx.restore()
            
            // 도트 스타일 닉네임 그리기 (우측 하단)
            if (slot.character.showName) {
              console.log('닉네임 표시 중:', slot.character.name, scaledWidth, scaledHeight)
              
              // 4배 확대된 캔버스에 맞춘 던파 비트비트체 폰트
              ctx.fillStyle = '#000000'
              ctx.font = '12px "DNFBitBitv2", "Courier New", "monospace"'  // 폰트 크기 더 줄임
              ctx.textAlign = 'right'
              ctx.imageSmoothingEnabled = false
              
              // 픽셀화 효과를 위해 작게 그린 후 확대
              ctx.save()
              
              // 픽셀 효과를 위한 추가 스케일링
              const textScale = 1.5
              ctx.scale(textScale, textScale)
              
              // 4배 확대된 캔버스에 맞춰 위치 조정 (여백 줄임)
              const pixelX = (scaledWidth - 8) / textScale
              const pixelY = (scaledHeight - 8) / textScale
              
              // 흰색 테두리 효과
              ctx.strokeStyle = '#FFFFFF'
              ctx.lineWidth = 3 / textScale
              ctx.strokeText(slot.character.name, pixelX, pixelY)
              
              // 검은색 텍스트
              ctx.fillText(slot.character.name, pixelX, pixelY)
              
              ctx.restore()
            }
            
            resolve()
          }
          
          img.onerror = (error) => {
            // 이미지 로드 실패시 빈 슬롯으로 처리
            console.error('이미지 로드 실패:', slot.character.customUrl, error)
            
            ctx.fillStyle = slot.backgroundColor
            ctx.fillRect(0, 0, canvasWidth, canvasHeight)
            
            ctx.fillStyle = '#666666'
            ctx.font = '14px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('이미지 로드 실패', canvasWidth / 2, canvasHeight / 2)
            ctx.fillText(slot.character.customUrl, canvasWidth / 2, canvasHeight / 2 + 20)
            
            resolve()
          }
          
          // Next.js 이미지 프록시를 통해 CORS 우회
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(slot.character.customUrl)}`
          console.log('이미지 로드 시도 (프록시):', proxyUrl)
          console.log('크롭 정보:', slot.character.cropArea)
          img.src = proxyUrl
        })
      }
      
    } catch (error) {
      console.error('이미지 생성 중 오류:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = () => {
    const canvas = canvasRef.current!
    const link = document.createElement('a')
    link.download = `메짤_${new Date().getTime()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const hasSlots = memeSlots.length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          최종 짤 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
            <Button
              onClick={downloadImage}
              variant="outline"
              disabled={!hasSlots || isGenerating}
            >
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
        </div>

        {!hasSlots && (
          <div className="text-center text-gray-500 py-8">
            먼저 캐릭터를 추가해주세요.
          </div>
        )}

        {hasSlots && (
          <div className="space-y-4">
            {isGenerating && (
              <div className="text-center text-sm text-blue-600 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                짤 생성 중...
              </div>
            )}
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-gray-300 bg-white"
                style={{ display: 'block', margin: '0 auto' }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}