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
  results.hotels.forEach(hotelGroup => {
    const hotelInfo = hotelGroup[0].hotelBasicInfo;
  
    // 表示
    const div = document.createElement("div");
      div.classList.add("candidate-contents");
      div.dataset.hotelNo = `${hotelInfo.hotelNo}`;

    const img = document.createElement("img");
      img.onload = () => {
      };
      img.onerror = () => {
        img.src = "/images/noimage_hotel.jpg"
      };
      img.src = (hotelInfo.hotelImageUrl !== undefined) ? `${hotelInfo.hotelImageUrl}` : "/images/noimage_hotel.jpg";
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
      //input.dataset.hotelNo = hotelInfo.hotelNo;
      input.dataset.hotelName = hotelInfo.hotelName;
      input.dataset.hotelImageUrl = hotelInfo.hotelImageUrl;
      input.addEventListener("click", (event) => addSelectSpotList(event));
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

let arr = [];

// 画面下部（追加）ボタンに登録
// 画面左の選択済みスポットリストに、選択したショップを登録する（表示する）
function addSelectSpotList(event) {

  // クリックされた要素のデータ属性を取得
  const clickedElement = event.target.closest('.button');
  const hotelNo = clickedElement.dataset.hotelNo;
  const hotelName = clickedElement.dataset.hotelName;
  const hotelImageUrl = clickedElement.dataset.hotelImageUrl;

  if (!arr.includes(hotelNo)) {
    arr.push(hotelNo);
    appendIt(hotelNo, hotelName, hotelImageUrl);
  }
  else {
    alert('既に追加済みです');
  }

  function appendIt(hotelNo, hotelName, hotelImageUrl) {
    const target = document.querySelector(".input-area"); // 表示先

    // 表示
    const div = document.createElement("div");
      div.classList.add("select-hotel");
    const img = document.createElement("img");
      img.onload = () => {
      };
      img.onerror = () => {
        img.src = "/images/noimage_hotel.jpg"
      };
      img.src = (hotelImageUrl !== undefined) ? `${hotelImageUrl}` : "/images/noimage_hotel.jpg";
      img.alt = "ホテルの画像";

    const h2 = document.createElement("h2");
      h2.innerText = hotelName;

    const inputhidden = document.createElement("input"); // 隠し属性のinputで、要素にplace_idを隠し持っておく
      inputhidden.setAttribute("type", "hidden");
      inputhidden.setAttribute("value", hotelNo);
      inputhidden.classList.add("this-hotel-no");
    
    const input = document.createElement("input");
      input.setAttribute("type", "button");
      input.setAttribute("name", "delete");
      input.setAttribute("value", "削除");
      input.classList.add("delete-button");

      input.setAttribute("onclick", `clearSelectHotelList("${hotelNo}")`); // [追加] ボタンで addSelectSpotList を起動するように登録

    div.appendChild(img);
    div.appendChild(h2);
    div.appendChild(inputhidden);
    div.appendChild(input);

    target.prepend(div); // リストの先頭に追加

  }
}

// 画面左の選択済みスポットリストを消去する
function clearSelectHotelList(hotelNos){
  const target = document.querySelector(".input-area");
  const selectHotelElements = target.querySelectorAll(".select-hotel");
  selectHotelElements.forEach(element => {
    const deleteNo = element.querySelector(".this-hotel-no").value;
    if (hotelNos === deleteNo){
      element.remove();
      // 配列arrからplace_idを削除するコード
      const index = arr.indexOf(deleteNo);
      if (index !== -1) {
        arr.splice(index, 1);
      }
    }
  });
}
/*
// 絞り込み・並び替え
function applyFilter(){

}
//絞り込み hotelClassCodeの種類が知りたい、hotelMinChargeで予算絞り込み、accessの駅近絞り込み
function classNarrowDown(){

}

function chargeNarrowDown(minRange, maxRange){

} 

function accessNarrowDown(){

}

//並び替え 安い順(hotelMinCharge)、高い順(hotelMinCharge)、駅近順(access)、人気順(reviewAverage)
function minChargeSort(){
    fetch("/interfacehotels")
      .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
        };
      return response.json();
      })
      .then(data => {
        console.log("Fetched hotel details: ", data);

        const newParams = { ...data.params, 'sort': "+roomCharge" };

        fetchHotelSearch(newParams)
         .then(searchResult => {
          console.log("Search result with sorted room charge:", searchResult);
         })
         .catch(error => {
          console.error("Error fetching search result:", error);
         });
      })
      .catch(error => {
        console.error("Error fetching hotel details:", error);
      })
}
/*
function maxChargeSort(){

}

function accessSort(){

}

function reviewSort(){

}
*/
// 画面左の選択済みスポットリストをサーバに送信して、画面遷移
function sendSelectHotels(){
  // 選択されたスポットリストから、placeidのみをとりだして、配列を作る
  let selectedHotelNos = []; // 選択されたplace_idの配列

  const hotels = document.querySelectorAll(".select-hotel"); // 選択済みスポットリスト
  for (const s of hotels) {
    const hotelNumber = s.querySelector(".this-hotel-no").value;
    selectedHotelNos.push(hotelNumber);
  }

  // 送信
 fetch("/userselecthotels", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(selectedHotelNos)
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

inqueryFacilityNumbers();