let map;
let infowindow;
let marker;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  const position = { lat: 35.6810603, lng: 139.76730746 };

  const map = new Map(document.getElementById('maps'), {
    center: position,
    zoom: 8,
    mapId: "12b135f8e452a25b"
  });

  try {
    await inquerySpots(map);
  } catch (error) {
    console.error('Error fetching spots: ', error);
  }
}

initMap();

// index_get.jsにアクセスしてplace_idを取得する
function inquerySpots(map) {
  fetch("/interfacespots")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      };
      return response.json();
    })
    .then(data => { 
      console.log(data.results)
      createMarker(data.results, map)
    });
}

// Google Map にピンをさす
async function createMarker(results, map) {
  const { InfoWindow } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  const itemsArrays = results.map(result => result.items).flat();
  console.log("spotsArray: ", itemsArrays);

  itemsArrays.forEach(item => {
    const position = { lat: item.coord.lat, lng: item.coord.lon };
    const marker = new AdvancedMarkerElement({
      map: map,
      position: position, // latおよびlngデータ取り出し
    });

    const infowindow = new InfoWindow();
/*
    google.maps.event.addListener(marker, "click", () => {
      const content = document.createElement("div");
      content.style.width = "300px";
      content.style.height = "100px";

      const nameElement = document.createElement("h2");
      nameElement.textContent = item.name;
      nameElement.style.fontSize = "15px";
      content.appendChild(nameElement);


      const placeAddressElement = document.createElement("p");
      placeAddressElement.textContent = item.address_name;
      content.appendChild(placeAddressElement);

      if (item.details && item.details.length > 0 && item.details[0].official_sites && item.details[0].official_sites[0].value) {
        const websiteElement = document.createElement("p");
        websiteElement.textContent = item.details[0].official_sites[0].value;
        content.appendChild(websiteElement);
      }

      if (item.key_value_texts) {
        for (const [key, value] of Object.entries(item.key_value_texts)) {
          const detailElement = document.createElement("p");
          detailElement.textContent = `${key}: ${value}`;
          content.appendChild(detailElement);
        }
      }

      infowindow.setContent(content);*/
      infowindow.open(map, marker);
/*
      viewSearchResult(item);
    
    });*/
  });
}

// 検索結果の表示
/*function viewSearchResult(place) { // place = getDetails result object
  const target = document.querySelector(".search-result"); // 表示先

  // 表示先の子要素をすべて削除（表示中のものを削除）
  while(target.firstChild) {
    target.removeChild(target.firstChild);
  }

  // 表示
  const img = document.createElement("img");
    img.src = (place.photos[0] !== undefined) ? place.photos[0].getUrl() : "/images/noimage.png";
    img.alt = "お店の画像";
  const h2 = document.createElement("h2");
    h2.innerText = place.name;
  const pAddress = document.createElement("p");
    pAddress.innerHTML = (place.formatted_address !== undefined) ? `住所: ${place.formatted_address}` : "住所: --";
  const pPhone = document.createElement("p");
    pPhone.innerHTML = (place.formatted_phone_number !== undefined) ? `電話番号: ${place.formatted_phone_number}` : "電話番号: --";
  const pWebsite = document.createElement("p");
    pWebsite.innerHTML = (place.website !== undefined) ? `HP: <a href="${place.website}" target="_blank">${place.website}</a>` : "HP: --";
  const input = document.createElement("input");
    input.setAttribute("type", "submit");
    input.setAttribute("method", "post");
    input.setAttribute("name", "add");
    input.setAttribute("value", "追加");
    input.classList.add("button");

    input.setAttribute("onclick", `addSelectSpotList("${place.place_id}")`); // [追加] ボタンで addSelectSpotList を起動するように登録

    target.appendChild(img);
    target.appendChild(h2);
    target.appendChild(pAddress);
    target.appendChild(pPhone);
    target.appendChild(pWebsite);
    target.appendChild(input);

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
      img.src = (place.photos[0] !== undefined) ? place.photos[0].getUrl() : "/images/noimage.png";
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

function nextPage() {
    const ref = document.referrer;
    console.log(ref)

    // 遷移元URLによって遷移先URLを設定
    if (ref.includes('/place')) {
      returnPlacePage();
    } else if (ref.includes('/destination') || ref.includes('/destination-search')) {
      sendSelectSpots();
    };
}

// 画面左の選択済みスポットリストをサーバに送信して、画面遷移
function sendSelectSpots(){
  // 選択されたスポットリストから、placeidのみをとりだして、配列を作る
  let selectedSpots = []; // 選択されたplace_idの配列

  const spots = document.querySelectorAll(".select-spot"); // 選択済みスポットリスト
  for (const s of spots) {
    const placeId = s.querySelector(".this-place-id").value;
    const placeName = s.querySelector("h2").innerText;
    selectedSpots.push({ placeId, placeName }); // オブジェクトとして格納
  }

  // 送信
 fetch("/userselectspots", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(selectedSpots)
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

function returnPlacePage(){
  // 選択されたスポットリストから、placeidのみをとりだして、配列を作る
  let selectedSpots = []; // 選択されたplace_idの配列

  const spots = document.querySelectorAll(".select-spot"); // 選択済みスポットリスト
  for (const s of spots) {
    const placeId = s.querySelector(".this-place-id").value;
    const placeName = s.querySelector("h2").innerText;
    selectedSpots.push({ placeId, placeName }); // オブジェクトとして格納
  }

  // 送信
 fetch("/userselectspots", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(selectedSpots)
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
      if (data.result == true) window.location.href = "/place"
      else alert("送信失敗！");
    });
}*/