// index.jsにアクセスしてselectedHotelsを取得する
function fetchRoutes() {
    fetch("/interfaceroute")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        };
      return response.json();
      })
      .then(data => {
        const tripData = data.tripData;
        const routes = data.routeResults;
        console.log("tripDays: ", tripData);
        console.log("routes: ", routes);

        generateTabs(tripData);
      })
      .catch(error => {
        console.error("Error fetching data: ", error);
      });
}

function generateTabs(tripData) {
  const routeTabContainer = document.querySelector('.route-tab');
  routeTabContainer.innerHTML = '';
  tripData.forEach((dayInfo, index) => {
    // タブのラベル部分
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="route-tab" ${index === 0 ? 'checked' : ''}>${dayInfo.dayNumber}日目`;
    label.addEventListener('click', () => showTabContent(index));
   /* 
    // タブのコンテンツ部分
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-contents';
    tabContent.style.display = index === 0 ? 'block' : 'none';

    // 各日程の検索条件と移動手段の設定
    tabContent.innerHTML = `
            <div class="search-option">
                <h3>検索条件</h3>
                <table>
                    <tr>
                        <th><label for="departure-${index}">出発地</label></th>
                        <td><input type="search" id="departure-${index}" placeholder="出発地" value="${dayInfo.departure}"></td>
                    </tr>
                    <tr>
                        <th><label for="arrival-${index}">到着地</label></th>
                        <td><input type="search" id="arrival-${index}" placeholder="到着地" value="${dayInfo.arrival}"></td>
                    </tr>
                    <tr>
                        <th><label for="spot-${index}">スポット</label></th>
                        ${dayInfo.spots.map((spot, i) => `<td><input type="search" id="spot-${index}-${i}" placeholder="スポット${i + 1}" value="${spot}"></td>`).join('')}
                    </tr>
                    <tr>
                        <th><label for="hotel-${index}">宿泊場所</label></th>
                        <td><input type="search" id="hotel-${index}" placeholder="宿泊場所" value="${dayInfo.hotel}"></td>
                    </tr>
                </table>
                <input type="submit" name="application" value="変更を適用" class="button">
            </div>
            <div class="transportation">
                <h3>移動手段</h3>
                <div class="public">
                    <p><input type="checkbox" name="public-${index}" value="飛行機" id="flight-${index}">
                    <label for="flight-${index}">飛行機</label></p>
                    <p><input type="checkbox" name="public-${index}" value="新幹線" id="superexpress-${index}">
                    <label for="superexpress-${index}">新幹線</label></p>
                    <p><input type="checkbox" name="public-${index}" value="電車" id="train-${index}">
                    <label for="train-${index}">電車</label></p>
                    <!-- 他の移動手段も同様に追加 -->
                </div>
                <div class="walk">
                    <label for="walk-${index}">
                        <p><input type="checkbox" name="walk-${index}" value="徒歩" id="walk-${index}">徒歩</p>
                    </label>
                </div>
                <div class="rental">
                    <div class="cycle">
                        <label for="cycle-${index}">
                            <p><input type="checkbox" name="cycle-${index}" value="レンタサイクル" id="cycle-${index}">レンタサイクル</p>
                        </label>
                    </div>
                    <div class="car">
                        <label for="car-${index}">
                            <p><input type="checkbox" name="car-${index}" value="レンタカー" id="car-${index}">レンタカー</p>
                        </label>
                    </div>
                </div>
                <input type="submit" name="application" value="変更を適用" class="button">
            </div>
        `;

        // route-tab コンテナに追加
        routeTabContainer.appendChild(label);
        routeTabContainer.appendChild(tabContent);*/
  });
}

// 選択されたタブの内容を表示する関数
function showTabContent(selectedIndex) {
  const tabContents = document.querySelectorAll('.tab-contents');
  tabContents.forEach((content, index) => {
      content.style.display = index === selectedIndex ? 'block' : 'none';
  });
}

fetchRoutes();