let map;
let selectedVias = [];  // 経由順を格納
let tripData;  // dayNumber, arrival, departure
let selectSpots;  // 選択したスポット一覧
let routeResults;  // 各日程のルート候補
let spotGroups;  // dayNumber, arrival, departure, spots[]
let selectedRoutes;  // 選ばれたルート

function fetchRoutes() {
    fetch("/interfaceroute")
        .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`)
            };
            return response.json();
        })
        .then(data => {
            tripData = data.tripData;
            selectSpots = data.selectSpots;
            routeResults = data.routeResults;
            spotGroups = data.spotGroups;
            console.log("tripData: ", tripData);
            console.log("selectSpots: ", selectSpots);
            console.log("routeResults: ", routeResults);
            console.log("spotGroups: ",spotGroups);
            
            selectedRoutes = selectOptimalRoutes(routeResults);
            console.log("selectedRoutes: ", selectedRoutes);
            generateTabs(selectedRoutes, selectSpots, spotGroups);
        })
        .catch(error => {
            console.error("Error fetching data: ", error);
        });
}

// 1kmあたりの炭素排出量(kg)
const carbonEmissionsPerKm = {
    domestic_flight: 0.101,
    superexpress_train: 0.02,
    sleeper_ultraexpress: 0.02,
    ultraexpress_train: 0.02,
    express_train: 0.02,
    semiexpress_train: 0.02,
    local_train: 0.02,
    shuttle_bus: 0.071,
    highway_bus: 0.071,
    local_bus: 0.071,
    car: 0.128,
    walk: 0,
};

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

    route.sections.forEach((section) => {
        if (section.type === 'move' && section.move in carbonEmissionsPerKm) {
            const emissionPerKm = carbonEmissionsPerKm[section.move];
            const distance = section.distance;
            totalEmission += emissionPerKm * (distance / 1000);
        }
    });

    return totalEmission;
}
/*
// 各タブの状態を保持
const tabsState = tripData.tripData.map((dayInfo, index) => ({
    dayInfo: dayInfo,
    route: selectedRoutes[index],
    modified: false,
}));*/

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
function generateTabs(selectedRoutes, selectSpots, spotGroups) {
    const loading = document.querySelector('.js-loading');
    loading.classList.remove('js-loaded');

    const routeTabContainer = document.querySelector('.route-tab');
    routeTabContainer.innerHTML = '';

    spotGroups.forEach((dayInfo, dayIndex) => {

        // タブのラベル部分
        const label = document.createElement('label');
        label.innerHTML = `<input type="radio" name="route-tab" ${dayIndex === 0 ? 'checked' : ''}>${dayInfo.dayNumber}日目`;
        label.addEventListener('click', () => showTabContent(dayIndex, selectSpots, dayInfo.dayNumber));
    
        // タブのコンテンツ部分
        // マップ
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-contents';
        tabContent.id = `tab-${dayIndex}`;
        tabContent.style.display = dayIndex === 0 ? 'block' : 'none';
        tabContent.innerHTML = `
            <div id="map-${dayIndex}" class="route-map"></div>
        `;

        // 経由順
        const viaListId = `via-list-${dayIndex}`;
        const searchoption = document.createElement('div');
        searchoption.className = 'search-option';
        searchoption.innerHTML = `
            <h3>経由順の変更</h3>
            <p>経由したい順番でクリックしてください</p>
            <ul id="${viaListId}" class="via"></ul>
            <input id="applyChanges-${dayIndex}" type="submit" method="post" name="application" value="変更を適用" onclick="applyChanges(${dayIndex})" class="button">
        `;

        // 移動手段
        const transportation = document.createElement('div');
        transportation.className = 'transportation';
        transportation.innerHTML = `
            <h3>移動手段</h3>
                <div class="public">
                    <p>利用しない公共交通手段</p>
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
                </div>
                <div class="walk">
                    <p>徒歩の設定</p>
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
                            <p><input type="checkbox" name="walkRoute" value="徒歩の利用ルート指定" id="walkRoute">徒歩の利用ルート指定</p>
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
        const tabContentUnique = document.getElementById(`tab-${dayIndex}`);
        tabContentUnique.appendChild(searchoption);
        tabContentUnique.appendChild(transportation);

        const viaList = document.querySelector(`#via-list-${dayIndex}`);
        const viaSpots = spotGroups[dayIndex].spots;
        if (!selectedVias[dayIndex]) {
            selectedVias[dayIndex] = [];
        }
        viaSpots.forEach((spot, spotIndex) => {
            const listItem = document.createElement('li');
            listItem.className = "via-item";
            listItem.dataset.index = spotIndex;
            listItem.dataset.tab = dayIndex;
            listItem.innerHTML = `
                ${spot.spotName} <span class="order-number"></span>
            `;
            viaList.appendChild(listItem);

            listItem.addEventListener("click", () => toggleSpotSelection(dayIndex, spotIndex));
        });

        const route = selectedRoutes[dayIndex];
        const startLatLng = { lat: parseFloat(route.start.lat), lng: parseFloat(route.start.lon) };
        const endLatLng = { lat: parseFloat(route.goal.lat), lng: parseFloat(route.goal.lon) };

        // マップ初期化
        map = initMap(startLatLng, endLatLng, `map-${dayIndex}`);

        // Google Maps APIを使用してルートを表示
        dispalayRouteOnMap(map, selectedRoutes[dayIndex], startLatLng, `map-${dayIndex}`, selectSpots, dayInfo);
        loading.classList.add('js-loaded');
    });
}

