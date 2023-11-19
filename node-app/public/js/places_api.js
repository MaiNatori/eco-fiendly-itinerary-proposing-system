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

  infowindow = new google.maps.InfoWindow();  // div#map にGoogle Mapを挿入

  map = new google.maps.Map(document.getElementById('map'), {center: defaultPlace, zoom: 15});  // 中心点を指定の位置にして描画
}

/*
// findPlaceFromQuery を実行、ついでにgetPlaceDetailsを実行する
// 実行注意(従量課金) ひと月あたり1000リクエストまで無料
function doFindPlaceFromQuery (
  query = "SDGs 市ヶ谷 レストラン"  // 検索クエリ
) {
  const request = {
    query: query,
    fields: ['name', 'place_id'],  // 検索で取得するフィールド(情報)
    location: new google.maps.LatLng(35.6810603, 139.76730746),
    radius: "500"
  };
  const service = new google.maps.places.PlacesService(map); // コンストラクト

  // 実行
  service.textSearch(request, (results, status) => {
    // 実行結果の処理
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // 結果 -> results ; 結果の配列
      for (let i = 0; i < results.length; i++) {
        console.log("results[", i, "]", results[i])
        getPlaceDetails(
          results[i].place_id,  // doFindPlaceFromQueryの結果からplace_idを取り出し
          function (itsPlace) { // コールバック; 詳細データを取得、結果は第1引数に渡す
            createMarker(itsPlace, (i === 0)); // Mapにピンさし, 0番目だけは中心に設定する
          }
        );
      }
    }
  });
}
*/

// Place Details を PlaceID によって実行し、コールバックを呼び出す
// コールバックは引数placeをとる
// 従量課金対象外

fetch("/")
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(data => console.log(data));

function getPlaceDetails (place_id = places_id, callback) {
  const request = {
    placeId: place_id,
    fields: ['types', 'name', 'icon', 'formatted_address', 'formatted_phone_number', 'business_status', 'opening_hours', 'url', 'website', 'geometry']  // 検索で取得するフィールド(情報)
  };
  
  service = new google.maps.places.PlacesService(map);
  // リクエスト実行
  service.getDetails(request, (place, status) => {
    // 結果取得
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      callback(place)
    }
  });

  /** メモ **
  * placeId: "ChIJf9HI5PWMGGARDtbKJKNm38I", fields: ['name', 'rating', 'formatted_phone_number', 'geometry']
  * この時、次のようなオブジェクトが帰ってきた

  {
    "formatted_phone_number": "03-3269-2911",
    "geometry": {
        "location": {
            "lat": 35.69446909999999,
            "lng": 139.7312741
        },
        "viewport": {
            "south": 35.69287586970849,
            "west": 139.7298783197085,
            "north": 35.69557383029149,
            "east": 139.7325762802915
        }
    },
    "name": "食のゾーン J’s Cafe（JICA 国際協力機構研究所 内 民間利用可）",
    "rating": 4.1,
    "html_attributions": []
  }

 */
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
    infowindow.setContent(place.name || "");
    infowindow.open(map);
  });

  if (doItCenter) map.setCenter(place.geometry.location); // Trueのとき、それを中心にセット
}