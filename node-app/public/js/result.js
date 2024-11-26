let map;

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
            const selectSpots = data.selectSpots;
            const routeResults = data.routeResults;
            console.log("tripData: ", tripData);
            console.log("selectSpots: ", selectSpots);
            console.log("routeResults: ", routeResults);
            
            const selectedRoutes = selectOptimalRoutes(routeResults);
            generateTabs(tripData, selectedRoutes, selectSpots);
        })
        .catch(error => {
            console.error("Error fetching data: ", error);
        });
}

// 1kmあたりの炭素排出量(kg)
const carbonEmissionsPerKm = {
    domestic_flight: 0.124,
    superexpress_train: 0.012,
    sleeper_ultraexpress: 0.025,
    ultraexpress_train: 0.025,
    express_train: 0.025,
    semiexpress_train: 0.025,
    local_train: 0.025,
    shuttle_bus: 0.09,
    highway_bus: 0.09,
    local_bus: 0.09,
    car: 0.132,
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

    route.sections.forEach((section) => {
        if (section.type === 'move' && section.move in carbonEmissionsPerKm) {
            const emissionPerKm = carbonEmissionsPerKm[section.move];
            const distance = section.distance;
            totalEmission += emissionPerKm * (distance / 1000);
        }
    });

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
function generateTabs(tripData, selectedRoutes, selectSpots) {
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
    dispalayRouteOnMap(map, selectedRoutes[index], startLatLng, `map-${index}`, selectSpots, dayInfo);
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
                                <p>滞在時間: ${section.stay_time} 分</p>
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
function showTabContent(selectedIndex) {
  const tabContents = document.querySelectorAll('.tab-contents');
  tabContents.forEach((content, index) => {
      content.style.display = index === selectedIndex ? 'block' : 'none';
  });
}

fetchRoutes();
