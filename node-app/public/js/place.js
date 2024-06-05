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
