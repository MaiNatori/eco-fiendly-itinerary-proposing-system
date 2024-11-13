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
      updateCheckboxes(data.results);
    })
    .catch(error => {
      console.error("Error fetching data: ", error);
    });
}

// hotelDetailInfoがnullの場合、施設タイプでの絞り込みを不可に
function updateCheckboxes(results) {
  const facilityCheckboxes = document.querySelectorAll('[name="facility"]');
  const facilityTypeCheckbox = document.querySelector('[name="facility-type"]');
  let hasValidDetails = results.some(result => result.hotelInfo.hotelDetailInfo !== null);
  facilityCheckboxes.forEach(checkbox => {
    checkbox.disabled = !hasValidDetails;
    facilityTypeCheckbox.disabled = !hasValidDetails;
    const label = document.querySelector(`label[for="${checkbox.id}"]`);
    const labelType = document.querySelector(`label[for="type"] p`);
    if (checkbox.disabled && facilityTypeCheckbox.disabled) {
      label.style.textDecoration = 'line-through';
      label.style.color = '#999';
      checkbox.style.backgroundColor = '#ccc';
      labelType.style.textDecoration = 'line-through';
      labelType.style.color = '#999';
      facilityTypeCheckbox.style.backgroundColor = '#ccc';
    } else {
      label.style.textDecoration = 'none';
      label.style.color = '';
      checkbox.style.backgroundColor = '';
      labelType.style.textDecoration = 'none';
      labelType.style.color = '';
      facilityTypeCheckbox.style.backgroundColor = '';
      checkbox.addEventListener('change', handleTypeSelect);
    }
  });
}

// 結果の表示
function viewSearchResult(results) {
  const loading = document.querySelector('.js-loading');
  loading.classList.add('js-loaded');

  document.getElementById('range-min').addEventListener('change', handleBudgetChange);
  document.getElementById('range-max').addEventListener('change', handleBudgetChange);
  document.getElementById('minutes').addEventListener('change', handleMinutesChange);

  clearSearchResults();

  const target = document.querySelector(".search-candidate"); // 表示先

  // 各ホテル情報を取り出す
  results.forEach(hotelGroup => {
    const hotelInfo = hotelGroup.hotelInfo.hotelBasicInfo;
  
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

    const pReview = document.createElement("p");
      pReview.innerHTML = (hotelInfo.reviewAverage !== undefined) ? `評価：${hotelInfo.reviewAverage}` : "評価：--"; 

    const pHP = document.createElement("p");
      pHP.innerHTML = (hotelInfo.hotelInformationUrl !== undefined) ? `HP: <a href="${hotelInfo.hotelInformationUrl}" target="_blank">${hotelInfo.hotelInformationUrl}</a>` : "HP: --";

    const input = document.createElement("input");
      input.setAttribute("type", "submit");
      input.setAttribute("method", "post");
      input.setAttribute("name", "add");
      input.setAttribute("value", "追加");
      input.classList.add("add-button");
      input.dataset.hotelName = hotelInfo.hotelName;
      input.dataset.hotelImageUrl = hotelInfo.hotelImageUrl;
      input.dataset.hotelNo = hotelInfo.hotelNo;
      input.dataset.latitude = hotelInfo.latitude;
      input.dataset.longitude = hotelInfo.longitude;
      input.addEventListener("click", (event) => addSelectSpotList(event));
    div.appendChild(img);
    div.appendChild(h2);
    div.appendChild(pPrice);
    div.appendChild(pAccess);
    div.appendChild(pPhone);
    div.appendChild(pReview);
    div.appendChild(pHP);
    div.appendChild(input);

    target.appendChild(div);
    
  });
}

let arr = [];

