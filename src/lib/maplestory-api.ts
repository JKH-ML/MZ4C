export interface CharacterBasicInfo {
  character_name: string
  character_guild_name: string | null
  character_image: string
}

export interface CharacterData {
  ocid: string
  name: string
  guild: string
  baseImageUrl: string
  customUrl: string
  action: string
  emotion: string
  wmotion: string
  flipX: boolean
  x: number
  y: number
  showName: boolean
  showGuild: boolean
  size: number
  cropArea: {
    x: number
    y: number
    width: number
    height: number
  }
}

const API_BASE_URL = 'https://open.api.nexon.com/maplestory/v1'

export class MapleStoryAPI {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_NEXON_API_KEY!
    if (!this.apiKey) {
      throw new Error('NEXON API 키가 설정되지 않았습니다.')
    }
  }

  private get headers() {
    return {
      'x-nxopen-api-key': this.apiKey,
    }
  }

  async getCharacterOcid(characterName: string): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL}/id?character_name=${encodeURIComponent(characterName)}`,
      { headers: this.headers }
    )

    if (!response.ok) {
      throw new Error('캐릭터를 찾을 수 없습니다.')
    }

    const data = await response.json()
    if (!data.ocid) {
      throw new Error('캐릭터를 찾을 수 없습니다.')
    }

    return data.ocid
  }

  async getCharacterBasicInfo(ocid: string): Promise<CharacterBasicInfo> {
    const response = await fetch(
      `${API_BASE_URL}/character/basic?ocid=${ocid}`,
      { headers: this.headers }
    )

    if (!response.ok) {
      throw new Error('캐릭터 정보를 불러오는데 실패했습니다.')
    }

    const data = await response.json()
    return data
  }

  async searchCharacter(
    nickname: string,
    action: string = 'A00',
    emotion: string = 'E00',
    wmotion: string = 'W00'
  ): Promise<CharacterData> {
    try {
      const ocid = await this.getCharacterOcid(nickname)
      const basicInfo = await this.getCharacterBasicInfo(ocid)

      const customUrl = `${basicInfo.character_image}?action=${action}&emotion=${emotion}&wmotion=${wmotion}&width=300&height=400`

      return {
        ocid,
        name: basicInfo.character_name,
        guild: basicInfo.character_guild_name || '',
        baseImageUrl: basicInfo.character_image,
        customUrl,
        action,
        emotion,
        wmotion,
        flipX: false,
        x: 0,
        y: 0,
        showName: true,
        showGuild: true,
        size: 800,
        cropArea: {
          x: 115,
          y: 122,
          width: 60,
          height: 60
        }
      }
    } catch (error) {
      console.error('캐릭터 검색 중 오류:', error)
      throw error
    }
  }

  generateCustomImageUrl(
    baseUrl: string,
    options: {
      action?: string
      emotion?: string
      wmotion?: string
      width?: number
      height?: number
    } = {}
  ): string {
    const {
      action = 'A00',
      emotion = 'E00',
      wmotion = 'W00',
      width = 300,
      height = 400
    } = options

    return `${baseUrl}?action=${action}&emotion=${emotion}&wmotion=${wmotion}&width=${width}&height=${height}`
  }
}

export const maplestorycAPI = new MapleStoryAPI()