// ルート表示
async function dispalayRouteOnMap(map, route, startLatLng, mapContainerId, selectSpots, dayInfo) {
    // Google Maps API読み込み
    const { Map, Polyline, InfoWindow } = await google.maps.importLibrary("maps");
    const { LatLngBounds } = await google.maps.importLibrary("core");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    const bounds = new LatLngBounds();
    let currentLatLng;
    let waypointCounter = 1;
    const infowindow = new InfoWindow();
    let prevLatLng = null;
    const usedLatLngs = {};

    // マップの初期化
    map = new Map(document.getElementById(mapContainerId), {
        center: startLatLng,
        zoom: 10,
        mapId: "12b135f8e452a25b",
    });

    // ピンとポリラインの描画
    route.route.sections.forEach((section, i) => {
        if (section.type === "point") {
            let baseLatLng = { lat: section.coord.lat, lng: section.coord.lon};

            // 同地点に複数ピンを生成する場合
            const latLngKey = `${baseLatLng.lat},${baseLatLng.lng}`;
            currentLatLng = { ...baseLatLng };
            if (usedLatLngs[latLngKey]) {
                const offsetCount = usedLatLngs[latLngKey]++;
                const offset = 0.0001 * offsetCount;
                currentLatLng.lat += offset;
                currentLatLng.lng += offset;
            } else {
                usedLatLngs[latLngKey] = 1;
            }

            bounds.extend(currentLatLng);

            // ピン生成
            const pinOptions = getPinOptions(section, waypointCounter);
            const pinElement = new PinElement(pinOptions);

            const marker = new AdvancedMarkerElement({
                map,
                position: currentLatLng,
                content: pinElement.element,
                gmpClickable: true,
            });

            marker.addListener("click", ({ domEvent, latLng }) => {
                let content = "";
                const { target } = domEvent;
                if (section.name === "start") {
                    content = `
                        <div>
                            <p>出発地: ${dayInfo.departure}</p>
                        </div>
                    `;
                } else if (section.name === "goal") {
                    const prevMove = i > 0 ? route.route.sections[i - 1] : null;
                    let emission = 0;
                    if(prevMove?.type === "move") {
                        emission = calculateEmission(prevMove.distance, prevMove.move);
                    }
                    content = `
                        <div>
                            <p>到着地: ${dayInfo.arrival}</p>
                            <p>炭素排出量: ${emission.toFixed(5)} kg</p>
                        </div>
                    `;
                } else if (section.name === "経由地") {
                    const matchedSpot = selectSpots.find(
                        (spot) =>
                            parseFloat(spot.placeLat) === parseFloat(section.coord.lat) ||
                            parseFloat(spot.placeLon) === parseFloat(section.coord.lon)
                    );
                    const prevMove = i > 0 ? route.route.sections[i - 1] : null;
                    let emission = 0;
                    if(prevMove?.type === "move") {
                        emission = calculateEmission(prevMove.distance, prevMove.move);
                        content = `
                            <div>
                                <strong>${matchedSpot?.placeName || "--"}</strong><br>
                                <p>滞在目安時間: ${section.stay_time} 分</p>
                                <p>炭素排出量: ${emission.toFixed(5)} kg</p>
                            </div>
                        `;
                    }
                } else if (Array.isArray(section.node_types)) {
                    const nextMove = i < route.route.sections.length - 1 ? route.route.sections[i + 1] : null;
                    const prevMove = i > 0 ? route.route.sections[i - 1] : null;
                    let emission = 0;
                    if (prevMove?.type === "move") {
                        emission = calculateEmission(prevMove.distance, prevMove.move);
                        if (section.node_types.includes("station")) {
                            content =`
                                <div>
                                    <p>${section.name || "--"} 駅</p>
                                    <p>${nextMove?.line_name || "--"} に乗り換え</p>
                                    <p>炭素排出量: ${emission.toFixed(5)} kg</p>
                                </div>
                            `;
                        } else {
                            content =`
                                <div>
                                    <p>${section.name}</p>
                                    <p>${nextMove?.line_name || "--"} に乗り換え</p>
                                    <p>炭素排出量: ${emission.toFixed(5)} kg</p>
                                </div>
                            `;
                        }
                    }
                }

                infowindow.close();
                infowindow.setContent(content);
                infowindow.open(marker.map, marker);
            });

            if (section.name === "経由地") waypointCounter++;

            // ポリラインの生成
            if (prevLatLng) {
                const polylineOptions = getPolylineOptions(route.route.sections[i - 1], prevLatLng, currentLatLng);
                new Polyline(polylineOptions);
            }
        }
        
        prevLatLng = { ...currentLatLng };

    });

    map.fitBounds(bounds);

    // スタート・ゴール・経由地の設定
    function getPinOptions(section, waypointCounter) {
        let pinOptions = {
            scale: 0.8,
            background: "#FFFFFF",
            borderColor: "#000000",
            glyphColor: "#FFFFFF",
        };

        if (section.name === "start") {
            pinOptions = {
                scale: 1.5,
                background: "#0000FF",
                borderColor: "#0000FF",
                glyph: "S",
                glyphColor: "#FFFFFF",
            };     
        } else if (section.name === "goal") {
            pinOptions = {
                scale: 1.5,
                background: "#FF0000",
                borderColor: "#FF0000",
                glyph: "G",
                glyphColor: "#FFFFFF",
            };
        } else if (section.name === "経由地") {
            pinOptions = {
                scale: 1.5,
                glyph: waypointCounter.toString(),
                background: "#008000",
                borderColor: "#008000",
                glyphColor: "#FFFFFF",
            };
        }

        return pinOptions;
    }

    function getPolylineOptions(section, start, end) {
        const moveType = section.type === "move" ? section.move : null;
        const colorMap = {
            walk: "#5383C3",  // 青
            domestic_flight: "#CC1237",  // 赤
            superexpress_train: "#186618",
            sleeper_ultraexpress: "#186618",
            ultraexpress_train: "#186618",
            express_train: "#186618",
            semiexpress_train: "#186618",
            rapid_train: '#186618',
            local_train: "#186618", // 緑
            shuttle_bus: "#e59c27",
            highway_bus: "#e59c27",
            local_bus: "#e59c27",  // 橙
            car: "#8C228C",  // 紫
        };

        return {
            path: [start, end],
            scale: 4,
            strokeColor: colorMap[moveType] || "#5383C3",
            strokeOpacity: 1.0,
            strokeWeight: 5,
            map,
            icons: [
                {
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 4,
                        strokeColor: colorMap[moveType] || "#5383C3",
                    },
                    offset: "100%",
                },
            ],
        };
    }

    function calculateEmission(distance, mode) {
        return distance / 1000 * (carbonEmissionsPerKm[mode] || 0);
    }
}

