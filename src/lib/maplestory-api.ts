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

export interface CashItemEquipment {
  date_lookup: string
  character_gender: string
  character_class: string
  preset_no: number
  cash_item_equipment_base: CashItemEquipmentBase[]
  cash_item_equipment_preset_1: CashItemEquipmentBase[]
  cash_item_equipment_preset_2: CashItemEquipmentBase[]
  cash_item_equipment_preset_3: CashItemEquipmentBase[]
  additional_cash_item_equipment_base: CashItemEquipmentBase[]
  additional_cash_item_equipment_preset_1: CashItemEquipmentBase[]
  additional_cash_item_equipment_preset_2: CashItemEquipmentBase[]
  additional_cash_item_equipment_preset_3: CashItemEquipmentBase[]
}

export interface CashItemEquipmentBase {
  cash_item_equipment_part: string
  cash_item_equipment_slot: string
  cash_item_name: string
  cash_item_icon: string
  cash_item_description: string
  cash_item_option: CashItemOption[]
  date_expire: string | null
  date_option_expire: string | null
  cash_item_label: string | null
  cash_item_coloring_prism: CashItemColoringPrism | null
  item_gender: string | null
}

export interface CashItemOption {
  option_type: string
  option_value: string
}

export interface CashItemColoringPrism {
  color_range: string
  hue: number
  saturation: number
  value: number
}

export interface CharacterHistoryData {
  date: string
  characterData: CharacterData
  cashItemEquipment: CashItemEquipment
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

  async getCharacterBasicInfo(ocid: string, date?: string): Promise<CharacterBasicInfo> {
    let url = `${API_BASE_URL}/character/basic?ocid=${ocid}`
    if (date) {
      url += `&date=${date}`
    }

    const response = await fetch(url, { headers: this.headers })

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
          x: 120,
          y: 127,
          width: 50,
          height: 50
        }
      }
    } catch (error) {
      console.error('캐릭터 검색 중 오류:', error)
      throw error
    }
  }

  async searchCharacterWithDate(
    nickname: string,
    date?: string,
    action: string = 'A00',
    emotion: string = 'E00',
    wmotion: string = 'W00'
  ): Promise<CharacterData> {
    try {
      const ocid = await this.getCharacterOcid(nickname)
      const basicInfo = await this.getCharacterBasicInfo(ocid, date)

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
          x: 120,
          y: 127,
          width: 50,
          height: 50
        }
      }
    } catch (error) {
      console.error('캐릭터 검색 중 오류:', error)
      throw error
    }
  }

  async getCashItemEquipment(ocid: string, date?: string): Promise<CashItemEquipment> {
    let url = `${API_BASE_URL}/character/cashitem-equipment?ocid=${ocid}`
    if (date) {
      url += `&date=${date}`
    }

    const response = await fetch(url, { headers: this.headers })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`캐시 장비 API 오류 (${date}):`, response.status, errorText)
      throw new Error(`캐시 장비 정보를 불러오는데 실패했습니다. (${response.status})`)
    }

    const data = await response.json()
    return data
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

  async getCharacterHistoryRange(
    nickname: string,
    onProgress: (data: CharacterHistoryData) => void
  ): Promise<CharacterHistoryData[]> {
    const results: CharacterHistoryData[] = []
    let lastCashItemHash: string | null = null
    
    try {
      const ocid = await this.getCharacterOcid(nickname)
      
      // 어제부터 2025-01-17까지
      const startDate = new Date('2025-01-17')
      const endDate = new Date()
      endDate.setDate(endDate.getDate() - 1) // 어제
      
      for (let date = new Date(endDate); date >= startDate; date.setDate(date.getDate() - 1)) {
        const dateString = date.toISOString().split('T')[0]
        
        try {
          const [basicInfo, cashItemEquipment] = await Promise.all([
            this.getCharacterBasicInfo(ocid, dateString),
            this.getCashItemEquipment(ocid, dateString)
          ])

          const cashItemHash = JSON.stringify(cashItemEquipment.cash_item_equipment_base)
          
          // 중복 제거: 이전과 같은 캐시 장비면 스킵
          if (lastCashItemHash !== null && cashItemHash === lastCashItemHash) {
            continue
          }
          
          lastCashItemHash = cashItemHash

          const customUrl = `${basicInfo.character_image}?action=A00&emotion=E00&wmotion=W00&width=300&height=400`

          const characterData: CharacterData = {
            ocid,
            name: basicInfo.character_name,
            guild: basicInfo.character_guild_name || '',
            baseImageUrl: basicInfo.character_image,
            customUrl,
            action: 'A00',
            emotion: 'E00',
            wmotion: 'W00',
            flipX: false,
            x: 0,
            y: 0,
            showName: true,
            showGuild: true,
            size: 800,
            cropArea: {
              x: 120,
              y: 127,
              width: 50,
              height: 50
            }
          }

          const historyData: CharacterHistoryData = {
            date: dateString,
            characterData,
            cashItemEquipment
          }

          results.push(historyData)
          onProgress(historyData)

          // 최대 20개까지만 수집 (너무 많으면 UI가 복잡해짐)
          if (results.length >= 20) {
            break
          }

        } catch (error) {
          // 해당 날짜에 데이터가 없으면 스킵
          continue
        }

        // API 레이트 리밋 고려하여 짧은 지연
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
    } catch (error) {
      console.error('캐릭터 히스토리 검색 중 오류:', error)
      throw error
    }

    return results
  }
}

export const maplestorycAPI = new MapleStoryAPI()