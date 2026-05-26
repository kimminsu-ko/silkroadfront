# SilkRoad Frontend

> 외국인 대상 국내 여행 리뷰 플랫폼의 프론트엔드 프로젝트입니다.

SilkRoad는 한국을 방문하는 외국인 관광객이 여행지 리뷰와 위치 정보를 더 쉽게 이해할 수 있도록 기획한 서비스입니다. 프론트엔드에서는 다국어 전환, API 응답 구조 정렬, 지도 주소 가독성 개선에 집중했습니다.

## My Role

- Frontend 개발
- Vue 기반 화면 구현
- Vue-i18n 기반 다국어 구조 설계
- 백엔드 API 응답 스펙 정리 및 데이터 매핑
- 외국인 사용자 관점의 지도 주소 표시 개선

## Tech Stack

| Area | Stack |
| --- | --- |
| Frontend | Vue 3, JavaScript, Vite |
| i18n | Vue-i18n, JSON Mapping |
| Map | Naver Map API |
| Styling | CSS |

## Key Work

### API 응답 구조 정렬

백엔드 응답 구조와 프론트에서 기대한 데이터 구조가 달라 일부 화면에서 렌더링 오류가 발생했습니다. 요청/응답 스펙을 문서화하고 필드 구조를 맞춰 데이터 가공 로직을 통일했습니다.

### i18n 번역 누락 개선

AI 영역에서 생성되는 세부 태그와 텍스트가 번역 매핑에 포함되지 않아 다국어 전환 시 누락이 발생했습니다. 기능 단위 JSON 매핑 구조를 만들고 번역 키 기반으로 관리하도록 정리했습니다.

### 지도 주소 가독성 개선

일부 지도 API에서 영어 주소 노출이 안정적이지 않아 외국인 사용자에게 필요한 정보가 충분히 전달되지 않았습니다. 다국어 지원 범위를 비교한 뒤 Naver Map API로 전환해 주소 가독성을 개선했습니다.

## Project Setup

```sh
npm install
```

### Development

```sh
npm run dev
```

### Production Build

```sh
npm run build
```

## Related Portfolio

이 프로젝트는 개인 포트폴리오의 `Projects` 섹션에 정리된 SilkRoad 경험을 기반으로 작성되었습니다.