// 選択されたタブの内容を表示する関数
function showTabContent(tabIndex) {
  const tabContents = document.querySelectorAll('.tab-contents');
  tabContents.forEach(tab => tab.style.display = 'none');
  document.querySelector(`#tab-${tabIndex}`).style.display = 'block';

  updateOrderNumbers(tabIndex);
}

// 経由順の選択
function toggleSpotSelection(tabIndex, spotIndex) {
    if (!selectedVias[tabIndex]) {
        selectedVias[tabIndex] = [];
    }

    const tabSelectedVias = selectedVias[tabIndex];
    const spotPosition = tabSelectedVias.indexOf(spotIndex);

    if(spotPosition === -1) {
        tabSelectedVias.push(spotIndex);  // 選択
    } else {
        tabSelectedVias.splice(spotPosition, 1);  // 取消
    }

    updateOrderNumbers(tabIndex);
}

async function updateOrderNumbers(tabIndex) {
    const spotItems = document.querySelectorAll(`.via-item[data-tab="${tabIndex}"]`);
    spotItems.forEach((item) => {
        const orderNumberElement = item.querySelector(".order-number");
        if (orderNumberElement) {
            orderNumberElement.textContent = "";
        }
    });

    const tabSelectedVias = selectedVias[tabIndex] || [];
    tabSelectedVias.forEach((spotIndex, order) => {
        const spotItem = document.querySelector(`.via-item[data-index="${spotIndex}"][data-tab="${tabIndex}"]`);
        if (spotItem) {
            const orderNumberElement = spotItem.querySelector(".order-number");
            if (orderNumberElement) {
                orderNumberElement.textContent = `${order + 1}`;
            }
        }
    });
}


