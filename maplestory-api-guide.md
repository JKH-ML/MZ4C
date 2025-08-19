# 메이플스토리 API 사용 가이드

## 개요
이 프로젝트에서는 Nexon의 메이플스토리 OpenAPI를 사용하여 캐릭터 정보를 조회하고 캐릭터 이미지를 동적으로 생성하는 기능을 구현했습니다.

## API 설정

### 1. API 키 설정
`.env.local` 파일에 Nexon API 키를 설정해야 합니다:

```env
NEXT_PUBLIC_NEXON_API_KEY=your_nexon_api_key_here
```

### 2. API 엔드포인트
메이플스토리 API의 베이스 URL:
```
https://open.api.nexon.com/maplestory/v1/
```

## 캐릭터 검색 및 정보 조회 방법

### 1. 캐릭터 ID(OCID) 조회
먼저 캐릭터 닉네임으로 OCID를 조회합니다:

```javascript
const headers = {
  "x-nxopen-api-key": process.env.NEXT_PUBLIC_NEXON_API_KEY!,
};

const resId = await fetch(
  `https://open.api.nexon.com/maplestory/v1/id?character_name=${encodeURIComponent(nickname)}`,
  { headers }
);
const dataId = await resId.json();
const ocid = dataId.ocid;
```

### 2. 캐릭터 기본 정보 조회
OCID를 사용하여 캐릭터의 기본 정보를 조회합니다:

```javascript
const resBasic = await fetch(
  `https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}`,
  { headers }
);
const dataBasic = await resBasic.json();
```

### 3. 응답 데이터 구조
캐릭터 기본 정보 응답에는 다음과 같은 데이터가 포함됩니다:
- `character_name`: 캐릭터 이름
- `character_guild_name`: 길드 이름
- `character_image`: 캐릭터 이미지 기본 URL

## 캐릭터 이미지 커스터마이징

### 이미지 URL 구성
캐릭터 이미지는 다음과 같은 쿼리 파라미터를 사용하여 커스터마이징할 수 있습니다:

```javascript
const customUrl = `${baseImageUrl}?action=${action}&emotion=${emotion}&wmotion=${wmotion}&width=300&height=400`;
```

### 파라미터 설명

#### 1. Action (자세)
- `A00`: 기본 서기
- `A01`: 걷기
- `A02`: 점프
- 기타 액션 코드들...

#### 2. Emotion (표정)
- `E00`: 기본 표정
- `E01`: 웃음
- `E02`: 찡그림
- 기타 감정 코드들...

#### 3. Wmotion (무기 모션)
- `W00`: 기본 무기 모션
- `W01`: 한손검
- `W02`: 활
- 기타 무기 모션 코드들...

### 동적 이미지 생성 예제

```javascript
const fetchCharacter = async () => {
  if (!nickname.trim()) return;

  try {
    const headers = {
      "x-nxopen-api-key": process.env.NEXT_PUBLIC_NEXON_API_KEY!,
    };

    // 1. 캐릭터 ID 조회
    const resId = await fetch(
      `https://open.api.nexon.com/maplestory/v1/id?character_name=${encodeURIComponent(nickname)}`,
      { headers }
    );
    const dataId = await resId.json();
    const ocid = dataId.ocid;
    
    if (!ocid) {
      alert("캐릭터를 찾을 수 없습니다.");
      return;
    }

    // 2. 캐릭터 기본 정보 조회
    const resBasic = await fetch(
      `https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}`,
      { headers }
    );
    const dataBasic = await resBasic.json();

    // 3. 커스텀 이미지 URL 생성
    const baseUrl = dataBasic.character_image;
    const customUrl = `${baseUrl}?action=${action}&emotion=${emotion}&wmotion=${wmotion}&width=300&height=400`;

    // 4. 캐릭터 데이터 저장
    setChar({
      baseImageUrl: baseUrl,
      customUrl,
      action,
      emotion,
      wmotion,
      flipX: defaultFlipX,
      x: defaultX,
      y: defaultY,
      name: dataBasic.character_name,
      guild: dataBasic.character_guild_name || "",
      showName: true,
      showGuild: true,
      size: 800,
    });
  } catch (err) {
    console.error(err);
    alert("캐릭터 정보를 불러오는데 실패했습니다.");
  }
};
```

## 구현된 기능

### 1. 캐릭터 검색
- 닉네임 입력으로 캐릭터 검색
- Enter 키 또는 검색 버튼으로 검색 실행

### 2. 캐릭터 커스터마이징
- 자세, 표정, 무기 모션 변경
- 캐릭터 크기 조정
- 좌우 반전 기능
- 닉네임/길드명 표시 토글

### 3. 애니메이션 기능
- 움짤 모드 지원
- 프레임 속도 조정
- 액션별 애니메이션 패턴 구현

### 4. GIF 생성
- 멀티 캐릭터 GIF 생성
- 캔버스를 사용한 이미지 합성
- 배경색 커스터마이징
