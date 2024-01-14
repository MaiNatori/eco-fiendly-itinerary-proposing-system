/*
・/interfacehotels で施設番号を取得
・施設番号を使用して施設情報を取得
・情報を表示
・緯度・経度または住所を保存
*/
// index.jsにアクセスしてplace_idを取得する
function inqueryFacilityNumbers() {
  fetch("/interfacehotels")
    .then(response => {
      if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
      };
    return response.json();
    })
    .then(data => {
      console.log(data.results);
      viewSearchResult(data.results);
    });
}

// 結果の表示
function viewSearchResult(results) {
  const target = document.querySelector(".search-candidate"); // 表示先

  // 各ホテル情報を取り出す
  results.forEach(hotelGroup => {
    const hotelInfo = hotelGroup.hotels[0][0].hotelBasicInfo;
  
    // 表示
    const div = document.createElement("div");
      div.classList.add("candidate-contents");

    const img = document.createElement("img");
      img.src = (hotelInfo.hotelImageUrl !== undefined) ? `${hotelInfo.hotelImageUrl}` : "/images/noimage_hotel.png";
      img.alt = "ホテルの画像";

    const h2 = document.createElement("h2");
      h2.innerText = hotelInfo.hotelName;

    const pPrice = document.createElement("p");
      pPrice.innerHTML = (hotelInfo.hotelMinCharge !== undefined) ? `最低価格: ${hotelInfo.hotelMinCharge}円` : "最低価格：--";
    
    const pAccess = document.createElement("p");
      pAccess.innerHTML = (hotelInfo.access !== undefined) ? `アクセス: ${hotelInfo.access}` : "アクセス：--";

    const pPhone = document.createElement("p");
      pPhone.innerHTML = (hotelInfo.telephoneNo !== undefined) ? `電話番号: ${hotelInfo.telephoneNo}` : "電話番号：--";

    const pHP = document.createElement("p");
      pHP.innerHTML = (hotelInfo.hotelInformationUrl !== undefined) ? `HP: <a href="${hotelInfo.hotelInformationUrl}" target="_blank">${hotelInfo.hotelInformationUrl}</a>` : "HP: --";

    const input = document.createElement("input");
      input.setAttribute("type", "submit");
      input.setAttribute("method", "post");
      input.setAttribute("name", "add");
      input.setAttribute("value", "追加");
      input.classList.add("button");
      input.setAttribute("onclick", `addSelectSpotList("${hotelInfo.hotelNo}")`); // [追加] ボタンで addSelectSpotList を起動するように登録

    div.appendChild(img);
    div.appendChild(h2);
    div.appendChild(pPrice);
    div.appendChild(pAccess);
    div.appendChild(pPhone);
    div.appendChild(pHP);
    div.appendChild(input);

    target.appendChild(div);
  });
}
/*  
let arr = [];
  
// 画面下部（追加）ボタンに登録
// 画面左の選択済みスポットリストに、選択したショップを登録する（表示する）
function addSelectSpotList(results) {

  if (!arr.includes(hotelNo)) {
    arr.push(results.hotelNo);
    const result = results.find(result => results.hotelNo === hotelNo);
  }
  else {
    alert('既に追加済みです');
  }

  function appendIt(place) {
    const target = document.querySelector(".input-area"); // 表示先

    // 表示
    const div = document.createElement("div");
      div.classList.add("select-hotel");
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

// 画面左の選択済みスポットリストを消去する
function clearSelectSpotList(placeId){
  const target = document.querySelector(".input-area");
  const selectSpotElements = target.querySelectorAll(".select-hotel");
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
function sendSelectHotels(){
  // 選択されたスポットリストから、placeidのみをとりだして、配列を作る
  let selectedSpotIds = []; // 選択されたplace_idの配列

  const spots = document.querySelectorAll(".select-hotel"); // 選択済みスポットリスト
  for (const s of spots) {
    const placeId = s.querySelector(".this-place-id").value;
    selectedSpotIds.push(placeId);
  }

  // 送信
 fetch("/userselecthotels", {
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
      console.log("POST /userselecthotels -> ", data);
      // 送信成功なら /hotel に遷移、失敗なら警告表示
      if (data.result == true) window.location.href = "/place"
      else alert("送信失敗！");
    });
}
*/
inqueryFacilityNumbers();
