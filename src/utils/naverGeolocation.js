/*
* @param {naver.maps.Map} mapInstance - 네이버 지도 인스턴스
* @param {typeof naver} naverMaps - loadNaverMap()로 받은 naver 객체
* @param {Object} options
* @param {number} options.zoomOnSuccess - 현재 위치로 이동 시 줌 레벨
*/
export function initGeolocationOnMap(mapInstance, naverMaps, options = {}) {
    if (!mapInstance || !naverMaps) return;

    const { zoomOnSuccess = 10 } = options;

    const infoWindow = new naverMaps.maps.InfoWindow();

    function onSuccessGeolocation(position) {
        const location = new naverMaps.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
        );

        // 위치로 이동 + 줌
        mapInstance.setCenter(location);
        mapInstance.setZoom(zoomOnSuccess);

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        infoWindow.setContent(
            `
              <div style="padding:12px;">
                <b>현재 위치</b><br/>
                위도: ${lat.toFixed(6)}<br/>
                경도: ${lng.toFixed(6)}
              </div>
            `
        );
        infoWindow.open(mapInstance, location);

        console.log("Coordinates:", location.toString());
    }

    function onErrorGeolocation(error) {
        const center = mapInstance.getCenter();

        infoWindow.setContent(
            '<div style="padding:20px;">' +
            '<h5 style="margin-bottom:5px;color:#f00;">Geolocation failed!</h5>' +
            "latitude: " +
            center.lat() +
            "<br />longitude: " +
            center.lng() +
            "</div>"
        );
        infoWindow.open(mapInstance, center);

        console.error("Geolocation error:", error);
    }

    if (navigator.geolocation) {
        // 실제 서비스: https:// 또는 http://localhost 에서만 정상 동작
        navigator.geolocation.getCurrentPosition(
            onSuccessGeolocation,
            onErrorGeolocation
        );
    } else {
        const center = mapInstance.getCenter();
        infoWindow.setContent(
            '<div style="padding:20px;">' +
            '<h5 style="margin-bottom:5px;color:#f00;">Geolocation not supported</h5>' +
            "</div>"
        );
        infoWindow.open(mapInstance, center);
    }
}