// 画面下部（追加）ボタンに登録
// 画面左の選択済みスポットリストに、選択したホテルを登録する（表示する）
function addSelectSpotList(eventOrData) {

  let hotelNo, hotelName, hotelImageUrl, hotelLatitude, hotelLongitude;

  if (eventOrData instanceof Event) {
    // クリックイベントの場合
    const clickedElement = eventOrData.target.closest('.add-button');
    hotelNo = clickedElement.dataset.hotelNo;
    hotelName = clickedElement.dataset.hotelName;
    hotelImageUrl = clickedElement.dataset.hotelImageUrl;
    hotelLatitude = clickedElement.dataset.latitude;
    hotelLongitude = clickedElement.dataset.longitude;
  } else {
    // データオブジェクトが渡された場合（loadSelectedHotelsから呼ばれた場合）
    hotelNo = eventOrData.hotelNo;
    hotelName = eventOrData.hotelName;
    hotelImageUrl = eventOrData.hotelImageUrl;
    hotelLatitude = eventOrData.latitude;
    hotelLongitude = eventOrData.longitude;
  }

  if (!arr.includes(hotelNo)) {
    arr.push(hotelNo);
    appendIt(hotelNo, hotelName, hotelImageUrl, hotelLatitude, hotelLongitude);
    saveSelectedHotelsToSession();
  }
  else {
    alert('既に追加済みです');
  }

  function appendIt(hotelNo, hotelName, hotelImageUrl, hotelLatitude, hotelLongitude) {
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
    
    const lathidden = document.createElement("input");
      lathidden.setAttribute("type", "hidden");
      lathidden.setAttribute("value", hotelLatitude);
      lathidden.classList.add("hotel-latitude");
    
    const lnghidden = document.createElement("input");
      lnghidden.setAttribute("type", "hidden");
      lnghidden.setAttribute("value", hotelLongitude);
      lnghidden.classList.add("hotel-longitude");
    
    const input = document.createElement("input");
      input.setAttribute("type", "button");
      input.setAttribute("name", "delete");
      input.setAttribute("value", "削除");
      input.classList.add("delete-button");

      input.setAttribute("onclick", `clearSelectHotelList("${hotelNo}")`); // [追加] ボタンで addSelectSpotList を起動するように登録

    div.appendChild(img);
    div.appendChild(h2);
    div.appendChild(inputhidden);
    div.appendChild(lathidden);
    div.appendChild(lnghidden);
    div.appendChild(input);

    target.prepend(div); // リストの先頭に追加

    saveSelectedHotelsToSession();

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
      saveSelectedHotelsToSession();
    }
  });
}

// 既存の表示内容を消去する関数
function clearSearchResults(){
  const target = document.querySelector(".search-candidate");
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }
}

function saveSelectedHotelsToSession() {
  const selectedHotels = arr.map(hotelNo => {
    const hotelElement = document.querySelector(`.this-hotel-no[value="${hotelNo}"]`).parentElement;
    return {
      hotelNo: hotelNo,
      hotelName: hotelElement.querySelector("h2").innerText,
      hotelImageUrl: hotelElement.querySelector("img").src,
      hotelLatitude: hotelElement.querySelector(".hotel-latitude").value,
      hotelLongitude: hotelElement.querySelector(".hotel-longitude").value
    };
  });
  sessionStorage.setItem('selectedHotels', JSON.stringify(selectedHotels));
}

function loadSelectedHotels() {
  const ref = document.referrer;
  // 遷移元URLによって遷移先URLを設定
  if (ref.includes('/place') || ref.includes('/result')) {
    inqueryFacilityNumbers();
    const selectedHotels = JSON.parse(sessionStorage.getItem('selectedHotels'));
    selectedHotels.forEach(hotel => {
      addSelectSpotList(hotel);
    });  
  } else {
    inqueryFacilityNumbers();
  };
}

// 予算のプルダウンが変更されたときの処理
function handleBudgetChange() {
  const rangeMin = parseInt(document.getElementById('range-min').value);
  const rangeMax = parseInt(document.getElementById('range-max').value);
  if ((rangeMin > 0 || rangeMax < 1000000000000) && rangeMin < rangeMax) {
      document.getElementById('budget').checked = true;
  } else {
      document.getElementById('budget').checked = false;
  }
}

