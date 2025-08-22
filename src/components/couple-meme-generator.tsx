'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import type { CharacterData } from '@/lib/maplestory-api'
import { MEME_TEMPLATES, EMOTIONS, BACKGROUND_COLORS } from '@/lib/meme-options'

interface CoupleMemeGeneratorProps {
  character1: CharacterData | null
  character2: CharacterData | null
  onCharacter1Update?: (updates: Partial<CharacterData>) => void
  onCharacter2Update?: (updates: Partial<CharacterData>) => void
  isDragging?: boolean
}

export function CoupleMemeGenerator({ character1, character2, onCharacter1Update, onCharacter2Update, isDragging: externalIsDragging }: CoupleMemeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const selectedTemplate = 'basic'
  const [backgroundColor, setBackgroundColor] = useState('#f0f9ff')
  const [isGenerating, setIsGenerating] = useState(false)

  // 랜덤 배경색 설정
  useEffect(() => {
    const colors = ['#f0f9ff', '#fff5f5', '#f0fff4', '#fffacd', '#f5f0ff', '#fff0f5', '#f0ffff', '#fdf2e9']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setBackgroundColor(randomColor)
  }, [])

  useEffect(() => {
    if (character1 && character2 && selectedTemplate && !externalIsDragging) {
      generateCoupleMeme()
    }
  }, [character1, character2, selectedTemplate, backgroundColor, character1?.emotion, character2?.emotion, character1?.showName, character2?.showName, externalIsDragging])

  const generateCoupleMeme = async () => {
    console.log('Generating couple meme...', { 
      character1: !!character1, 
      character2: !!character2, 
      selectedTemplate,
      canvas: !!canvasRef.current 
    })
    
    if (!character1 || !character2 || !selectedTemplate || !canvasRef.current) {
      console.log('Missing required data for meme generation')
      return
    }

    setIsGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Failed to get canvas context')
      setIsGenerating(false)
      return
    }

    const template = MEME_TEMPLATES.find(t => t.id === selectedTemplate)
    if (!template) {
      console.error('Template not found:', selectedTemplate)
      setIsGenerating(false)
      return
    }
    
    console.log('Using template:', template)

    // 커플용으로 캐릭터 크기에 맞춰 조정
    const canvasWidth = 600  // 800에서 600으로 줄임
    const canvasHeight = 400

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    try {
      // 배경 그리기
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      console.log('Background drawn with color:', backgroundColor)

      // 템플릿 배경 이미지 로드 및 그리기 (배경 이미지가 있는 경우에만)
      if (template.backgroundImage && template.backgroundImage.trim() !== '') {
        console.log('Loading background image:', template.backgroundImage)
        const bgImg = new Image()
        bgImg.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve
          bgImg.onerror = reject
          bgImg.src = template.backgroundImage!
        })
        ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight)
        console.log('Background image drawn')
      } else {
        console.log('No background image for template')
      }

      // 변수 선언 (닉네임 표시를 위해 외부에서 접근 가능하도록)
      let char1XPos = 0, char1YPos = 0, char1Width = 0, char1Height = 0
      let char2XPos = 0, char2YPos = 0, char2Width = 0, char2Height = 0

      // 캐릭터 1 얼굴 크롭 및 배치
      if (character1.customUrl && character1.cropArea) {
        // 표정을 적용한 URL 생성
        const emotion = character1.emotion || 'E00'
        const characterUrl = character1.customUrl.replace(/emotion=[^&]*/, `emotion=${emotion}`)
        console.log('Loading character1 image with emotion:', emotion, characterUrl)
        
        const char1Img = new Image()
        char1Img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          char1Img.onload = () => {
            console.log('Character1 image loaded successfully')
            resolve(char1Img)
          }
          char1Img.onerror = (error) => {
            console.error('Character1 image load failed:', error)
            reject(error)
          }
          char1Img.src = `/api/proxy-image?url=${encodeURIComponent(characterUrl)}`
        })

        const crop1 = character1.cropArea
        
        // 좌우반전된 경우 크롭 영역을 반대로 조정
        let adjustedCrop1
        if (character1.flipX) {
          adjustedCrop1 = {
            x: char1Img.width - crop1.x - crop1.width,
            y: crop1.y,
            width: crop1.width,
            height: crop1.height
          }
        } else {
          adjustedCrop1 = crop1
        }
        
        // 크롭 영역이 이미지 범위 내에 있는지 확인하고 보정
        const safeCrop1 = {
          x: Math.max(0, Math.min(adjustedCrop1.x, char1Img.width - 1)),
          y: Math.max(0, Math.min(adjustedCrop1.y, char1Img.height - 1)),
          width: Math.min(adjustedCrop1.width, char1Img.width - adjustedCrop1.x),
          height: Math.min(adjustedCrop1.height, char1Img.height - adjustedCrop1.y)
        }
        
        // 크롭 영역의 가로세로 비율을 유지하면서 최대 360px
        const maxSize = 360
        const cropRatio = safeCrop1.width / safeCrop1.height
        // char1Width, char1Height는 이미 외부에서 선언됨
        
        if (cropRatio > 1) {
          // 가로가 더 긴 경우
          char1Width = maxSize
          char1Height = maxSize / cropRatio
        } else {
          // 세로가 더 긴 경우 또는 정사각형
          char1Width = maxSize * cropRatio
          char1Height = maxSize
        }
        
        char1XPos = 0 // 왼쪽 끝에 배치하여 배경 왼쪽면과 겹침
        char1YPos = canvasHeight - char1Height // 아래쪽에 배치

        console.log('Character1 draw params:', {
          originalCrop: crop1,
          adjustedCrop: adjustedCrop1,
          safeCrop: safeCrop1,
          cropRatio: cropRatio,
          size: { width: char1Width, height: char1Height },
          position: { x: char1XPos, y: char1YPos },
          flipX: character1.flipX,
          imageSize: { width: char1Img.width, height: char1Img.height },
          canvasSize: { width: canvasWidth, height: canvasHeight }
        })

        // 캐릭터 1 그리기 (크롭 조정 + 좌우반전 그리기)
        ctx.save()
        if (character1.flipX) {
          // 좌우반전: 캐릭터 위치를 중심으로 반전
          ctx.translate(char1XPos + char1Width / 2, char1YPos + char1Height / 2)
          ctx.scale(-1, 1)
          ctx.translate(-char1Width / 2, -char1Height / 2)
          ctx.drawImage(
            char1Img,
            safeCrop1.x, safeCrop1.y, safeCrop1.width, safeCrop1.height,
            0, 0, char1Width, char1Height
          )
          console.log('Character1 drawn (crop adjusted + flipped)')
        } else {
          ctx.drawImage(
            char1Img,
            safeCrop1.x, safeCrop1.y, safeCrop1.width, safeCrop1.height,
            char1XPos, char1YPos, char1Width, char1Height
          )
          console.log('Character1 drawn (normal)')
        }
        ctx.restore()
      }

      // 캐릭터 2 얼굴 크롭 및 배치
      if (character2.customUrl && character2.cropArea) {
        // 표정을 적용한 URL 생성
        const emotion = character2.emotion || 'E00'
        const characterUrl = character2.customUrl.replace(/emotion=[^&]*/, `emotion=${emotion}`)
        console.log('Loading character2 image with emotion:', emotion, characterUrl)
        
        const char2Img = new Image()
        char2Img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          char2Img.onload = () => {
            console.log('Character2 image loaded successfully')
            resolve(char2Img)
          }
          char2Img.onerror = (error) => {
            console.error('Character2 image load failed:', error)
            reject(error)
          }
          char2Img.src = `/api/proxy-image?url=${encodeURIComponent(characterUrl)}`
        })

        const crop2 = character2.cropArea
        
        // 크롭 영역이 이미지 범위 내에 있는지 확인하고 보정
        const safeCrop2 = {
          x: Math.max(0, Math.min(crop2.x, char2Img.width - 1)),
          y: Math.max(0, Math.min(crop2.y, char2Img.height - 1)),
          width: Math.min(crop2.width, char2Img.width - crop2.x),
          height: Math.min(crop2.height, char2Img.height - crop2.y)
        }
        
        // 크롭 영역의 가로세로 비율을 유지하면서 최대 360px
        const maxSize2 = 360
        const cropRatio2 = safeCrop2.width / safeCrop2.height
        // char2Width, char2Height는 이미 외부에서 선언됨
        
        if (cropRatio2 > 1) {
          // 가로가 더 긴 경우
          char2Width = maxSize2
          char2Height = maxSize2 / cropRatio2
        } else {
          // 세로가 더 긴 경우 또는 정사각형
          char2Width = maxSize2 * cropRatio2
          char2Height = maxSize2
        }
        
        char2XPos = canvasWidth - char2Width // 오른쪽 끝에 배치하여 배경 오른쪽면과 겹침
        char2YPos = canvasHeight - char2Height // 아래쪽에 배치

        console.log('Character2 draw params:', {
          originalCrop: crop2,
          safeCrop: safeCrop2,
          cropRatio: cropRatio2,
          size: { width: char2Width, height: char2Height },
          position: { x: char2XPos, y: char2YPos },
          flipX: character2.flipX
        })

        // 캐릭터 2 그리기 (좌우반전 적용)
        ctx.save()
        if (character2.flipX) {
          // 좌우반전: 캐릭터 위치를 중심으로 반전
          ctx.translate(char2XPos + char2Width / 2, char2YPos + char2Height / 2)
          ctx.scale(-1, 1)
          ctx.translate(-char2Width / 2, -char2Height / 2)
          ctx.drawImage(
            char2Img,
            safeCrop2.x, safeCrop2.y, safeCrop2.width, safeCrop2.height,
            0, 0, char2Width, char2Height
          )
          console.log('Character2 drawn (flipped)')
        } else {
          ctx.drawImage(
            char2Img,
            safeCrop2.x, safeCrop2.y, safeCrop2.width, safeCrop2.height,
            char2XPos, char2YPos, char2Width, char2Height
          )
          console.log('Character2 drawn (normal)')
        }
        ctx.restore()
      }

      // 닉네임 표시 (캐릭터 1 - 왼쪽 아래 구석)
      if (character1.showName) {
        ctx.save()
        ctx.fillStyle = '#000000'
        ctx.font = '24px "DNFBitBitv2", "Courier New", "monospace"'
        ctx.textAlign = 'left'
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        
        const name1X = 20 // 왼쪽 여백
        const name1Y = canvasHeight - 20 // 아래쪽 여백
        
        ctx.strokeText(character1.name, name1X, name1Y)
        ctx.fillText(character1.name, name1X, name1Y)
        ctx.restore()
        console.log('Character1 name drawn:', character1.name)
      }

      // 닉네임 표시 (캐릭터 2 - 오른쪽 아래 구석)
      if (character2.showName) {
        ctx.save()
        ctx.fillStyle = '#000000'
        ctx.font = '24px "DNFBitBitv2", "Courier New", "monospace"'
        ctx.textAlign = 'right'
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        
        const name2X = canvasWidth - 20 // 오른쪽 여백
        const name2Y = canvasHeight - 20 // 아래쪽 여백
        
        ctx.strokeText(character2.name, name2X, name2Y)
        ctx.fillText(character2.name, name2X, name2Y)
        ctx.restore()
        console.log('Character2 name drawn:', character2.name)
      }

      console.log('Meme generation completed successfully')

    } catch (error) {
      console.error('커플 짤 생성 중 오류:', error)
      // 오류 발생 시 기본 메시지 표시
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = '#666666'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('이미지 생성 중 오류가 발생했습니다', canvasWidth / 2, canvasHeight / 2)
      ctx.font = '16px Arial'
      ctx.fillText('템플릿을 선택하고 다시 시도해주세요', canvasWidth / 2, canvasHeight / 2 + 30)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadMeme = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `커플짤_${character1?.name || 'char1'}_${character2?.name || 'char2'}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  if (!character1 || !character2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>커플 짤 생성</CardTitle>
          <CardDescription>
            두 캐릭터를 모두 검색해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-12">
            두 캐릭터를 모두 검색하면 커플 짤 생성을 시작할 수 있습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 미리보기 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>커플 짤 미리보기</CardTitle>
            <Button
              onClick={downloadMeme}
              disabled={isGenerating || !selectedTemplate}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border rounded-lg max-w-full h-auto"
              style={{ maxHeight: '400px' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 커스터마이징 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🎨</span>
            커스터마이징
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 배경색 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">배경색</label>
            <div className="flex gap-2 items-center flex-wrap">
              {BACKGROUND_COLORS.slice(0, 8).map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBackgroundColor(color.value)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    backgroundColor === color.value
                      ? 'border-gray-800 ring-1 ring-gray-300'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color.preview }}
                  title={color.label}
                />
              ))}
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                title="사용자 정의 색상"
              />
            </div>
          </div>

          {/* 캐릭터 표정 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 캐릭터 1 설정 */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">{character1.name} 표정</label>
                <div className="flex gap-1 flex-wrap">
                  {EMOTIONS.map((emotion) => (
                    <button
                      key={emotion.value}
                      onClick={() => {
                        if (character1 && onCharacter1Update) {
                          onCharacter1Update({ emotion: emotion.value })
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded border transition-all ${
                        character1.emotion === emotion.value 
                          ? 'bg-pink-500 text-white border-pink-500' 
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                      }`}
                      title={emotion.label}
                    >
                      {emotion.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 닉네임 표시 */}
              <div>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={character1.showName || false}
                    onChange={(e) => {
                      if (onCharacter1Update) {
                        onCharacter1Update({ showName: e.target.checked })
                      }
                    }}
                    className="mr-2"
                  />
                  닉네임 표시
                </label>
              </div>
            </div>

            {/* 캐릭터 2 설정 */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">{character2.name} 표정</label>
                <div className="flex gap-1 flex-wrap">
                  {EMOTIONS.map((emotion) => (
                    <button
                      key={emotion.value}
                      onClick={() => {
                        if (character2 && onCharacter2Update) {
                          onCharacter2Update({ emotion: emotion.value })
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded border transition-all ${
                        character2.emotion === emotion.value 
                          ? 'bg-pink-500 text-white border-pink-500' 
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                      }`}
                      title={emotion.label}
                    >
                      {emotion.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 닉네임 표시 */}
              <div>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={character2.showName || false}
                    onChange={(e) => {
                      if (onCharacter2Update) {
                        onCharacter2Update({ showName: e.target.checked })
                      }
                    }}
                    className="mr-2"
                  />
                  닉네임 표시
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}