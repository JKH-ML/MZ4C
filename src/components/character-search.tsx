'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { maplestorycAPI, type CharacterData } from '@/lib/maplestory-api'

interface CharacterSearchProps {
  onCharacterSelect: (character: CharacterData) => void
}

export function CharacterSearch({ onCharacterSelect }: CharacterSearchProps) {
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchCharacter = async () => {
    if (!nickname.trim()) {
      setError('캐릭터 닉네임을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const character = await maplestorycAPI.searchCharacter(nickname.trim())
      onCharacterSelect(character)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchCharacter()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchCharacter()
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="bg-white"
            maxLength={6}
          />
          <Button
            type="submit"
            disabled={isLoading || !nickname.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}