'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react'
import { LAYOUT_OPTIONS } from '@/lib/meme-options'

interface MemeSlot {
  character: {
    name: string
    customUrl: string
    flipX: boolean
    showName: boolean
    showGuild: boolean
    guild: string
  }
  backgroundColor: string
}

interface FinalMemeGeneratorProps {
  memeSlots: MemeSlot[]
}

export function FinalMemeGenerator({ memeSlots }: FinalMemeGeneratorProps) {
  const [layout, setLayout] = useState('horizontal')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateFinalMeme = async () => {
    if (memeSlots.length === 0) return

    setIsGenerating(true)
    
    try {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      
      // 캔버스 크기 설정
      const slotWidth = 300
      const slotHeight = 400
      
      let canvasWidth: number
      let canvasHeight: number
      
      switch (layout) {
        case 'horizontal':
          canvasWidth = slotWidth * Math.min(memeSlots.length, 4)
          canvasHeight = slotHeight
          break
        case 'vertical':
          canvasWidth = slotWidth
          canvasHeight = slotHeight * Math.min(memeSlots.length, 4)
          break
        case 'grid':
        default:
          canvasWidth = slotWidth * 2
          canvasHeight = slotHeight * 2
          break
      }
      
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      
      // 배경을 흰색으로 채움
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      // 각 슬롯의 이미지를 로드하고 그리기
      const imagePromises = memeSlots.slice(0, 4).map(async (slot, index) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          
          img.onload = () => {
            let x: number, y: number
            
            switch (layout) {
              case 'horizontal':
                x = index * slotWidth
                y = 0
                break
              case 'vertical':
                x = 0
                y = index * slotHeight
                break
              case 'grid':
              default:
                x = (index % 2) * slotWidth
                y = Math.floor(index / 2) * slotHeight
                break
            }
            
            // 배경색 그리기
            ctx.fillStyle = slot.backgroundColor
            ctx.fillRect(x, y, slotWidth, slotHeight)
            
            // 캐릭터 이미지 그리기
            ctx.save()
            
            if (slot.character.flipX) {
              ctx.scale(-1, 1)
              ctx.drawImage(img, -(x + slotWidth), y, slotWidth, slotHeight)
            } else {
              ctx.drawImage(img, x, y, slotWidth, slotHeight)
            }
            
            ctx.restore()
            
            // 텍스트 그리기
            if (slot.character.showName) {
              ctx.fillStyle = '#000000'
              ctx.font = 'bold 16px sans-serif'
              ctx.textAlign = 'center'
              ctx.fillText(slot.character.name, x + slotWidth / 2, y + slotHeight - 10)
            }
            
            if (slot.character.showGuild && slot.character.guild) {
              ctx.fillStyle = '#0066cc'
              ctx.font = '12px sans-serif'
              ctx.textAlign = 'center'
              ctx.fillText(slot.character.guild, x + slotWidth / 2, y + slotHeight - 30)
            }
            
            resolve()
          }
          
          img.onerror = () => {
            // 이미지 로드 실패시 빈 슬롯으로 처리
            let x: number, y: number
            
            switch (layout) {
              case 'horizontal':
                x = index * slotWidth
                y = 0
                break
              case 'vertical':
                x = 0
                y = index * slotHeight
                break
              case 'grid':
              default:
                x = (index % 2) * slotWidth
                y = Math.floor(index / 2) * slotHeight
                break
            }
            
            ctx.fillStyle = slot.backgroundColor
            ctx.fillRect(x, y, slotWidth, slotHeight)
            
            ctx.fillStyle = '#666666'
            ctx.font = '14px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('이미지 로드 실패', x + slotWidth / 2, y + slotHeight / 2)
            
            resolve()
          }
          
          img.src = slot.character.customUrl
        })
      })
      
      await Promise.all(imagePromises)
      
    } catch (error) {
      console.error('이미지 생성 중 오류:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = () => {
    const canvas = canvasRef.current!
    const link = document.createElement('a')
    link.download = `메짤네컷_${new Date().getTime()}.png`
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">배열 방식</label>
            <Select value={layout} onChange={(e) => setLayout(e.target.value)}>
              {LAYOUT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="flex gap-2 items-end">
            <Button
              onClick={generateFinalMeme}
              disabled={!hasSlots || isGenerating}
              className="min-w-[120px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  짤 생성
                </>
              )}
            </Button>
            
            <Button
              onClick={downloadImage}
              variant="outline"
              disabled={!hasSlots}
            >
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </div>
        </div>

        {!hasSlots && (
          <div className="text-center text-gray-500 py-8">
            먼저 캐릭터를 추가해주세요.
          </div>
        )}

        {hasSlots && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {memeSlots.length}개의 슬롯이 준비되었습니다. 
              {layout === 'grid' && memeSlots.length > 4 && ' (2x2 배열은 최대 4개 슬롯만 사용됩니다)'}
            </div>
            
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