// 駅からの距離のプルダウンが変更されたときの処理
function handleMinutesChange() {
  const minutes = parseInt(document.getElementById('minutes').value)
  if (minutes < 100) {
      document.getElementById('distance').checked = true;
  } else {
      document.getElementById('distance').checked = false;
  }
}

// 施設タイプのチェックボックスが変更されたときの処理
function handleTypeSelect() {
  const facilityCheckboxes = document.querySelectorAll('[name="facility"]');
  const selectedFacilityTypes = Array.from(facilityCheckboxes).filter(cb => cb.checked);
  const facilityTypeCheckbox = document.getElementById('facility-type');
  facilityTypeCheckbox.checked = selectedFacilityTypes.length > 0;
  facilityTypeCheckbox.addEventListener('click', (e) => {
    if (selectedFacilityTypes.length > 0) {
      e.preventDefault();
    }
  });
}

// 絞り込み・並び替え
function applyFilter(){
  clearSearchResults();
  const loading = document.querySelector('.js-loading');
  loading.classList.remove('js-loaded');

  let sortCriteria; // 並び替えの関数を格納
  let filterCriteria = []; // 絞り込みの関数を格納
  let sortText = ""; // 並び替え条件を画面に表示
  let filterText =""; // 絞り込み条件を画面に表示

  // どの条件が選択されているか
  let checkboxmin = document.getElementById('cheap');
  let checkboxmax = document.getElementById('expensive');
  let checkboxaccess = document.getElementById('near');
  let checkboxpopular = document.getElementById('popular');
  let checkboxbudget = document.getElementById('budget');
  let checkboxdistance = document.getElementById('distance');
  let checkboxtype = document.getElementById('facility-type');

   // 並び替え条件の処理
  if (checkboxmin.checked) {
    sortCriteria = minChargeSort;
    sortText = '並び替え条件：料金が安い順';
  } else if (checkboxmax.checked) {
    sortCriteria = maxChargeSort;
    sortText = '並び替え条件：料金が高い順';
  } else if (checkboxaccess.checked) {
    sortCriteria = accessSort;
    sortText = '並び替え条件：駅から近い順';
  } else if (checkboxpopular.checked) {
    sortCriteria = reviewSort;
    sortText = '並び替え条件：人気順';
  }

  // 絞り込み条件の処理
  if (checkboxbudget.checked) {
    filterCriteria.push(chargeFilter);
    filterText += '予算';
  }
  if (checkboxdistance.checked) {
    filterCriteria.push(distanceFilter);
    filterText += (filterText ? '、' : '') + '駅からの距離';
  }
  if (checkboxtype.checked) {
    filterCriteria.push(classFilter);
    filterText += (filterText ? '、' : '') + '施設タイプ';
  }

  // HTMLに条件を表示
  document.getElementById('sort').innerText = sortText ? sortText : '並び替え順：';
  document.getElementById('filter').innerText = filterText ? '絞り込み条件：' + filterText : '絞り込み条件：';

  // console.logで条件を表示
  console.log(sortText ? sortText : '並び替え条件：なし');
  console.log(filterText ? '絞り込み条件：' + filterText : '絞り込み条件：なし');

  // 絞り込み条件の処理を適用
  let filteredHotels = fetch("/interfacehotels")
    .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      let filteredData = data.results;
      // 絞り込み条件が選択されている場合
      if (filterCriteria.length > 0) {
        filterCriteria.forEach(filterFunction => {
          filteredData = filterFunction(filteredData);
        });    
      }
      // 並び替え条件が選択されている場合
      if (sortCriteria) {
        sortCriteria(filteredData);
      } else { // 並び替え条件が選択されていない場合
          viewSearchResult(filteredData);
      }
    })
  // 絞り込み条件が選択されていない場合で並び替え条件がある場合
  if (filterCriteria === 0 && sortCriteria) {
    filteredHotels.then(filteredData => {
      sortCriteria(filteredData);
    });
  } else if (filterCriteria === 0 && !sortCriteria) { // 絞り込みも並び替えも選択されていない場合
    inqueryFacilityNumbers();
  }
}

