'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { maplestorycAPI, type CharacterData } from '@/lib/maplestory-api'

interface CoupleCharacterSearchProps {
  onCharacterSelect: (character1: CharacterData, character2: CharacterData) => void
  defaultNickname1?: string
  defaultNickname2?: string
}

export function CoupleCharacterSearch({ onCharacterSelect, defaultNickname1, defaultNickname2 }: CoupleCharacterSearchProps) {
  const [nickname1, setNickname1] = useState(defaultNickname1 || '')
  const [nickname2, setNickname2] = useState(defaultNickname2 || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchCharacters = async () => {
    if (!nickname1.trim() || !nickname2.trim()) {
      setError('두 캐릭터의 닉네임을 모두 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [character1, character2] = await Promise.all([
        maplestorycAPI.searchCharacter(nickname1.trim()),
        maplestorycAPI.searchCharacter(nickname2.trim())
      ])
      onCharacterSelect(character1, character2)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchCharacters()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5" />
          커플 캐릭터 검색
        </CardTitle>
        <CardDescription>
          두 캐릭터의 닉네임을 입력하여 커플 짤을 만들어보세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                캐릭터 1
              </label>
              <Input
                type="text"
                placeholder="첫 번째 캐릭터"
                value={nickname1}
                onChange={(e) => setNickname1(e.target.value)}
                disabled={isLoading}
                className="bg-white text-sm"
                maxLength={6}
              />
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                캐릭터 2
              </label>
              <Input
                type="text"
                placeholder="두 번째 캐릭터"
                value={nickname2}
                onChange={(e) => setNickname2(e.target.value)}
                disabled={isLoading}
                className="bg-white text-sm"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !nickname1.trim() || !nickname2.trim()}
              size="sm"
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}