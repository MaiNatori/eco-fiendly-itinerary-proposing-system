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

// place_id配列を1つずつ取り出す関数
function placeIdsArray(place_id_array) {
  console.log("placeIdsArray: ", place_id_array)
  for (let i = 0; i < place_id_array.length; i++) {
    const placeid = place_id_array[i];
    getPlaceDetails(placeid, function (itsPlace) {
      // コールバック; 詳細データを取得、結果は第1引数に渡す
      createMarker(itsPlace, (i === 0)); // Mapにピンさし、0番目だけは中心に設定
    });
  }
}

// index_get.jsにアクセスしてplace_idを取得する
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
      placeIdsArray(data.places_id)
    });
}

// Place Details を PlaceID によって実行
function getPlaceDetails (places_id, callback) {
  const request = {
    language: "ja",
    placeId: places_id,
    fields: ['types','photos', 'name', 'formatted_address', 'formatted_phone_number', 'business_status', 'opening_hours', 'website', 'geometry']  // 検索で取得するフィールド(情報)
  }
  
  // リクエスト実行
  service.getDetails(request, (place, status) => {
    // 結果取得
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      callback(place);
    }
  });
}

// Google Map にピンをさす
function createMarker(place, doItCenter = false) {
  console.log("Markered place: ", place);

  if (!place.geometry || !place.geometry.location) return; // placeにlatおよびlngデータがあるか確認

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location, // latおよびlngデータ取り出し
  });

  google.maps.event.addListener(marker, "click", () => {
    const content = document.createElement("div");
    content.style.width = "300px";
    content.style.height = "100px";

    const nameElement = document.createElement("h2");
    nameElement.textContent = place.name;
    nameElement.style.fontSize = "20px";
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
    
    // index_get.jsにplace detailsを送信
    const sendData = {
      name: place.name,
      formattedAddress: place.formatted_address,
      website: place.website,
    };

    fetch("/sendDetails", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json();
      })
      .then(data => {
        console.log('Data sent successfully:', data);
      })   
  });

  if (doItCenter) map.setCenter(place.geometry.location); // Trueのとき、それを中心にセット

}


/*
・マップ下部にname、website(url)、formatted_address、photos Arrayの0番目のhtml_attributionsの欄の'<a href="https://maps.google.com/maps/contrib/111830602295026422485">TO THE HERBS 市ヶ谷店</a>'
から写真データを取得して、ピンをクリックしたらマップ下部の詳細欄に表示
・HPのURLをリンク有効にする
・追加ボタンを押したらマップ左側にクリックして表示してる場所の写真とnameを表示
・追加ボタンを押した場所の緯度経度(place.geometry.location)をnode.jsに送り保存
*/