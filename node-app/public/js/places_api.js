// 機能作成
let map;
let service;
let infowindow;

// Google Map HTML 初期化 (Maps JavaScript APIをロードしたときに自動で最初に呼び出される)
// default_center_lat, default_center_lngの位置を中心としたマップを表示する * 初期値は東京駅の座標
function initMap(
  default_center_lat = 35.6810603,    // 表示マップの初期位置 lat座標
  default_center_lng = 139.76730746   // 表示マップの初期位置 lng座標
) {
  const defaultPlace = new google.maps.LatLng(default_center_lat, default_center_lng);

  console.log(defaultPlace)

  infowindow = new google.maps.InfoWindow();

  map = new google.maps.Map(document.getElementById('maps'), {center: defaultPlace, zoom: 15});  // 中心点を指定の位置にして描画

  service = new google.maps.places.PlacesService(map);

  inqueryPlaceIds();

}

function doGet(place_id_array) {
  console.log("doGet: ", place_id_array)
  for (let i = 0; i < place_id_array.length; i++) {
    const placeid = place_id_array[i];
    getPlaceDetails(placeid, function (itsPlace) {
      // コールバック; 詳細データを取得、結果は第1引数に渡す
      createMarker(itsPlace, (i === 0)); // Mapにピンさし、0番目だけは中心に設定
    });
  }
}

function inqueryPlaceIds() {
  fetch("/interface")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      };
      return response.json();
    })
    .then(data => { // 戻り値 Object { places_id: ["id1", "id2", ...] }
      console.log(data.places_id)
      doGet(data.places_id)
    });
}

// Place Details を PlaceID によって実行し、コールバックを呼び出す
// コールバックは引数placeをとる
// 従量課金対象外
function getPlaceDetails (places_id, callback) {
  const request = {
    language: "ja",
    placeId: places_id,
    fields: ['types', 'name', 'formatted_address', 'formatted_phone_number', 'business_status', 'opening_hours', 'website', 'geometry']  // 検索で取得するフィールド(情報)
  }
  
  // リクエスト実行
  service.getDetails(request, (place, status) => {
    // 結果取得
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      callback(place)
    }
  });
}

// Google Map にピンをさす
// 引数 placeには、getPlaceDetailsで取得したplaceオブジェクトを入れる
// 引数 doItCenterは、そのピン位置を中心にしたいときにtrueを指定する
function createMarker(place, doItCenter = false) {
  console.log("Markered place: ", place);

  if (!place.geometry || !place.geometry.location) return; // placeにlatおよびlngデータがあるか確認

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location, // latおよびlngデータ取り出し
  });

  google.maps.event.addListener(marker, "click", () => {
    const content = document.createElement("div");

    const nameElement = document.createElement("h2");
    nameElement.textContent = place.name;
    content.appendChild(nameElement);

    const typesElement = document.createElement("p");
    typesElement.textContent = place.types;
    content.appendChild(typesElement);

    const placeAddressElement = document.createElement("p");
    placeAddressElement.textContent = place.formatted_address;
    content.appendChild(placeAddressElement);
    
    const phoneNumberElement = document.createElement("p");
    phoneNumberElement.textContent = place.formatted_phone_number;
    content.appendChild(phoneNumberElement);

    const openingHoursElement = document.createElement("div");
    place.opening_hours.weekday_text.forEach(day => {
      const dayElement = document.createElement("p");
      dayElement.textContent = day;
      openingHoursElement.appendChild(dayElement);
    });
    content.appendChild(openingHoursElement);

    const websiteElement = document.createElement("p");
    websiteElement.textContent = place.website;
    content.appendChild(websiteElement);

    infowindow.setContent(content);
    infowindow.open(map, marker);
  });

  if (doItCenter) map.setCenter(place.geometry.location); // Trueのとき、それを中心にセット
}