// 経由順の変更を適用
function applyChanges(dayIndex) {
    let viaArray = [];
    let spotGroupsDay;
    try {
        viaArray = selectedVias[dayIndex].map((spotIndex) => {
            spotGroupsDay = spotGroups[dayIndex];
            const spot = spotGroupsDay.spots[spotIndex];
            return {
                name: spot.spotName,
                lat: spot.lat,
                lon: spot.lon,
                stayTime: spot.stayTime,    
            };
        });

        console.log("spotGroupsDay: ", spotGroupsDay);
        console.log("viaArray: ", viaArray);

        // index.jsに送信
        const response = fetch("/update-via", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ spotGroupsDay, viaArray }),
        });

        console.log("Received response: ", response);

        if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const data = response.json();
        console.log("update-via: ", data);

        selectSpots = data.selectSpots;
        routeResults = data.routeResults;
        spotGroupsDay = data.spotGroupsDay;
        selectedRoutes = selectOptimalRoutes(routeResults);
        console.log("selectedRoutes: ", selectedRoutes);
        generateTabs(selectedRoutes, selectSpots, spotGroups);
    } catch (error) {
        console.error("ルート再生成エラー: ", error);
    }
}
/*
const ref = document.referrer;
// 遷移元URLによって遷移先URLを設定
if (ref.includes('/place') || ref.includes('/result')) {
  returnPlacePage();
} else {
  sendSelectSpots();
};*/

fetchRoutes();
