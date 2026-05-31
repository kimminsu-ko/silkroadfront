// 기본 설정값

export const defaultMapConfig = {
    mapTypeControl: true,

    // 인터랙션
    draggable: true,
    pinchZoom: true,
    scrollWheel: true,
    keyboardShortcuts: true,
    doubleTapZoom: true,
    doubleClickZoom: true,
    twoFingerTapZoom: true,

    // 관성 드래그
    kineticPan: true,

    // 타일 fade-in
    tileTransition: true,

    // 줌 레벨
    minZoom: 7,
    maxZoom: 21,

    // 기타 컨트롤
    scaleControl: true,
    logoControl: true,
    mapDataControl: true,
    zoomControl: true,
};

// 실제 지도 인스턴스에 옵션 적용
export function applyMapOptions(mapInstance, config = defaultMapConfig) {
    if (!mapInstance) return;

    mapInstance.setOptions({
        // 인터랙션
        draggable: config.draggable,
        pinchZoom: config.pinchZoom,
        scrollWheel: config.scrollWheel,
        keyboardShortcuts: config.keyboardShortcuts,
        disableDoubleTapZoom: !config.doubleTapZoom,
        disableDoubleClickZoom: !config.doubleClickZoom,
        disableTwoFingerTapZoom: !config.twoFingerTapZoom,

        // 관성 드래그
        disableKineticPan: !config.kineticPan,

        // 타일 fade-in
        tileTransition: config.tileTransition,

        // 줌 레벨
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,

        // 컨트롤
        scaleControl: config.scaleControl,
        logoControl: config.logoControl,
        mapDataControl: config.mapDataControl,
        zoomControl: config.zoomControl,
        mapTypeControl: config.mapTypeControl,
    });
}
