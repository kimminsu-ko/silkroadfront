// src/utils/loadNaverMap.js
let loadedLang = null;
let loadingPromise = null;


export function loadNaverMap(lang = "ko") {
    const targetLang = lang || "ko";

    // 이미 해당 언어로 로딩 완료된 경우
    if (window.naver && window.naver.maps && loadedLang === targetLang) {
        return Promise.resolve(window.naver);
    }

    // 이미 같은 언어로 로딩 중이면 그 Promise 재사용
    if (loadingPromise && loadedLang === targetLang) {
        return loadingPromise;
    }

    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) {
        return Promise.reject(new Error("VITE_NAVER_CLIENT_ID가 비어 있음"));
    }

    // 🔥 다른 언어로 기존 SDK가 로드된 상태라면 제거
    const existingScript = document.getElementById("naver-maps-script");
    if (existingScript) {
        existingScript.remove();
    }

    // 네이버 SDK 전역 초기화
    // (완전 깔끔하게 하려면 delete가 더 낫지만, 브라우저마다 미묘해서 이렇게 처리)
    window.naver = undefined;

    const script = document.createElement("script");
    script.id = "naver-maps-script";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&language=${targetLang}`;
    script.async = true;
    script.defer = true;

    loadingPromise = new Promise((resolve, reject) => {
        script.onload = () => {
            if (window.naver && window.naver.maps) {
                loadedLang = targetLang;
                resolve(window.naver);
            } else {
                reject(new Error("네이버 지도 로드는 됐는데 naver.maps가 없음"));
            }
        };

        script.onerror = () => {
            reject(new Error("네이버 지도 스크립트 로드 실패"));
        };
    });

    window.navermap_authFailure = function () {
        console.error("네이버 지도 인증 실패(navermap_authFailure 호출)");
    };

    document.head.appendChild(script);

    return loadingPromise;
}
