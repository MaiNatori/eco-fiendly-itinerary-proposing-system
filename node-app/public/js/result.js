let map;
let infowindow;
let directionsService;
let directionsRenderer;

// index.jsにアクセスしてselectedHotelsを取得する
function fetchRoutes() {
    fetch("/interfaceroute")
        .then(response => {
            /*
            // ローディング画面
            const loading = document.querySelector('.js-loading');
            loading.classList.remove('js-loaded');
            */
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`)
            };
            return response.json();
        })
        .then(data => {
            const tripData = data.tripData;
            const routeResults = data.routeResults;
            console.log("tripData: ", tripData);
            console.log("routeResults: ", routeResults);
            
            const selectedRoutes = selectOptimalRoutes(routeResults);
            generateTabs(tripData, selectedRoutes);
        })
        .catch(error => {
            console.error("Error fetching data: ", error);
        });
}

// 各日程で最も炭素排出量が少ないルートを選択
function selectOptimalRoutes(routeResults){
    return routeResults.map((dayRoutes) => {
        const routes = dayRoutes.route?.items;
        let minEmission = Infinity;
        let optimalRoute = null;

        routes.forEach((route) => {
            const emission = calculateRouteCarbonEmission(route);
            if (emission < minEmission) {
                minEmission = emission;
                optimalRoute = route;
            }
        });

        console.log(`Day${dayRoutes.day} optimalRoute: `, optimalRoute);
        return {
            day: dayRoutes.day,
            start: dayRoutes.start,
            goal: dayRoutes.goal,
            route: optimalRoute
        };
    });
}

// 各ルートの炭素排出量を計算
function calculateRouteCarbonEmission(route) {
    let totalEmission = 0;

    // 1kmあたりの炭素排出量(kg)
    const carbonEmissionsPerKm = {
        domestic_flight: 0.124,
        superexpress_train: 0.012,
        sleeper_ultraexpress: 0.025,
        ultraexpress_train: 0.025,
        express_train: 0.025,
        semiexpress_train: 0.025,
        car: 0.132,
        walk: 0
    };

    route.sections.forEach((section) => {
        if (section.type === 'move' && section.move in carbonEmissionsPerKm) {
            const emissionPerKm = carbonEmissionsPerKm[section.move];
            const distance = section.distance;
            totalEmission += emissionPerKm * (distance / 1000);
        }
    });

    console.log("totalEmission: ", totalEmission);
    return totalEmission;
}

// マップの初期化
async function initMap(startLatLng, endLatLng, mapElementId) {  
    // Google Maps API初期化
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const {LatLngBounds} = await google.maps.importLibrary("core");

    // マップの初期表示
    const bounds = new LatLngBounds();
    bounds.extend(startLatLng);
    bounds.extend(endLatLng);
  
    map = new Map(document.getElementById(mapElementId), {
      center: bounds.getCenter(),
      zoom: 10,
      mapId: "12b135f8e452a25b"
    });

    map.fitBounds(bounds);

    infowindow = new InfoWindow();
  
    return map;
}

// タブを生成、ルートを表示
function generateTabs(tripData, selectedRoutes) {
  const routeTabContainer = document.querySelector('.route-tab');
  routeTabContainer.innerHTML = '';

  tripData.tripData.forEach((dayInfo, index) => {

    // タブのラベル部分
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="route-tab" ${index === 0 ? 'checked' : ''}>${dayInfo.dayNumber}日目`;
    label.addEventListener('click', () => showTabContent(index));
   
    // タブのコンテンツ部分
    // マップ
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-contents';
    tabContent.style.display = index === 0 ? 'block' : 'none';
    tabContent.innerHTML = `
        <div id="map-${index}" class="route-map">
        </div>   
    `;

    // 検索条件
    const searchOption = document.createElement('div');
    searchOption.className = 'search-option';
    searchOption.innerHTML = `
        <h3>検索条件</h3>
            <label for="spot">スポット</label>
            /* その日スポットを巡る順番を変えられるようにする */
        <input type="submit" method="post" name="application" value="変更を適用" onclick="location.href='result.ejs'" class="button">
    `;

    // 移動手段
    const transportation = document.createElement('div');
    transportation.className = 'transportation';
    transportation.innerHTML = `
        <h3>移動手段</h3>
            <div class="public">
                <p><input type="checkbox" name="public" value="飛行機" id="domestic_flight">
                <label for="domestic_flight">飛行機</label></p>
                <p><input type="checkbox" name="public" value="新幹線" id="superexpress_train">
                <label for="superexpress_train">新幹線</label></p>
                <p><input type="checkbox" name="public" value="電車" id="sleeper_ultraexpress">
                <label for="sleeper_ultraexpress">寝台特急</label></p>
                <p><input type="checkbox" name="public" value="特急電車" id="ultraexpress_train">
                <label for="ultraexpress_train">特急電車</label></p>
                <p><input type="checkbox" name="public" value="急行電車" id="express_train">
                <label for="express_train">急行電車</label></p>
                <p><input type="checkbox" name="public" value="準急電車" id="semiexpress_train">
                <label for="semiexpress_train">準急電車</label></p>
                <p><input type="checkbox" name="public" value="自家用車" id="car_only">
                <label for="car_only">車(※こちらを選択した場合、車のみでのルートを提案します)</label></p>
            </div>
            <div class="walk">
                <dt>
                    <label for="walkSpeed">
                        <p><input type="checkbox" name="walkSpeed" value="徒歩の速度" id="walkSpeed">徒歩の速度</p>
                    </label>
                </dt>
                <dd>
                    <select name="walk-speed" id="walk-speed">
                        <option selected value="standard">普通</option>
                        <option value ="slow">遅い</option>
                        <option value ="fast">速い</option>
                    </select>
                </dd>
                <dt>
                    <label for="walkRoute">
                        <p><input type="checkbox" name="walkRoute" value="徒歩の速度" id="walkRoute">徒歩の利用ルート指定</p>
                    </label>
                </dt>
                <dd>
                    <select name="walk-route" id="walk-route">
                        <option selected value="avoid_step">階段回避</option>
                        <option value ="avoid_escalator">階段とエスカレーター回避</option>
                        <option value ="babycar">ベービーカー通行可</option>
                    </select>
                </dd>
            </div>
        <input type="submit" method="post" name="application" value="変更を適用" onclick="location.href='result.html'" class="button">
    `;

    routeTabContainer.appendChild(label);
    routeTabContainer.appendChild(tabContent);
    tabContent.appendChild(searchOption);
    tabContent.appendChild(transportation);

    const route = selectedRoutes[index];
    const startLatLng = { lat: parseFloat(route.start.lat), lng: parseFloat(route.start.lon) };
    const endLatLng = { lat: parseFloat(route.goal.lat), lng: parseFloat(route.goal.lon) };

    // マップ初期化
    map = initMap(startLatLng, endLatLng, `map-${index}`);

    // Google Maps APIを使用してルートを表示
    dispalayRouteOnMap(map, selectedRoutes[index], startLatLng, endLatLng, `map-${index}`);
  });
}

