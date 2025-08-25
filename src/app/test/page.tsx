'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { maplestorycAPI, type CharacterHistoryData } from '@/lib/maplestory-api'
import { Loader2, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function TestPage() {
  const [nickname, setNickname] = useState('')
  const [historyData, setHistoryData] = useState<CharacterHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchComplete, setSearchComplete] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const searchCharacterHistory = async () => {
    if (!nickname.trim()) {
      setError('캐릭터 닉네임을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setIsSearching(true)
    setError(null)
    setHistoryData([])
    setSearchComplete(false)
    
    abortControllerRef.current = new AbortController()

    try {
      await maplestorycAPI.getCharacterHistoryRange(
        nickname.trim(),
        (data: CharacterHistoryData) => {
          if (!abortControllerRef.current?.signal.aborted) {
            setHistoryData(prev => [...prev, data])
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSearching) {
      stopSearch()
    } else {
      searchCharacterHistory()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div className="text-left">
              <Link href="/">
                <h1 className="text-4xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors">
                  메짤네컷
                </h1>
              </Link>
              <p className="text-gray-600 mt-2">날짜별 캐릭터 외형 테스트</p>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>캐릭터 외형 히스토리 검색</CardTitle>
              <CardDescription>
                실시간부터 2025년 1월 17일까지의 캐릭터 외형 변화를 검색합니다. 
                (캐시 장비가 동일한 연속 날짜는 제외)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">캐릭터 닉네임</label>
                  <Input
                    type="text"
                    placeholder="닉네임 입력"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={isSearching}
                    className="bg-white"
                    maxLength={6}
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={!nickname.trim()}
                  className={`w-full ${isSearching ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      검색 중지
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      히스토리 검색 시작
                    </>
                  )}
                </Button>
              </form>

              {error && (
                <div className="mt-4 text-sm text-red-500 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {isSearching && (
                <div className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    검색 중... ({historyData.length}개 결과 발견)
                  </div>
                </div>
              )}

              {searchComplete && (
                <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  검색 완료! 총 {historyData.length}개의 서로 다른 외형을 발견했습니다.
                </div>
              )}
            </CardContent>
          </Card>

          {historyData.length > 0 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>캐릭터 외형 히스토리</CardTitle>
                  <CardDescription>
                    {historyData[0]?.characterData.name}의 외형 변화 기록 ({historyData.length}건)
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-3">
                {historyData.map((data, index) => (
                  <Card key={`${data.date}-${index}`} className="overflow-hidden">
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
            </div>
          )}
        </div>
      </main>
    </div>
  )
}