//絞り込み hotelClassCodeの種類が知りたい、hotelMinChargeで予算絞り込み、accessの駅近絞り込み
function chargeFilter(filteredData){
  const rangeMin = parseInt(document.getElementById('range-min').value);
  const rangeMax = parseInt(document.getElementById('range-max').value);
  return filteredData.filter(hotel => {
    const charge = parseInt(hotel.hotelInfo.hotelBasicInfo.hotelMinCharge);
    return charge >= rangeMin && charge <= rangeMax;
  });
}

function distanceFilter(filteredData){
  const selectedTime = parseInt(document.getElementById('minutes').value);
  return filteredData.filter(hotel => {
    const walkTime = extractWalkTime(hotel.hotelInfo.hotelBasicInfo.access);
    return walkTime <= selectedTime;
  });
} 

function classFilter(filteredData){
// 選択されたクラスに合致するホテルデータのみを抽出して返す
  const facilityCheckboxes = document.querySelectorAll('[name="facility"]');
  const selectedFacilityTypes = Array.from(facilityCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
  const filteredHotels = filteredData.filter(hotel => {
    return selectedFacilityTypes.includes(hotel.hotelInfo.hotelDetailInfo.hotelClassCode);
  });

  if (filteredHotels.length === 0) {
    alert("該当する結果がありませんでした。");
  }

  return filteredHotels;
}

//並び替え 安い順(hotelMinCharge)、高い順(hotelMinCharge)、駅近順(access)、人気順(reviewAverage)
function minChargeSort(filteredData){
  // 料金が存在するホテル情報のみをフィルタリングする
  const hotelsWithCharge = filteredData.filter(hotel => {
    const minCharge = hotel.hotelInfo.hotelBasicInfo.hotelMinCharge;
    return minCharge !== undefined;
  });
  // 料金の小さい順に並び替え
  const sortedHotels = hotelsWithCharge.sort((a, b) => {
    const chargeA = a.hotelInfo.hotelBasicInfo.hotelMinCharge;
    const chargeB = b.hotelInfo.hotelBasicInfo.hotelMinCharge;
    return chargeA - chargeB;
  });
  console.log("料金が低い順", sortedHotels);
  // 結果を表示
  viewSearchResult(sortedHotels);
  const loading = document.querySelector('.js-loading');
  loading.classList.add('js-loaded');
  document.getElementById('range-min').addEventListener('change', handleBudgetChange);
  document.getElementById('range-max').addEventListener('change', handleBudgetChange);
  document.getElementById('minutes').addEventListener('change', handleMinutesChange);
  const facilityCheckboxes = document.querySelectorAll('[name="facility"]');
  facilityCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', handleTypeSelect);
  });  
}

function maxChargeSort(filteredData){
  // 料金が存在するホテル情報のみをフィルタリングする
  const hotelsWithCharge = filteredData.filter(hotel => {
    const minCharge = hotel.hotelInfo.hotelBasicInfo.hotelMinCharge;
    return minCharge !== undefined;
  });
  // 料金の小さい順に並び替え
  const sortedHotels = hotelsWithCharge.sort((a, b) => {
    const chargeA = a.hotelInfo.hotelBasicInfo.hotelMinCharge;
    const chargeB = b.hotelInfo.hotelBasicInfo.hotelMinCharge;
    return chargeB - chargeA;
  });
  console.log("料金が高い順", sortedHotels);
  // 結果を表示
  viewSearchResult(sortedHotels);
  const loading = document.querySelector('.js-loading');
  loading.classList.add('js-loaded');
  document.getElementById('range-min').addEventListener('change', handleBudgetChange);
  document.getElementById('range-max').addEventListener('change', handleBudgetChange);
  document.getElementById('minutes').addEventListener('change', handleMinutesChange);
  const facilityCheckboxes = document.querySelectorAll('[name="facility"]');
  facilityCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', handleTypeSelect);
  });  
}

