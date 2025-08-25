'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, ArrowUpDown, RefreshCw } from 'lucide-react'
import type { CharacterData } from '@/lib/maplestory-api'
import { EMOTIONS, BACKGROUND_COLORS } from '@/lib/meme-options'

interface MZ4CGeneratorProps {
  character1: CharacterData | null
  character2: CharacterData | null
  frameCharacters?: {
    char1: CharacterData | null,
    char2: CharacterData | null
  }[]
}

interface FrameSettings {
  char1Emotion: string
  char2Emotion: string
  backgroundColor: string
  isChar1OnTop: boolean
}

export function MZ4CGenerator({ character1, character2, frameCharacters }: MZ4CGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [frameColor, setFrameColor] = useState('#000000')
  const [topPadding, setTopPadding] = useState(150)
  const [bottomPadding, setBottomPadding] = useState(150)
  const [topText, setTopText] = useState('💕우리 사랑 영원히💕')
  const [bottomText, setBottomText] = useState('')
  const [fontSize, setFontSize] = useState(36)
  const [fontFamily, setFontFamily] = useState('Maplestory')
  const [layout, setLayout] = useState<'4x1' | '2x2'>('4x1')

  // 각 프레임별 설정 상태 (랜덤으로 초기화)
  const [frameSettings, setFrameSettings] = useState<FrameSettings[]>(() => {
    const getRandomEmotionInit = () => {
      const randomIndex = Math.floor(Math.random() * EMOTIONS.length)
      return EMOTIONS[randomIndex].value
    }
    const getRandomColorInit = () => {
      const randomIndex = Math.floor(Math.random() * BACKGROUND_COLORS.length)
      return BACKGROUND_COLORS[randomIndex].value
    }
    
    return [
      { char1Emotion: getRandomEmotionInit(), char2Emotion: getRandomEmotionInit(), backgroundColor: getRandomColorInit(), isChar1OnTop: Math.random() > 0.5 },
      { char1Emotion: getRandomEmotionInit(), char2Emotion: getRandomEmotionInit(), backgroundColor: getRandomColorInit(), isChar1OnTop: Math.random() > 0.5 },
      { char1Emotion: getRandomEmotionInit(), char2Emotion: getRandomEmotionInit(), backgroundColor: getRandomColorInit(), isChar1OnTop: Math.random() > 0.5 },
      { char1Emotion: getRandomEmotionInit(), char2Emotion: getRandomEmotionInit(), backgroundColor: getRandomColorInit(), isChar1OnTop: Math.random() > 0.5 }
    ]
  })

  useEffect(() => {
    // 메이플스토리 폰트 로드 (public/fonts 폴더)
    const loadMapleFonts = async () => {
      try {
        // Maplestory Light 폰트 로드
        const lightFont = new FontFace('Maplestory Light', 'url(/fonts/Maplestory Light.ttf)')
        await lightFont.load()
        document.fonts.add(lightFont)
        console.log('Maplestory Light 폰트 로드 성공')

        // Maplestory Bold 폰트 로드
        const boldFont = new FontFace('Maplestory Bold', 'url(/fonts/Maplestory Bold.ttf)')
        await boldFont.load()
        document.fonts.add(boldFont)
        console.log('Maplestory Bold 폰트 로드 성공')

        // DNF 폰트도 로드 시도
        try {
          const dnfFont = new FontFace('DNFBitBitv2', 'url(//cdn.df.nexon.com/img/common/font/DNFBitBitv2.otf)')
          await dnfFont.load()
          document.fonts.add(dnfFont)
          console.log('DNFBitBitv2 폰트 로드 성공')
        } catch (dnfError) {
          console.log('DNFBitBitv2 폰트 로드 실패:', dnfError)
        }
      } catch (error) {
        console.log('메이플스토리 폰트 로드 실패:', error)
      }
    }
    
    loadMapleFonts()
  }, [])

  // 하단 문구 기본값 설정 (캐릭터 검색 시)
  useEffect(() => {
    if (character1 && character2 && !bottomText) {
      setBottomText(`${character1.name}❤️${character2.name}`)
    }
  }, [character1, character2])

  // 텍스트 변경 시 지연 업데이트 (너무 자주 새로고침 방지)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (character1 && character2) {
        generateMZ4C()
      }
    }, 500) // 500ms 지연

    return () => clearTimeout(timer)
  }, [topText, bottomText, fontSize, fontFamily])

  useEffect(() => {
    if (character1 && character2) {
      generateMZ4C()
    }
  }, [character1, character2, frameColor, topPadding, bottomPadding, layout, frameSettings, frameCharacters])

  const getRandomEmotion = () => {
    const randomIndex = Math.floor(Math.random() * EMOTIONS.length)
    return EMOTIONS[randomIndex].value
  }

  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_COLORS.length)
    return BACKGROUND_COLORS[randomIndex].value
  }

  // 폰트 옵션
  const fontOptions = [
    { value: 'DNFBitBitv2', label: '던파 비트비트 (픽셀)', family: '"DNFBitBitv2", "Courier New", "monospace"' },
    { value: 'Maplestory', label: '메이플스토리체', family: '"Maplestory Light", "Maplestory", sans-serif' },
    { value: 'Arial', label: '아리얼 (기본)', family: 'Arial, sans-serif' },
    { value: 'Comic Sans MS', label: '코믹산스 (귀여움)', family: '"Comic Sans MS", cursive' },
    { value: 'Georgia', label: '조지아 (세리프)', family: 'Georgia, serif' },
  ]

  // 귀여운 이모지 모음
  const cuteEmojis = [
    '💕', '💖', '💗', '💘', '💝', '💞', '💓', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤',
    '😍', '🥰', '😘', '😊', '😄', '😆', '🤗', '🥺', '🤩', '😇', '🙂', '😋', '😎', '🤪', '😜',
    '⭐', '✨', '🌟', '💫', '🌙', '☀️', '🌈', '🍀', '🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '💐',
    '🎈', '🎉', '🎊', '🎁', '🎂', '🍰', '🧁', '🍭', '🍬', '🍯', '🍓', '🍒', '🍑', '🥰', '💋'
  ]

  const copyToClipboard = async (emoji: string) => {
    try {
      await navigator.clipboard.writeText(emoji)
      console.log('이모지 복사됨:', emoji)
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
    }
  }


  const generateCoupleImage = async (char1: CharacterData, char2: CharacterData, backgroundColor: string, isChar1OnTop: boolean = true): Promise<HTMLCanvasElement> => {
    const coupleCanvas = document.createElement('canvas')
    const ctx = coupleCanvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')

    // /couple 페이지의 커플짤미리보기와 동일한 크기
    const canvasWidth = 600
    const canvasHeight = 400
    
    coupleCanvas.width = canvasWidth
    coupleCanvas.height = canvasHeight

    // 변수 선언 (닉네임 표시를 위해 외부에서 접근 가능하도록)
    let char1XPos = 0, char1YPos = 0, char1Width = 0, char1Height = 0
    let char2XPos = 0, char2YPos = 0, char2Width = 0, char2Height = 0

    // 배경 그리기
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 캐릭터 그리기 함수들
    const drawCharacter1 = async () => {
      if (char1.customUrl && char1.cropArea) {
      const emotion = char1.emotion || 'E00'
      const characterUrl = char1.customUrl.replace(/emotion=[^&]*/, `emotion=${emotion}`)
      
      const char1Img = new Image()
      char1Img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        char1Img.onload = () => resolve(char1Img)
        char1Img.onerror = (error) => reject(error)
        char1Img.src = `/api/proxy-image?url=${encodeURIComponent(characterUrl)}`
      })

      const crop1 = char1.cropArea
      
      // 좌우반전된 경우 크롭 영역을 반대로 조정
      let adjustedCrop1
      if (char1.flipX) {
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
      
      if (cropRatio > 1) {
        char1Width = maxSize
        char1Height = maxSize / cropRatio
      } else {
        char1Width = maxSize * cropRatio
        char1Height = maxSize
      }
      
      char1XPos = 0 // 왼쪽 끝에 배치하여 배경 왼쪽면과 겹침
      char1YPos = canvasHeight - char1Height // 아래쪽에 배치

      // 캐릭터 1 그리기 (크롭 조정 + 좌우반전 그리기)
      ctx.save()
      if (char1.flipX) {
        ctx.translate(char1XPos + char1Width / 2, char1YPos + char1Height / 2)
        ctx.scale(-1, 1)
        ctx.translate(-char1Width / 2, -char1Height / 2)
        ctx.drawImage(
          char1Img,
          safeCrop1.x, safeCrop1.y, safeCrop1.width, safeCrop1.height,
          0, 0, char1Width, char1Height
        )
      } else {
        ctx.drawImage(
          char1Img,
          safeCrop1.x, safeCrop1.y, safeCrop1.width, safeCrop1.height,
          char1XPos, char1YPos, char1Width, char1Height
        )
      }
      ctx.restore()
      }
    }

    const drawCharacter2 = async () => {
      if (char2.customUrl && char2.cropArea) {
      const emotion = char2.emotion || 'E00'
      const characterUrl = char2.customUrl.replace(/emotion=[^&]*/, `emotion=${emotion}`)
      
      const char2Img = new Image()
      char2Img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        char2Img.onload = () => resolve(char2Img)
        char2Img.onerror = (error) => reject(error)
        char2Img.src = `/api/proxy-image?url=${encodeURIComponent(characterUrl)}`
      })

      const crop2 = char2.cropArea
      
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
      
      if (cropRatio2 > 1) {
        char2Width = maxSize2
        char2Height = maxSize2 / cropRatio2
      } else {
        char2Width = maxSize2 * cropRatio2
        char2Height = maxSize2
      }
      
      char2XPos = canvasWidth - char2Width // 오른쪽 끝에 배치하여 배경 오른쪽면과 겹침
      char2YPos = canvasHeight - char2Height // 아래쪽에 배치

      // 캐릭터 2 그리기 (좌우반전 적용)
      ctx.save()
      if (char2.flipX) {
        ctx.translate(char2XPos + char2Width / 2, char2YPos + char2Height / 2)
        ctx.scale(-1, 1)
        ctx.translate(-char2Width / 2, -char2Height / 2)
        ctx.drawImage(
          char2Img,
          safeCrop2.x, safeCrop2.y, safeCrop2.width, safeCrop2.height,
          0, 0, char2Width, char2Height
        )
      } else {
        ctx.drawImage(
          char2Img,
          safeCrop2.x, safeCrop2.y, safeCrop2.width, safeCrop2.height,
          char2XPos, char2YPos, char2Width, char2Height
        )
      }
      ctx.restore()
      }
    }

    // 순서에 따라 캐릭터 그리기
    if (isChar1OnTop) {
      await drawCharacter2() // 아래쪽에 먼저 그리기
      await drawCharacter1() // 위쪽에 나중에 그리기
    } else {
      await drawCharacter1() // 아래쪽에 먼저 그리기
      await drawCharacter2() // 위쪽에 나중에 그리기
    }

    // 닉네임 표시 제거

    return coupleCanvas
  }

  const generateMZ4C = async () => {
    if (!character1 || !character2 || !canvasRef.current) return

    setIsGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsGenerating(false)
      return
    }

    try {
      // Couple 이미지 4장 생성 (frameCharacters가 있으면 사용, 없으면 기본 캐릭터 사용)
      const getCharacterForFrame = (frameIndex: number, isChar1: boolean) => {
        if (frameCharacters && frameCharacters[frameIndex]) {
          const frameChar = isChar1 ? frameCharacters[frameIndex].char1 : frameCharacters[frameIndex].char2
          if (frameChar) return frameChar
        }
        return isChar1 ? character1 : character2
      }

      const couple1Char1 = { ...getCharacterForFrame(0, true), emotion: frameSettings[0].char1Emotion }
      const couple1Char2 = { ...getCharacterForFrame(0, false), emotion: frameSettings[0].char2Emotion }
      const couple1 = await generateCoupleImage(couple1Char1, couple1Char2, frameSettings[0].backgroundColor, frameSettings[0].isChar1OnTop)
      
      const couple2Char1 = { ...getCharacterForFrame(1, true), emotion: frameSettings[1].char1Emotion }
      const couple2Char2 = { ...getCharacterForFrame(1, false), emotion: frameSettings[1].char2Emotion }
      const couple2 = await generateCoupleImage(couple2Char1, couple2Char2, frameSettings[1].backgroundColor, frameSettings[1].isChar1OnTop)

      const couple3Char1 = { ...getCharacterForFrame(2, true), emotion: frameSettings[2].char1Emotion }
      const couple3Char2 = { ...getCharacterForFrame(2, false), emotion: frameSettings[2].char2Emotion }
      const couple3 = await generateCoupleImage(couple3Char1, couple3Char2, frameSettings[2].backgroundColor, frameSettings[2].isChar1OnTop)

      const couple4Char1 = { ...getCharacterForFrame(3, true), emotion: frameSettings[3].char1Emotion }
      const couple4Char2 = { ...getCharacterForFrame(3, false), emotion: frameSettings[3].char2Emotion }
      const couple4 = await generateCoupleImage(couple4Char1, couple4Char2, frameSettings[3].backgroundColor, frameSettings[3].isChar1OnTop)

      // 간격과 여백 설정
      const gap = 15  // 이미지 사이 간격
      const sidePadding = 20  // 좌우 여백
      
      // 레이아웃에 따른 캔버스 크기 계산
      if (layout === '4x1') {
        // 세로 배치 (4x1)
        canvas.width = couple1.width + (sidePadding * 2)
        canvas.height = (couple1.height * 4) + (gap * 3) + topPadding + bottomPadding
      } else {
        // 격자 배치 (2x2)
        canvas.width = (couple1.width * 2) + gap + (sidePadding * 2)
        canvas.height = (couple1.height * 2) + gap + topPadding + bottomPadding
      }

      // 배경 그리기
      ctx.fillStyle = frameColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 폰트 로딩 대기
      await new Promise(resolve => setTimeout(resolve, 200))

      // 상단 텍스트 그리기
      if (topText.trim()) {
        ctx.save()
        ctx.fillStyle = frameColor === '#000000' ? '#ffffff' : '#000000'
        const selectedFont = fontOptions.find(f => f.value === fontFamily)
        
        // 폰트 설정 강화
        ctx.font = `${fontSize}px ${selectedFont?.family || 'Arial, sans-serif'}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // 텍스트 윤곽선 추가 (가독성 향상)
        ctx.strokeStyle = frameColor === '#000000' ? '#ffffff' : '#000000'
        ctx.lineWidth = 3
        ctx.strokeText(topText, canvas.width / 2, topPadding / 2 + (fontSize / 2))
        ctx.fillText(topText, canvas.width / 2, topPadding / 2 + (fontSize / 2))
        ctx.restore()
      }

      // 레이아웃에 따른 이미지 배치
      if (layout === '4x1') {
        // 세로 배치 (4x1)
        let currentY = topPadding
        ctx.drawImage(couple1, sidePadding, currentY)
        currentY += couple1.height + gap
        ctx.drawImage(couple2, sidePadding, currentY)
        currentY += couple2.height + gap
        ctx.drawImage(couple3, sidePadding, currentY)
        currentY += couple3.height + gap
        ctx.drawImage(couple4, sidePadding, currentY)
      } else {
        // 격자 배치 (2x2)
        const startY = topPadding
        // 상단 행
        ctx.drawImage(couple1, sidePadding, startY)
        ctx.drawImage(couple2, sidePadding + couple1.width + gap, startY)
        // 하단 행
        ctx.drawImage(couple3, sidePadding, startY + couple1.height + gap)
        ctx.drawImage(couple4, sidePadding + couple3.width + gap, startY + couple3.height + gap)
      }

      // 하단 텍스트 그리기
      if (bottomText.trim()) {
        ctx.save()
        ctx.fillStyle = frameColor === '#000000' ? '#ffffff' : '#000000'
        const selectedFont = fontOptions.find(f => f.value === fontFamily)
        
        // 폰트 설정 강화
        ctx.font = `${fontSize}px ${selectedFont?.family || 'Arial, sans-serif'}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        let bottomTextY
        if (layout === '4x1') {
          bottomTextY = topPadding + (couple1.height * 4) + (gap * 3) + (bottomPadding / 2) + (fontSize / 2)
        } else {
          bottomTextY = topPadding + (couple1.height * 2) + gap + (bottomPadding / 2) + (fontSize / 2)
        }
        
        // 텍스트 윤곽선 추가 (가독성 향상)
        ctx.strokeStyle = frameColor === '#000000' ? '#ffffff' : '#000000'
        ctx.lineWidth = 3
        ctx.strokeText(bottomText, canvas.width / 2, bottomTextY)
        ctx.fillText(bottomText, canvas.width / 2, bottomTextY)
        ctx.restore()
      }

      console.log('MZ4C generation completed successfully')
    } catch (error) {
      console.error('MZ4C 생성 중 오류:', error)
      // 오류 발생 시 기본 메시지 표시
      canvas.width = 640
      canvas.height = 1685
      ctx.fillStyle = frameColor
      ctx.fillRect(0, 0, 640, 1685)
      ctx.fillStyle = '#666666'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('이미지 생성 중 오류가 발생했습니다', 320, 842)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadMZ4C = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `네컷사진_${character1?.name || 'char1'}_${character2?.name || 'char2'}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  if (!character1 || !character2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>네컷사진 생성</CardTitle>
          <CardDescription>
            두 캐릭터를 모두 검색해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-12">
            두 캐릭터를 모두 검색하면 네컷사진 생성을 시작할 수 있습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>네컷사진 미리보기</CardTitle>
            <Button
              onClick={downloadMZ4C}
              disabled={isGenerating}
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
              style={{ maxHeight: '600px' }}
            />
          </div>
          {isGenerating && (
            <div className="text-center mt-4 text-purple-600">
              네컷사진 생성 중...
            </div>
          )}
        </CardContent>
      </Card>

      {/* 프레임 커스터마이징 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🎨</span>
            프레임 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 프레임 색상 */}
          <div>
            <label className="block text-sm font-medium mb-2">프레임 색상</label>
            <div className="flex gap-2 items-center flex-wrap">
              {BACKGROUND_COLORS.slice(0, 8).map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFrameColor(color.value)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    frameColor === color.value
                      ? 'border-purple-500 ring-1 ring-purple-300'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color.preview }}
                  title={color.label}
                />
              ))}
              {/* 검은색 추가 */}
              <button
                onClick={() => setFrameColor('#000000')}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  frameColor === '#000000'
                    ? 'border-purple-500 ring-1 ring-purple-300'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: '#000000' }}
                title="검은색"
              />
              <input
                type="color"
                value={frameColor}
                onChange={(e) => setFrameColor(e.target.value)}
                className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                title="사용자 정의 색상"
              />
            </div>
          </div>

          {/* 여백 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">상단 여백: {topPadding}px</label>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={topPadding}
                onChange={(e) => setTopPadding(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">하단 여백: {bottomPadding}px</label>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={bottomPadding}
                onChange={(e) => setBottomPadding(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* 폰트 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">폰트</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">글씨 크기: {fontSize}px</label>
              <input
                type="range"
                min="16"
                max="48"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* 레이아웃 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">이미지 배치 방법</label>
            <div className="flex gap-2">
              <button
                onClick={() => setLayout('4x1')}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  layout === '4x1'
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                4x1 세로배치
              </button>
              <button
                onClick={() => setLayout('2x2')}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  layout === '2x2'
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                2x2 격자배치
              </button>
            </div>
          </div>

          {/* 이모지 추천 */}
          <div>
            <label className="block text-sm font-medium mb-2">귀여운 이모지 클립보드 복사</label>
            <div className="grid grid-cols-10 gap-1 p-2 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
              {cuteEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(emoji)}
                  className="w-8 h-8 text-lg hover:bg-gray-200 rounded transition-colors flex items-center justify-center"
                  title={`클릭하면 클립보드에 복사됩니다`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 이모지를 클릭하면 클립보드에 복사되어 텍스트 필드에 붙여넣기 할 수 있습니다
            </p>
          </div>

          {/* 텍스트 입력 */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">상단 문구</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="상단에 표시할 문구를 입력하세요"
                  className="flex-1 p-2 border border-gray-300 rounded-md bg-white text-sm"
                  maxLength={30}
                />
                <button
                  onClick={() => setTopText('')}
                  className="px-3 py-2 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  지우기
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">하단 문구</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="하단에 표시할 문구를 입력하세요"
                  className="flex-1 p-2 border border-gray-300 rounded-md bg-white text-sm"
                  maxLength={30}
                />
                <button
                  onClick={() => setBottomText('')}
                  className="px-3 py-2 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  지우기
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4장 각각의 커스터마이징 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🖼️</span>
            사진별 커스터마이징
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {frameSettings.map((settings, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-sm">{index + 1}번째 사진</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newSettings = [...frameSettings]
                      newSettings[index] = {
                        char1Emotion: getRandomEmotion(),
                        char2Emotion: getRandomEmotion(),
                        backgroundColor: getRandomColor(),
                        isChar1OnTop: Math.random() > 0.5
                      }
                      setFrameSettings(newSettings)
                    }}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    랜덤
                  </Button>
                </div>

                {/* 배경색 */}
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">배경색</label>
                  <div className="flex gap-1 items-center flex-wrap">
                    {BACKGROUND_COLORS.slice(0, 6).map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          const newSettings = [...frameSettings]
                          newSettings[index].backgroundColor = color.value
                          setFrameSettings(newSettings)
                        }}
                        className={`w-5 h-5 rounded border transition-all ${
                          settings.backgroundColor === color.value
                            ? 'border-purple-500 ring-1 ring-purple-300'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color.preview }}
                        title={color.label}
                      />
                    ))}
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => {
                        const newSettings = [...frameSettings]
                        newSettings[index].backgroundColor = e.target.value
                        setFrameSettings(newSettings)
                      }}
                      className="w-5 h-5 rounded border border-gray-300 cursor-pointer"
                      title="사용자 정의 색상"
                    />
                  </div>
                </div>

                {/* 겹치기 순서 */}
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">겹치기 순서</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newSettings = [...frameSettings]
                      newSettings[index].isChar1OnTop = !newSettings[index].isChar1OnTop
                      setFrameSettings(newSettings)
                    }}
                    className="text-xs h-8 px-2"
                  >
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    {settings.isChar1OnTop ? `${character1.name} 위` : `${character2.name} 위`}
                  </Button>
                </div>

                {/* 표정 설정 */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">{character1.name} 표정</label>
                    <div className="flex gap-1 flex-wrap">
                      {EMOTIONS.slice(0, 6).map((emotion) => (
                        <button
                          key={emotion.value}
                          onClick={() => {
                            const newSettings = [...frameSettings]
                            newSettings[index].char1Emotion = emotion.value
                            setFrameSettings(newSettings)
                          }}
                          className={`px-1.5 py-0.5 text-xs rounded border transition-all ${
                            settings.char1Emotion === emotion.value 
                              ? 'bg-purple-500 text-white border-purple-500' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                          title={emotion.label}
                        >
                          {emotion.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">{character2.name} 표정</label>
                    <div className="flex gap-1 flex-wrap">
                      {EMOTIONS.slice(0, 6).map((emotion) => (
                        <button
                          key={emotion.value}
                          onClick={() => {
                            const newSettings = [...frameSettings]
                            newSettings[index].char2Emotion = emotion.value
                            setFrameSettings(newSettings)
                          }}
                          className={`px-1.5 py-0.5 text-xs rounded border transition-all ${
                            settings.char2Emotion === emotion.value 
                              ? 'bg-purple-500 text-white border-purple-500' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                          title={emotion.label}
                        >
                          {emotion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}