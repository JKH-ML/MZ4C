'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { maplestorycAPI, type CharacterData, type CharacterHistoryData } from '@/lib/maplestory-api'
import { Loader2, Calendar, History } from 'lucide-react'

interface CharacterHistoryProps {
  nickname: string
  onDateSelect: (historyData: CharacterHistoryData) => void
  selectedDate?: string
}

export function CharacterHistory({ nickname, onDateSelect, selectedDate }: CharacterHistoryProps) {
  const [historyData, setHistoryData] = useState<CharacterHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchComplete, setSearchComplete] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const searchCharacterHistory = async () => {
    const currentNickname = nickname?.trim()
    if (!currentNickname) {
      return
    }

    setIsLoading(true)
    setIsSearching(true)
    setError(null)
    setHistoryData([])
    setSearchComplete(false)
    setIsExpanded(true)
    
    abortControllerRef.current = new AbortController()

    try {
      await maplestorycAPI.getCharacterHistoryRange(
        currentNickname,
        (data: CharacterHistoryData) => {
          if (!abortControllerRef.current?.signal.aborted) {
            // 검색된 캐릭터 데이터의 닉네임을 현재 입력된 닉네임으로 고정
            const fixedData = {
              ...data,
              characterData: {
                ...data.characterData,
                name: currentNickname
              }
            }
            setHistoryData(prev => [...prev, fixedData])
          }
        }
      )
      setSearchComplete(true)
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const stopSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const handleSearchClick = () => {
    if (isSearching) {
      stopSearch()
    } else {
      searchCharacterHistory()
    }
  }

  const handleDateClick = (data: CharacterHistoryData) => {
    onDateSelect(data)
  }

  // 닉네임이 변경되면 히스토리 초기화
  useEffect(() => {
    setHistoryData([])
    setSearchComplete(false)
    setError(null)
    setIsExpanded(false)
    setIsLoading(false)
    setIsSearching(false)
  }, [nickname])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <History className="h-5 w-5 mr-2" />
                캐릭터 외형 히스토리
              </CardTitle>
              <CardDescription>
                날짜별 외형 변화를 확인하고 선택하세요
              </CardDescription>
            </div>
            <Button
              onClick={handleSearchClick}
              disabled={!nickname.trim()}
              variant={isSearching ? "outline" : "default"}
              size="sm"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  중지
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  검색
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {isSearching && (
              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md mb-4">
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  검색 중... ({historyData.length}개 발견)
                </div>
              </div>
            )}

            {searchComplete && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md mb-4">
                검색 완료! 총 {historyData.length}개의 서로 다른 외형을 발견했습니다.
              </div>
            )}

            {historyData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-3">
                {historyData.map((data, index) => (
                  <Card 
                    key={`${data.date}-${index}`} 
                    className={`overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                      selectedDate === data.date ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => handleDateClick(data)}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden border-2 border-gray-300">
                        <img
                          src={`${data.characterData.baseImageUrl}?action=A00&emotion=E00&wmotion=W00&width=300&height=400`}
                          alt={`${data.characterData.name} - ${data.date}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            objectPosition: 'center',
                            transform: 'scale(2.5) translateY(-5px)',
                            clipPath: 'inset(35% 35% 31% 35%)'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = data.characterData.baseImageUrl
                          }}
                        />
                      </div>
                      <div className="p-1">
                        <p className="text-xs text-center text-gray-600">
                          {data.date.slice(5)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}