// ルート表示
async function dispalayRouteOnMap(map, route, startLatLng, endLatLng, mapContainerId) {
    // Google Maps API読み込み
    const { Map, Polyline, InfoWindow } = await google.maps.importLibrary("maps");
    const { LatLng, LatLngBounds } = await google.maps.importLibrary("core");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    // Directions Serviceの初期化
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        map: null,
    });

    // マップの初期化
    map = new Map(document.getElementById(mapContainerId), {
        center: startLatLng,
        zoom: 10,
        mapId: "12b135f8e452a25b", // 必要に応じてカスタムマップIDを設定
    });

    const bounds = new LatLngBounds();
    infowindow = new InfoWindow();

    // ポリラインデータを構築
    const polylinePath = [];
    let lastpoint = null;

    route.route.sections.forEach((section, index) => {
        if (section.type === "point") {
            if (lastpoint) {
                polylinePath.push(
                    { lat: lastpoint.lat, lng: lastpoint.lon },
                );
                polylinePath.push(
                    { lat: section.coord.lat, lng: section.coord.lon },
                );
            }

            bounds.extend(new LatLng(section.coord.lat, section.coord.lon));

            const marker = new AdvancedMarkerElement({
                position: { lat: section.coord.lat, lng: section.coord.lon },
                map: map,
                title: section.name,
            });

            // マーカークリックで詳細を表示
            marker.addListener("click", () => {
                const content = `<div>
                    <h4>${section.name}</h4>
                    ${section.stay_time ? `<p>滞在時間: ${section.stay_time}分</p>` : ""}
                </div>`;
                infowindow.setContent(content);
                infowindow.open(map, marker);
            });

            lastpoint = section.coord;
        }
    });

    // ポリラインを描画
    const polyline = new Polyline({
        path: polylinePath,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map,
    });

    polyline.setMap(map);
    map.fitBounds(bounds);
}

// 選択されたタブの内容を表示する関数
function showTabContent(selectedIndex) {
  const tabContents = document.querySelectorAll('.tab-contents');
  tabContents.forEach((content, index) => {
      content.style.display = index === selectedIndex ? 'block' : 'none';
  });
}

fetchRoutes();