function accessSort(filteredData){
  // アクセス情報を持つホテルのみフィルタリング
  const hotelsWithAccess = filteredData.filter(hotel => {
    const accessInfo = hotel.hotelInfo.hotelBasicInfo.access;
    return accessInfo !== undefined;
  });
  // 最寄り駅と徒歩時間を抽出し、並び替え
  const sortedHotels = hotelsWithAccess.sort((a, b) => {
    const accessA = extractWalkTime(a.hotelInfo.hotelBasicInfo.access);
    const accessB = extractWalkTime(b.hotelInfo.hotelBasicInfo.access);
    return accessA - accessB;
  });
  console.log("駅から近い順", sortedHotels);
  // 結果を表示
  viewSearchResult(sortedHotels);
  const loading = document.querySelector('.js-loading');
  loading.classList.add('js-loaded');
  document.getElementById('range-min').addEventListener('change', handleBudgetChange);
  document.getElementById('range-max').addEventListener('change', handleBudgetChange);
  document.getElementById('minutes').addEventListener('change', handleMinutesChange);
  const facilityCheckboxes = document.querySelectorAll('[name="facility"]');
  facilityCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', handleTypeSelect);
  });  
}

function extractWalkTime(access) {
  // 「徒歩」の直後にある「分」の前の数字を抽出して返す
  const regex = /徒歩\D*(\d+)\D*分/g;
  let minTime = Infinity;
  let match;
  while ((match = regex.exec(access)) !== null) {
    const time = parseInt(match[1]);
    if (time < minTime) {
      minTime = time;
    }
  }
  return minTime;
}

function reviewSort(filteredData){
  // レビュー評価が存在するホテル情報のみをフィルタリングする
  const hotelsWithReview = filteredData.filter(hotel => {
    const reviewAverage = hotel.hotelInfo.hotelBasicInfo.reviewAverage;
    return reviewAverage !== undefined;
  });
  // レビュー評価が高い順に並び替える
  hotelsWithReview.sort((a, b) => {
    const reviewAverageA = a.hotelInfo.hotelBasicInfo.reviewAverage;
    const reviewAverageB = b.hotelInfo.hotelBasicInfo.reviewAverage;
    return reviewAverageB - reviewAverageA; // レビュー評価が大きい順に並び替える
  });
  // ソートされた結果を表示
  console.log(hotelsWithReview);
  viewSearchResult(hotelsWithReview);
  const loading = document.querySelector('.js-loading');
  loading.classList.add('js-loaded');
  document.getElementById('range-min').addEventListener('change', handleBudgetChange);
  document.getElementById('range-max').addEventListener('change', handleBudgetChange);
  document.getElementById('minutes').addEventListener('change', handleMinutesChange);
  const facilityCheckboxes = document.querySelectorAll('[name="facility"]');
  facilityCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', handleTypeSelect);
  });  
}

// 画面左の選択済みスポットリストをサーバに送信して、画面遷移
function sendSelectHotels(){
  let selectedHotels = [];

  const hotels = document.querySelectorAll(".select-hotel"); // 選択済みスポットリスト
  for (const s of hotels) {
    const hotelNumber = s.querySelector(".this-hotel-no").value;
    const hotelName = s.querySelector("h2").innerText;
    const hotelLat = s.querySelector(".hotel-latitude").value;
    const hotelLon = s.querySelector(".hotel-longitude").value;
    selectedHotels.push({ hotelNumber, hotelName, hotelLat, hotelLon }); // オブジェクトとして格納
  }

  if (selectedHotels.length === 0) {
    alert("宿泊場所を選択してください");
    return;
  }

  // 送信
 fetch("/userselecthotels", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(selectedHotels)
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

document.addEventListener('DOMContentLoaded', loadSelectedHotels);