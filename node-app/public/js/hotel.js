/*
・「地名 SDGs ホテル 宿」で検索してplace_idを取得
・place_idから以下の情報を取得
・fields: ['types','photos', 'name', 'formatted_address', 'website', 'geometry', 'place_id', 'price_level']  // 検索で取得するフィールド(情報)
・types == lodging(宿泊施設)
・表示する内容：ホテル名、金額帯、住所、HPのURL
・ホテル複数選択できるようにしてみようか
*/

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

// index.jsにアクセスしてplace_idを取得する
function inqueryPlaceIds() {
  fetch("/interfacehotels")
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

// place_id配列を1つずつ取り出す関数
function placeIdsArray(place_id_array) {
  console.log("placeIdsArray: ", place_id_array)
  for (let i = 0; i < place_id_array.length; i++) {
    const placeid = place_id_array[i];
    getPlaceDetails(placeid, function (itsPlace) {
      // コールバック; 詳細データを取得、結果は第1引数に渡す
      viewSearchResult(itsPlace);
    });
  }
}

// Place Details を PlaceID によって実行
function getPlaceDetails (places_id, callback) {
  const request = {
    language: "ja",
    placeId: places_id,
    fields: ['types','photos', 'icon', 'name','price_level', 'formatted_address', 'formatted_phone_number', 'website', 'geometry', 'place_id']  // 検索で取得するフィールド(情報)
  }
  
  // リクエスト実行
  service.getDetails(request, (place, status) => {
    // 結果取得
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      console.log(place);
      callback(place);
    }
  });
}

// 検索結果の表示
function viewSearchResult(place) { // place = getDetails result object
  const target = document.querySelector(".search-candidate"); // 表示先

  // 表示
  if (place.website !== undefined) {
    const div = document.createElement("div");
      div.classList.add("candidate-contents");
    const img = document.createElement("img");
      img.src = (place && place.photos && place.photos.length > 0) ? place.photos[0].getUrl() :
      (place && place.icon) ? place.icon : "/images/noimage_hotel.png";
      img.alt = "お店の画像";
    const h2 = document.createElement("h2");
      h2.innerText = place.name;
    const pPrice = document.createElement("p");
      pPrice.innerHTML = (place.price_level !== undefined) ? `価格帯: ${place.price_level}` : "価格帯：--";
    const pAddress = document.createElement("p");
      pAddress.innerHTML = (place.formatted_address !== undefined) ? `住所: ${place.formatted_address}` : "住所：--";
    const pPhone = document.createElement("p");
      pPhone.innerHTML = (place.formatted_phone_number !== undefined) ? `電話番号: ${place.formatted_phone_number}` : "電話番号：--";
    const pHP = document.createElement("p");
      pHP.innerHTML = (place.website !== undefined) ? `HP: <a href="${place.website}" target="_blank">${place.website}</a>` : "HP：--";
    const input = document.createElement("input");
      input.setAttribute("type", "submit");
      input.setAttribute("method", "post");
      input.setAttribute("name", "add");
      input.setAttribute("value", "追加");
      input.classList.add("button");

      input.setAttribute("onclick", `addSelectSpotList("${place.place_id}")`); // [追加] ボタンで addSelectSpotList を起動するように登録

    div.appendChild(img);
    div.appendChild(h2);
    div.appendChild(pPrice);
    div.appendChild(pAddress);
    div.appendChild(pPhone);
    div.appendChild(pHP);
    div.appendChild(input);
    target.appendChild(div);
  };
}
  
let arr = [];
  
// 画面下部（追加）ボタンに登録
// 画面左の選択済みスポットリストに、選択したショップを登録する（表示する）
function addSelectSpotList(place_id) {

  if (!arr.includes(place_id)) {
    arr.push(place_id);
    getPlaceDetails(place_id, appendIt); // 引数のplace_idから、再度getPlaceDetailsで情報取得
  }
  else {
    alert('既に追加済みです');
  }

  function appendIt (place) {
    const target = document.querySelector(".input-area"); // 表示先

    // 表示
    const div = document.createElement("div");
      div.classList.add("select-spot");
    const img = document.createElement("img");
      img.src = (place.photos[0] !== undefined) ? place.photos[0].getUrl() : "/images/noimage_hotel.png";
      img.alt = "お店の画像";
    const h2 = document.createElement("h2");
      h2.innerText = place.name;

    const inputhidden = document.createElement("input"); // 隠し属性のinputで、要素にplace_idを隠し持っておく
      inputhidden.setAttribute("type", "hidden");
      inputhidden.setAttribute("value", place.place_id);
      inputhidden.classList.add("this-place-id");
    
    const input = document.createElement("input");
      input.setAttribute("type", "button");
      input.setAttribute("name", "delete");
      input.setAttribute("value", "削除");
      input.classList.add("delete-button");

      input.setAttribute("onclick", `clearSelectSpotList("${place.place_id}")`); // [追加] ボタンで addSelectSpotList を起動するように登録

    div.appendChild(img);
    div.appendChild(h2);
    div.appendChild(inputhidden);
    div.appendChild(input);

    target.prepend(div); // リストの先頭に追加

  }
}
/*
// 画面左の選択済みスポットリストを消去する
function clearSelectSpotList(placeId){
  const target = document.querySelector(".input-area");
  const selectSpotElements = target.querySelectorAll(".select-spot");
  selectSpotElements.forEach(element => {
    const deleteId = element.querySelector(".this-place-id").value;
    if (placeId === deleteId){
      element.remove();
      // 配列arrからplace_idを削除するコード
      const index = arr.indexOf(deleteId);
      if (index !== -1) {
        arr.splice(index, 1);
      }
    }
  });
}

// 画面左の選択済みスポットリストをサーバに送信して、画面遷移
function sendSelectSpots(){
  // 選択されたスポットリストから、placeidのみをとりだして、配列を作る
  let selectedSpotIds = []; // 選択されたplace_idの配列

  const spots = document.querySelectorAll(".select-spot"); // 選択済みスポットリスト
  for (const s of spots) {
    const placeId = s.querySelector(".this-place-id").value;
    selectedSpotIds.push(placeId);
  }

  // 送信
 fetch("/userselectspots", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(selectedSpotIds)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json();
    })
    .then(data => {
      console.log("POST /userselectspots -> ", data);
      // 送信成功なら /hotel に遷移、失敗なら警告表示
      if (data.result == true) window.location.href = "/hotel"
      else alert("送信失敗！");
    });
}
*/