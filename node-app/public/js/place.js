let tripDays = 2;  //現在の旅行日数
let nextDayNumber = 2;  // 次に追加される日程の日数
let selectedHotels = [];

// index.jsにアクセスしてselectedHotelsを取得する
function fetchSelectedHotels() {
    fetch("/get-hotels")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        };
      return response.json();
      })
      .then(data => {
        selectedHotels = data.selectHotels;
        console.log("selectedHotels: ", selectedHotels);
      })
      .catch(error => {
        console.error("Error fetching data: ", error);
      });
}

//日程の追加
function addNewDay() { 
    const input = document.querySelector(".input-place");
    const div = document.createElement('div');
        div.classList.add('day');
        
    const previousArrivalHotel = document.getElementById(`arrival-${nextDayNumber - 1}`).value;

    let optionsHtml = '';
    selectedHotels.forEach(hotel => {
        optionsHtml += `<option value="${hotel.hotelName}">${hotel.hotelName}</option>`;
    });

    div.innerHTML = `
        <h3>${nextDayNumber}日目</h3>
        <table>
            <tr>
                <th><label>出発地</label></th>
                <td><label id="departure-${nextDayNumber}">${previousArrivalHotel}</label></td>
            </tr>
            <tr>
                <th><label>到着地</label></th>
                <td>
                    <select id="arrival-${nextDayNumber}" onchange="updateNextDeparture(${nextDayNumber})">
                        ${optionsHtml}
                    </select>
                </td>
            </tr>
        </table>
    `;

    const lastDay = document.querySelector('#last-day');
    input.insertBefore(div, lastDay);

    tripDays++;
    document.getElementById("trip-days").textContent = tripDays;

    nextDayNumber++;
    updateDayNumbers();

    updateFinalDeparture();

}

// 日程の削除
function deleteDay() {
    const days = document.querySelectorAll('.day');
    if (days.length > 2) {
        const lastDayIndex = days.length - 2;
        const lastDay = days[lastDayIndex];

        lastDay.remove();

        tripDays--;
        document.getElementById('trip-days').textContent = tripDays;

        nextDayNumber--;
        updateDayNumbers();
    }

    updateDayNumbers();
    updateFinalDeparture();
}

// 日数表示の変更
function updateDayNumbers() {
    const days = document.querySelectorAll('.day');
    if (days.length === 0) {
        return;
    }
    days.forEach((day, index) => {
        const h3 = day.querySelector('h3.number');
        if (h3) {
            if (index === days.length - 1) {
                h3.innerHTML = "最終日";
            } else {
                h3.innerHTML = `${index + 1}日目`;
            }
        } 
    });
}

// 翌日の出発地の変更
function updateNextDeparture(dayNumber) {
    const arrivalSelect = document.getElementById(`arrival-${dayNumber}`);
    const nextDeparture = document.getElementById(`departure-${dayNumber + 1}`);
  
    if (nextDeparture) {
      nextDeparture.textContent = arrivalSelect.value;
    }
    
    updateFinalDeparture();
}

// 最終日の出発地の変更
function updateFinalDeparture() {
    const days = document.querySelectorAll('.day');
    const finalDeparture = document.getElementById("final-departure");

    if (days.length > 1) {
        const lastArrivalSelect = days[days.length - 2].querySelector('select');
        if (lastArrivalSelect) {
            finalDeparture.textContent = lastArrivalSelect.value;
            lastArrivalSelect.addEventListener('change', () => {
                finalDeparture.textContent = lastArrivalSelect.value;
            });
        }
    } else {
        finalDeparture.textContent = '--';
    }
}

// ページがロードされたときに行う初期設定
window.onload = function() {
    fetchSelectedHotels();
    updateFinalDeparture();
    const initialArrival = document.getElementById('arrival-1');
    if (initialArrival) {
        initialArrival.addEventListener('change', () => updateNextDeparture(1));
        initialArrival.addEventListener('change', updateFinalDeparture);
    }
    // 初期値として最初の選択肢を最終日の出発地に設定
    const initialFinalDeparture = document.getElementById("final-departure");
    if (initialFinalDeparture) {
        initialFinalDeparture.textContent = initialArrival.value;
    }
}

// 確定ボタンを押したときの挙動
function confirmDay(dayNumber) {
    const departureInput = document.getElementById(`departure-${dayNumber}`);
    const arrivalSelect = document.getElementById(`arrival-${dayNumber}`);

    if (!departureInput || departureInput.value.trim() === '') {
        alert("出発地を入力してください");
        return;
    }

    const departure = document.getElementById('departure-1').value.trim();
    const addressPattern = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+[\s　]+[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+[\s　]+[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+[\s　]+[0-9０-９\-]+$/;
    if (!addressPattern.test(departure)) {
        alert("出発地は「都道府県 市区町村 町名 番地」の形式で入力してください（例: 東京都 新宿区 市谷田町 1-18）");
        return;
    }

    if (dayNumber === 1) {
        const finalArrival = document.getElementById("final-arrival");
        finalArrival.textContent = departureInput.value;

        const nextDeparture = document.getElementById(`departure-${nextDayNumber}`);
        if (nextDeparture) {
            nextDeparture.value = arrivalSelect.value;
        }
    } 

    const lastDayNumber = document.querySelectorAll('.day').length;
    if (dayNumber === lastDayNumber - 1) {
        const previousArrival = document.getElementById(`arrival-${dayNumber}`);
        const finalDeparture = document.getElementById("final-departure");
        finalDeparture.textContent = previousArrival.value;
    }

    if (dayNumber < lastDayNumber) {
        const nextDeparture = document.getElementById(`departure-${nextDayNumber}`);
        if (nextDeparture) {
            nextDeparture.value = arrivalSelect.value;
        }
    }
}

function sendTripData() {
    const tripData = [];
    const days = document.querySelectorAll('.day');

    // 1日目の出発地と到着地
    const firstDeparture = document.getElementById('departure-1').value;
    const firstArrival = document.getElementById('arrival-1').value;
    tripData.push({ dayNumber: 1, departure: firstDeparture, arrival: firstArrival });

    // 各日程の出発地と到着地
    days.forEach((day, index) => {
        const departureElement = document.getElementById(`departure-${index + 1}`);
        const arrivalElement = document.getElementById(`arrival-${index + 1}`);

        const departure = departureElement ? departureElement.textContent : null;
        const arrival = arrivalElement ? arrivalElement.value : null;

        if (departure && arrival) {
            tripData.push({ dayNumber: index + 1, departure, arrival });
        } else {
            console.error("Departure or arrival element is null for day", index + 1);
        }
    });

    // 最終日の出発地と到着地
    const finalDeparture = document.getElementById('final-departure').textContent;
    const finalArrival = document.getElementById('final-arrival').textContent;
    tripData.push({ dayNumber: days.length, departure: finalDeparture, arrival: finalArrival });

    const tripDays = tripData.length;

    if (!firstDeparture || (finalArrival === "--")) {
        alert("1日目の出発地を入力し、適用ボタンを押してください");
        return;
    }

    fetch('/userselecttripdata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripDays, tripData })
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("POST /userselecttripdata -> ", data);
        // 送信成功なら /result に遷移、失敗なら警告表示
        if (data.result == true) window.location.href = "/result"
        else alert("送信失敗！");      
    })
}