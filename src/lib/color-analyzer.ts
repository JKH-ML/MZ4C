/**
 * 이미지에서 색상을 분석하고 배경색을 추천하는 유틸리티
 */

export interface ColorAnalysisResult {
  dominantColors: string[]
  recommendedBackground: string
}

/**
 * Canvas에서 크롭 영역의 이미지 데이터를 분석하여 색상 추출
 */
export async function analyzeImageColors(
  imageUrl: string,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<ColorAnalysisResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // 크롭 영역 크기로 캔버스 설정
      canvas.width = cropArea.width
      canvas.height = cropArea.height
      
      // 크롭 영역만 그리기
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      )
      
      // 이미지 데이터 추출
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const colors = extractDominantColors(imageData)
      const recommendedBg = recommendBackgroundColor(colors)
      
      resolve({
        dominantColors: colors,
        recommendedBackground: recommendedBg
      })
    }
    
    img.onerror = () => reject(new Error('이미지 로드 실패'))
    img.src = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
  })
}

/**
 * ImageData에서 주요 색상들을 추출
 */
function extractDominantColors(imageData: ImageData): string[] {
  const data = imageData.data
  const colorMap: { [color: string]: number } = {}
  let totalPixels = 0
  let validPixels = 0
  
  console.log('이미지 데이터 크기:', imageData.width, 'x', imageData.height, '픽셀 수:', data.length / 4)
  
  // 픽셀 샘플링 (성능을 위해 매 4번째 픽셀만 검사)
  for (let i = 0; i < data.length; i += 16) {
    totalPixels++
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // 투명하거나 너무 밝은/어두운 픽셀 제외
    if (a < 128 || (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
      continue
    }
    
    validPixels++
    
    // 색상을 16진수로 변환
    const hex = rgbToHex(r, g, b)
    colorMap[hex] = (colorMap[hex] || 0) + 1
  }
  
  console.log(`총 픽셀: ${totalPixels}, 유효 픽셀: ${validPixels}, 고유 색상: ${Object.keys(colorMap).length}`)
  
  // 빈도수 순으로 정렬하여 상위 5개 색상 반환
  const dominantColors = Object.entries(colorMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([color]) => color)
    
  console.log('추출된 주요 색상:', dominantColors)
  return dominantColors
}

/**
 * RGB를 16진수로 변환
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * 랜덤 파스텔 배경색 추천
 */
function recommendBackgroundColor(dominantColors: string[]): string {
  // 예쁜 파스텔 색상들 배열
  const pastelColors = [
    '#fff5f5', // 연한 핑크
    '#f0f9ff', // 연한 하늘색
    '#f0fff4', // 연한 민트
    '#fffbf0', // 연한 노랑
    '#f5f0ff', // 연한 보라
    '#fff0f6', // 연한 로즈
    '#f0ffff', // 연한 청록
    '#fff5ee', // 연한 오렌지
    '#f9f0ff', // 연한 라벤더
    '#f0fff0', // 연한 연두
    '#fef7f0', // 연한 복숭아
    '#f0f8ff'  // 연한 앨리스 블루
  ]
  
  // 랜덤하게 파스텔 색상 선택
  const randomIndex = Math.floor(Math.random() * pastelColors.length)
  const selectedColor = pastelColors[randomIndex]
  
  console.log('랜덤 파스텔 배경색 선택:', selectedColor)
  return selectedColor
}

/**
 * 색상들의 평균 HSL 값 계산
 */
function getAverageHSL(colors: string[]): { h: number; s: number; l: number } {
  let totalH = 0, totalS = 0, totalL = 0
  
  colors.forEach(hex => {
    const hsl = hexToHSL(hex)
    totalH += hsl.h
    totalS += hsl.s
    totalL += hsl.l
  })
  
  return {
    h: totalH / colors.length,
    s: totalS / colors.length,
    l: totalL / colors.length
  }
}

/**
 * 16진수를 HSL로 변환
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 }
}

/**
 * HSL을 기반으로 파스텔 배경색 생성
 */
function generatePastelBackground({ h, s, l }: { h: number; s: number; l: number }): string {
  // 파스텔 톤으로 조정
  const pastelSaturation = Math.min(s * 0.3, 20) // 채도 낮춤
  const pastelLightness = Math.max(85, Math.min(95, l + 30)) // 밝기 높임
  
  // 보색 사용 (색상환에서 180도 회전)
  const complementaryHue = (h + 180) % 360
  
  return hslToHex(complementaryHue, pastelSaturation, pastelLightness)
}

/**
 * HSL을 16진수로 변환
 */
function hslToHex(h: number, s: number, l: number): string {
  const hNorm = h / 360
  const sNorm = s / 100
  const lNorm = l / 100
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1))
  const m = lNorm - c / 2
  
  let r = 0, g = 0, b = 0
  
  if (0 <= hNorm * 6 && hNorm * 6 < 1) {
    r = c; g = x; b = 0
  } else if (1 <= hNorm * 6 && hNorm * 6 < 2) {
    r = x; g = c; b = 0
  } else if (2 <= hNorm * 6 && hNorm * 6 < 3) {
    r = 0; g = c; b = x
  } else if (3 <= hNorm * 6 && hNorm * 6 < 4) {
    r = 0; g = x; b = c
  } else if (4 <= hNorm * 6 && hNorm * 6 < 5) {
    r = x; g = 0; b = c
  } else if (5 <= hNorm * 6 && hNorm * 6 < 6) {
    r = c; g = 0; b = x
  }
  
  const rVal = Math.round((r + m) * 255)
  const gVal = Math.round((g + m) * 255)
  const bVal = Math.round((b + m) * 255)
  
  return rgbToHex(rVal, gVal, bVal)
}