// index.jsにアクセスしてplace_idを取得する
function inqueryFacilityNumbers() {
    fetch("/interfacedestination")
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          };
        return response.json();
        })
        .then(data => {
          console.log(data.results);
          /*viewSearchResult(data.results);
          getDestinationNames(data.results).then(destinationNames => {
              console.log('Destination names:', destinationNames);
          });*/
        })
        .catch(error => {
          console.error("Error fetching data: ", error);
        });
}
/*
async function getDestinationNames(searchResults) {
    const destinationNames = [];

    // 各検索結果の URL にアクセスし、地名を取得
    for (const result of searchResults.items) {
        try {
            const response = await fetch(result.link);
            const html = await response.text();

            // HTML コードを解析して地名を取得
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const destinationName = doc.querySelector('h3').textContent; // 例として h1 タグのテキストを地名として取得

            // 取得した地名を配列に追加
            destinationNames.push(destinationName);
        } catch (error) {
            console.error('Error fetching destination name:', error);
        }
    }
    console.log("destinationNames > ",destinationNames);

    return destinationNames;
}


// 結果の表示
function viewSearchResult(results) {
    const loading = document.querySelector('.js-loading');
    loading.classList.add('js-loaded');

    clearSearchResults();
  
    const target = document.querySelector(".search-result"); // 表示先
  
    // リクエスト結果からURLを取得
    const urls = results.map(result => result.link);

    async function processUrls(urls) {
        for (const url of urls) {
            const response = await fetch(url);
            const html = await response.text();

            // 地名が含まれているかどうか
            if(html.includes('地名')) {
                const 地名 = "地名";
                const 画像 = ;
                const 説明文 = ;

                console.log(地名, 画像, 説明文);
            }
        }
    }
    
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
        input.classList.add("button");
        input.dataset.hotelName = hotelInfo.hotelName;
        input.dataset.hotelImageUrl = hotelInfo.hotelImageUrl;
        input.dataset.hotelNo = hotelInfo.hotelNo;
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

// 既存の表示内容を消去する関数
function clearSearchResults(){
    const target = document.querySelector(".search-candidate");
    while (target.firstChild) {
      target.removeChild(target.firstChild);
    }
}

// 画面左の選択済みスポットリストをサーバに送信して、画面遷移
function sendSelectHotels(){
    // 選択されたスポットリストから、placeidのみをとりだして、配列を作る
    let selectedHotelNos = []; // 選択されたplace_idの配列
  
    const hotels = document.querySelectorAll(".select-hotel"); // 選択済みスポットリスト
    for (const s of hotels) {
      const hotelNumber = s.querySelector(".this-hotel-no").value;
      selectedHotelNos.push(hotelNumber);
    }
  
    console.log(selectedHotelNos);
  
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
*/
inqueryFacilityNumbers();