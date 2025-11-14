import{createI18n} from 'vue-i18n';

const messages = {
    ko: {
        brand: {
            name: 'silkRoad',
        },
        header: {
            routes: '경로추천',
            board: '게시판',
            mypage: '마이페이지',
            login: '로그인',
            signup: '회원가입',
            language: '언어',
            langNames: {
                ko: '한국어',
                en: 'English',
                ja: '日本語',
            },
        },
        hero: {
            title: '실크로드를 따라가는 여행',
            subtitle: '고대 무역로를 따라 펼쳐지는 당신만의 여행 경로를 찾아보세요',
            searchPlaceholder: '목적지를 검색해보세요...',
            categories: {
                camelTour: '낙타 투어',
                desertTrip: '사막 여행',
                culture: '문화 탐방',
                mountain: '산악 루트',
            },
        },
        popular: {
            title: '인기 경로',
            subtitle: '많은 여행자들이 선택한 추천 루트',
            tags: {
                desert: '사막',
                history: '역사',
                culture: '문화',
                city: '도시',
                trekking: '트레킹',
                view: '전망',
            },
            routes: [
                {
                    id: 1,
                    title: '서안 - 둔황 고전 루트',
                    desc: '실크로드의 가장 상징적인 구간을 따라가는 7일 일정',
                    days: '7일',
                    people: '인원 12명',
                    level: '중급',
                    tags: ['사막', '역사', '문화'],
                },
                {
                    id: 2,
                    title: '사마르칸트 블루시티 투어',
                    desc: '중앙아시아의 보석, 사마르칸트의 푸른 건축물을 탐방',
                    days: '5일',
                    people: '인원 8명',
                    level: '초급',
                    tags: ['문화', '도시'],
                },
                {
                    id: 3,
                    title: '파미르 고원 트레킹',
                    desc: '세계의 지붕을 걷는 모험적인 트레킹 코스',
                    days: '10일',
                    people: '인원 6명',
                    level: '고급',
                    tags: ['산악', '트레킹', '전망'],
                },
            ],
        },
        common: {
            days: '일정',
            people: '인원',
            level: '난이도',
            search: '검색',
        },
    },

    en: {
        brand: { name: 'silkRoad' },
        header: {
            routes: 'Routes',
            board: 'Community',
            mypage: 'My Page',
            login: 'Log in',
            signup: 'Sign up',
            language: 'Language',
            langNames: {
                ko: '한국어',
                en: 'English',
                ja: '日本語',
            },
        },
        hero: {
            title: 'Journey along the Silk Road',
            subtitle: 'Follow the ancient trade routes and discover your own travel path',
            searchPlaceholder: 'Search your destination...',
            categories: {
                camelTour: 'Camel tour',
                desertTrip: 'Desert trip',
                culture: 'Culture trip',
                mountain: 'Mountain route',
            },
        },
        popular: {
            title: 'Popular routes',
            subtitle: 'Recommended itineraries chosen by many travelers',
            tags: {
                desert: 'Desert',
                history: 'History',
                culture: 'Culture',
                city: 'City',
                trekking: 'Trekking',
                view: 'View',
            },
            routes: [], // 일단 비워두고 나중에 진짜 데이터 넣어도 됨
        },
        common: {
            days: 'Days',
            people: 'People',
            level: 'Level',
            search: 'Search',
        },
    },

    ja: {
        brand: { name: 'silkRoad' },
        header: {
            routes: '経路推薦',
            board: '掲示板',
            mypage: 'マイページ',
            login: 'ログイン',
            signup: '会員登録',
            language: '言語',
            langNames: {
                ko: '韓国語',
                en: 'English',
                ja: '日本語',
            },
        },
        hero: {
            title: 'シルクロードをたどる旅',
            subtitle: '古代の交易路に沿って、あなただけの旅のルートを見つけましょう',
            searchPlaceholder: '目的地を検索してください…',
            categories: {
                camelTour: 'ラクダツアー',
                desertTrip: '砂漠旅行',
                culture: '文化探訪',
                mountain: '山岳ルート',
            },
        },
        popular: {
            title: '人気ルート',
            subtitle: '多くの旅人に選ばれたおすすめコース',
            tags: {
                desert: '砂漠',
                history: '歴史',
                culture: '文化',
                city: '都市',
                trekking: 'トレッキング',
                view: '景観',
            },
            routes: [],
        },
        common: {
            days: '日程',
            people: '人数',
            level: '難易度',
            search: '検索',
        },
    },
};

export const i18n = createI18n({
    legacy: false,
    locale : 'ko',
    fallbackLocale : 'en',
    messages,
});