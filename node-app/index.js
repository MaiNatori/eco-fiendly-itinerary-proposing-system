const { session, initSession } = require('./mods/session.js');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { default: fetch, Headers } = require('node-fetch-cjs');
const querystring = require('querystring');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const { totalmem } = require('os');

require('dotenv').config();

const NAVITIME_SID = process.env.NAVITIME_SID;
console.log("NAVITIME_SID > ", NAVITIME_SID);

const NAVITIME_SIGNATURE_KEY = process.env.NAVITIME_SIGNATURE_KEY;
console.log("NAVITIME_SIGNATURE_KEY > ", NAVITIME_SIGNATURE_KEY);

const GOOGLE_CUSTOM_SEARCH_API_KEY_HOTEL = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY_HOTEL;
console.log("GOOGLE_CUSTOM_SEARCH_API_KEY_HOTEL > ", GOOGLE_CUSTOM_SEARCH_API_KEY_HOTEL);

const GOOGLE_CUSTOM_SEARCH_ENGINE_ID_HOTEL = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID_HOTEL;
console.log("GOOGLE_CUSTOM_SEARCH_ENGINE_ID_HOTEL > ", GOOGLE_CUSTOM_SEARCH_ENGINE_ID_HOTEL);

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
console.log("GOOGLE_PLACES_API_KEY > ", GOOGLE_PLACES_API_KEY);

const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID;
console.log("RAKUTEN_APP_ID > ", RAKUTEN_APP_ID);

// expressのインスタンス化
const app = express();

// express session
app.use(initSession());
app.use(bodyParser.json());

// ejsテンプレートエンジン
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//8080番ポートでサーバー待ち
const PORT = 8080;

app.listen(PORT, () => {
  console.log("サーバー起動中 #" + PORT, `http://localhost:${PORT}`);
});

// ejs表示
app.get('/destination', viewDestination);
app.get('/destination-search', viewDestinationSearch);
app.get('/spot', viewSpot);
app.get('/hotel', viewHotel);
app.get('/place', viewPlace);
app.get('/result', viewResult);

// API
app.get('/interfacedestination', getDestinationSpots);
app.get('/interfacespots', getSpotLists);
app.get('/interfacehotels', getHotelDetails);
app.get('/getelements', sendSelected);
app.get('/interfaceroute', generateRoute);

// 選択内容をPOST
app.post('/userselectpurpose', doGetUserSelectPurpose);
app.post('/userselectplaces', doGetUserSelectPlaces);
app.post('/userselectspots', doGetUserSelectSpots);
app.post('/userselecthotels', doGetUserSelectHotels);
app.post('/userselecttripdata', doGetUserSelectTripData);

let dataFromScripts = {}; // 選択内容の保存先
let selectedSpots = []; // 選択したスポット
let selectedHotels = []; // 選択したホテル

// POSTリクエストの処理
app.post('/data', (req, res) => {
  const { source, data } = req.body;
  dataFromScripts[source] = data;
  res.sendStatus(200);
});

// エラー
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error/error.ejs');
})

// リクエスト間隔の設定
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// リクエスト数の管理
let requestCount = 0;

// NAVITIME APIに使用するBase64エンコードされた署名文字列を取得する関数
function getBase64Signature(data, key) {
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(data);
  const signature = hmac.digest('base64').replace(/\+/g, '-').replace(/\//g, '_'); //Base64エンコードされた署名文字列をURLセーフにする
  return signature;
}

/* destinationページ */
// 目的地ページの表示
function viewDestination(req, res) {
  try {
    res.render('destination.ejs');
  } catch (error) {
    console.log(error)
  }
}

// 選択した旅行目的
async function doGetUserSelectPurpose(req, res) {
  selectedPurpose = req.body; // 選択された目的

  // const sess = new Session(req, res); // session利用準備
  // sess.set("selectplaces", selectedPlaces); // sessionのselectspotsというキーにselectedPlacesを保管
  req.session.selectpurpose = selectedPurpose;
  req.session.save();
  console.log("session.selectpurpose > ", req.session.selectpurpose);

  res.json({ result: true });
}

// 目的から目的地を探すページ
function viewDestinationSearch(req, res) {
  try {
    const purposeValues = req.session.selectpurpose.map(purpose => purpose.value || purpose.word);
    res.render('destination-search.ejs', { purposeValues: purposeValues });
  } catch (error) {
    console.log(error)
  }
}

// 目的に沿った観光地を取得
async function getDestinationSpots(req, res) {
  console.log('req.session.selectPurpose:', req.session.selectpurpose);

  async function fetchNavitimeAPI(params) {
    const BASE_URL = `http://dp.navitime.biz/v1/${NAVITIME_SID}/spot/list`;

    try {
      if (requestCount >= 150) {
        await delay(60000); // 60秒待機
        requestCount = 0; // 分間リクエスト数をリセット
      }
      const queryString = querystring.stringify(params);

      const signature = getBase64Signature(`/v1/${NAVITIME_SID}/spot/list?${queryString}`, NAVITIME_SIGNATURE_KEY);

      const urlWithParams = await fetch(`${BASE_URL}?${queryString}&signature=${signature}`);

      const response = await urlWithParams.json();

      requestCount++;  // リクエスト数をカウント

      return response;

    } catch (error) {
      console.log(error);
    }
  }

  try {
    const allResults = [];
    for (const purpose of req.session.selectpurpose) {
      if (purpose.id) {
        const ids = purpose.id.split(',');

        for (const id of ids) {
          const params = {
            'category': id.trim(),
            'add': "detail",
            'limit': 100
          };
          
          const result = await fetchNavitimeAPI(params);
          if (result) allResults.push(result);
        }
      } else if (purpose.word) {
        const params = {
          'word': purpose.word,
          'add': "detail",
          'limit': 100
        };

        const result = await fetchNavitimeAPI(params);
        if (result) allResults.push(result);
      }

      // リクエストが150に達した場合、60秒待機
      if (requestCount >= 150) {
        await delay(60000);
        requestCount = 0;
      }
    }

    const mergedResults = [].concat(...allResults.filter(result => result));
    res.json({ results: mergedResults });

  } catch (error) {
    console.log(error);
  }
}

// 選択した目的地(都道府県名・エリア名)
async function doGetUserSelectPlaces(req, res) {
  selectedPlaces = req.body;
  req.session.selectplaces = selectedPlaces;
  req.session.save();
  console.log("session.selectplaces > ", req.session.selectplaces);
  res.json({ result: true });
}

/* spotページ */
// スポットページの表示
function viewSpot(req, res) {
  try {
    res.render('spot.ejs');
  } catch (error) {
    console.log(error)
  }
}

// スポット情報の取得
// Geocoding APIで選択した地名の緯度経度を取得
async function getGeocode(location) {
  const response = await axios.get (`https://maps.googleapis.com/maps/api/geocode/json`, {
    params: {
      address: location,
      key: GOOGLE_PLACES_API_KEY
    }
  });
  if (response.data.status === 'OK') {
    return {
      lat: response.data.results[0].geometry.location.lat,
      lng: response.data.results[0].geometry.location.lng
    };
  } else {
    throw new Error(`Geocode was not successful for the following reason: ${response.data.status}`);
  }
}

// 住所コードを利用してスポットを検索する
async function fetchNavitimeSpotAPI(params) {
  
  const BASE_URL = `http://dp.navitime.biz/v1/${NAVITIME_SID}/spot/list`;

  try {
    const queryString = querystring.stringify(params);
    const signature = getBase64Signature(`/v1/${NAVITIME_SID}/spot/list?${queryString}`, NAVITIME_SIGNATURE_KEY);
    const urlWithParams = await fetch(`${BASE_URL}?${queryString}&signature=${signature}`);
    const response = await urlWithParams.json();
    return response;
  } catch (error) {
    console.log(error);
  }
}

// 2地点間の距離を計算する関数
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球の半径(km)
  const dLat = (lat2 - lat1)  * Math.PI / 180;
  const dLon = (lon2 - lon1)  * Math.PI / 180;
  const a = 
    0.5 - Math.cos(dLat) / 2 + 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// スポット情報の取得
async function getSpotLists(req, res) {
  const selectedPlaces = req.session.selectplaces;
  const prefectureName = selectedPlaces.prefectureName;
  const areaNames = selectedPlaces.areaName.split('・');
  const combinedNames = areaNames.map(area => `${prefectureName} ${area}`);
  console.log('combinedNames: ', combinedNames);

  try {
    const geocodeLocations = await Promise.all(combinedNames.map(name => getGeocode(name)));
    const extendedLocations = geocodeLocations.flatMap(location => getExtendedCoordinates(location));
    const allGeocodeLocations = [...geocodeLocations, ...extendedLocations];
    console.log('All Geocode Locations: ',allGeocodeLocations)

    const categories = {
      food: { nos: ['0310005'], additionalNos: ['03'], target: 10, results: [] },
      spot: { nos: ['07', '0604001', '0211'], additionalNos: ['01'], target: 9, results: [] }
    };

    let processedCodes = new Set();

    // すべてのリクエストを並行して実行
    const searchPromises = allGeocodeLocations.map(geocodeLocation => {
      return [
        searchFoodCategories(geocodeLocation, categories.food, processedCodes),
        searchSpotCategories(geocodeLocation, categories.spot, processedCodes)
      ];
    }).flat();

    await Promise.all(searchPromises);

    // 重複削除
    const allResults = [...new Map([...categories.food.results, ...categories.spot.results].map(item => [item.code, item])).values()];
    res.json({ results: allResults });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

  // 東西南北に10km進んだ地点の緯度経度を計算
  function getExtendedCoordinates(baseLocation) {
    const lat = baseLocation.lat;
    const lng = baseLocation.lng;

    const deltaLat = 0.090133729745762; // 10km分の緯度
    const deltaLng = 0.10966404715491394; // 10km分の経度

    return [
      { lat, lng },                               // 基準地点
      { lat: lat + deltaLat, lng },               // 北
      { lat: lat - deltaLat, lng },               // 南
      { lat, lng: lng + deltaLng },               // 東
      { lat, lng: lng - deltaLng }                // 西
    ];
  }

  // foodカテゴリ
  async function searchFoodCategories(geocodeLocation, category, processedCodes) {
    try {
      await searchSpot(category.nos[0], geocodeLocation, category, 10000, processedCodes);
      if (category.results.length < category.target) {
        await searchSpot(category.additionalNos[0], geocodeLocation, category, 5000, processedCodes, category.target - category.results.length);
      }
    } catch (error){
      console.error('Error fetching food spots:', error);
    }
  }

  // spotカテゴリ
  async function searchSpotCategories(geocodeLocation, category, processedCodes) {
    try {
      for (let i = 0; i < category.nos.length; i++) {
        const radius = category.nos[i] === '07' ? 5000 : 10000;
        await searchSpot(category.nos[i], geocodeLocation, category, radius, processedCodes, 3);
        if (category.results.length >= category.target) break;
      }

      if (category.results.length < category.target) {
        await searchSpot(category.additionalNos[0], geocodeLocation, category, 5000, processedCodes, category.target - category.results.length);
      }
    } catch (error) {
      console.error('Error fetching spots:', error);
    }
  }

  async function searchSpot(categoryNo, geocodeLocation, category, radius, processedCodes, limit) {

    const params = {
      'category': categoryNo,
      'coord': `${geocodeLocation.lat},${geocodeLocation.lng}`,
      'radius': radius,
      'limit': limit,
      'offset': 0,
      'add': "detail"
    };

    const result = await fetchNavitimeSpotAPI(params);
    if (result && result.items && result.items.length > 0) {
      const filteredItems = result.items.filter(item => {
        const distance = calculateDistance(geocodeLocation.lat, geocodeLocation.lng, item.coord.lat, item.coord.lon);
        return distance <= radius / 1000 && !processedCodes.has(item.code);  
      });

      filteredItems.forEach(item => {
        processedCodes.add(item.code);
        item.category = categoryNo;

        if (!category.results.some(existingItem => existingItem.code === item.code)) {
          category.results.push(item);
        }
      });
    }
  }
}

// 選択したスポット
function doGetUserSelectSpots(req, res) {
  selectedSpots = req.body; // 選択されたスポットのオブジェクト配列
  console.log('received selected spots:', selectedSpots);

  // const sess = new Session(req, res); // session利用準備
  // sess.set("selectspots", selectedSpots); // sessionのselectspotsというキーにselectedSpotsを保管
  req.session.selectspots = selectedSpots;
  req.session.save();
  console.log("session.selectspots > ", req.session.selectspots);

  res.json({ result: true });
}

/* hotelページ */
// ホテルページの表示
function viewHotel(req, res) {
  console.log("session.selectspots > ", req.session.selectspots);

  try {
    res.render('hotel.ejs');
  } catch (error) {
    console.log(error)
  }
}

// 楽天トラベル施設検索APIで宿泊施設情報を取得
async function getHotelDetails(req, res) {

  const  { prefectureId, areaId } = req.session.selectplaces;
  if (!prefectureId || !areaId) {
    return res.status(400).json({ error: 'No selection found in session'});
  }

  async function fetchHotelSearch() {

    const BASE_URL = "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426";
  
    let smallAreaId = "";
    let detailAreaId = "";

    if (areaId.includes("-")) {
      const areaParts = areaId.split("-");
      smallAreaId = areaParts[0];
      detailAreaId = areaParts[1];
    } else {
      smallAreaId = areaId;
    }

    async function requestHotels(responseType) {
      const params = {
        'responseType': responseType,
        'formatVersion': "2",
        'datumType': "1",
        'largeClassCode': "japan",
        'middleClassCode': prefectureId, //都道府県 destinationページで選択されたもの
        'smallClassCode': smallAreaId, //市区町村 destinationページで選択されたもの
        'detailClassCode': detailAreaId, //駅、詳細地域 destinationページで選択されたもの
        'applicationId': RAKUTEN_APP_ID
      };

      console.log("fetchHotelSearch > params: \n", params);

      try {
        await delay(1000); //APIのリクエスト制限による1秒の遅延
        const queryString = querystring.stringify(params);
        const urlWithParams = await fetch(`${BASE_URL}?${queryString}`)
        const response = await urlWithParams.json()
        return response;
      } catch (error) {
        console.log(error);
        return null;
      }
    }

    try {
      // まずlargeでリクエスト
      let response = await requestHotels("large");
      // エラーが出たらmiddleで再度リクエスト
      if (response && response.hotels) {
        return response;
      } else {
        console.error(`No hotels found with responseType "large", retrying with "middle"`);
        response = await requestHotels("middle");
        return response;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  try {
    const result = await fetchHotelSearch();
    if (!result) {
      return res.status(500).json({ error: 'Failed to fetch hotel data' });
    }
    const hotels = result.hotels;
    if (!hotels || hotels.length === 0) {
      return res.status(404).json({ error: 'No hotels found' });
    }
    
    const hotelPromises = hotels.map(async hotelGroup => {
      const hotelInfo = {
        hotelBasicInfo: hotelGroup[0].hotelBasicInfo,
        hotelDetailInfo: hotelGroup[2]?.hotelDetailInfo || null // hotelDetailInfoがない場合はnull
      };
      await delay(1000);
      const sdgsInfo = await fetchHotelSDGs(hotelInfo.hotelBasicInfo.hotelName);
      if (sdgsInfo && sdgsInfo.items && sdgsInfo.items.length > 0) {
        return { hotelInfo, sdgsInfo };
      } else {
        return { hotelInfo, sdgsInfo: null }; // SDGs関連の情報が見つからない場合はnullを返す
      }

    })

    // すべてのホテルのSDGsに関する情報を取得
    const hotelsWithSDGs = await Promise.all(hotelPromises);

    // SDGsに関するサイトがあるホテルが5か所未満の場合はすべてのホテルを表示
    const filteredHotels = hotelsWithSDGs.filter(hotel => hotel.sdgsInfo !== null);
    if (filteredHotels.length >= 5) {
      console.log("Displaying SDGs related hotels");
      res.json({ results: filteredHotels });
    } else {
      console.log("Displaying all hotels as SDGs related hotels are less than 5");
      res.json({ results: hotelsWithSDGs });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }

  async function fetchHotelSDGs(hotelName) {
    console.log(hotelName);

    const BASE_URL = "https://www.googleapis.com/customsearch/v1";
  
    const params = {
      'key': GOOGLE_CUSTOM_SEARCH_API_KEY_HOTEL, // APIキー
      'cx': GOOGLE_CUSTOM_SEARCH_ENGINE_ID_HOTEL, // 検索エンジンID
      'exactTerms': "SDGs OR 環境保全 OR 環境に優しい OR 地産地消 OR 環境に配慮 OR エコ OR エシカル OR 持続可能 OR オーガニック", // 検索結果内のすべてのドキュメントに含まれるフレーズを識別
      'lr': "lang_ja", //検索対象を特定の言語に設定
      'num': 5, // 返される検索結果の数
      'q': `${hotelName} 公式`, // クエリ
    };

    try {
      const queryString = querystring.stringify(params);
    
      const urlWithParams = await fetch(`${BASE_URL}?${queryString}`)
    
      const response = await urlWithParams.json()

      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

// 選択したホテル
function doGetUserSelectHotels(req, res) {
  selectedHotels = req.body; // 選択されたスポットのオブジェクト配列
  console.log('received data:', selectedHotels);

  // const sess = new Session(req, res); // session利用準備
  // sess.set("selecthotels", selectedHotels); // sessionのselecthotelsというキーにselectedHotelsを保管
  req.session.selecthotels = selectedHotels;
  req.session.save();
  console.log("session.selecthotels > ", req.session.selecthotels);

  res.json({ result: true });
}

/* placeページ */
// 出発地・到着地入力ページ
function viewPlace(req, res) {
  try {
    res.render('place.ejs', { data: dataFromScripts, selectedSpots, selectedHotels });
  } catch (error) {
    console.log(error)
  }
}

function sendSelected(req, res) {
  const selectSpots = req.session.selectspots;
  const selectHotels = req.session.selecthotels;
  console.log("selectspots: ", selectSpots);
  console.log("selecthotels: ", selectHotels);
  res.json({ selectSpots, selectHotels });
}

//選択した各日程の出発地・到着地
function doGetUserSelectTripData(req, res) {
  const { tripDays, tripData } = req.body;
  req.session.tripdata = { tripDays, tripData };
  console.log('Received trip data:', req.session.tripdata);
  res.json({ result: true });
}


/* resultページ */
// 結果表示ページ
function viewResult(req, res) {
  try {
    res.render('result.ejs');
  } catch (error) {
    console.log(error)
  }
}

// ルート生成
async function generateRoute(req, res) {

  const selectSpots = req.session.selectspots;
  const selectHotels = req.session.selecthotels;
  const tripData = req.session.tripdata;
  
  try {
    const tripDays = tripData.tripData;
    const routeResults = [];

    // 初日出発地の緯度経度を取得
    const firstDepartureLatLon = await getLatLonFromAddress(tripDays[0].departure);

    // スポットの振り分け
    const start = firstDepartureLatLon;
    const goal = await getHotelLatLon(selectHotels, tripDays[tripDays.length - 1].arrival);
    const spotGroups = await assignSpotsToClosestsDays(selectSpots, tripDays, start, goal);
    console.log("spotGroups: ", spotGroups);

    for (const day of tripDays) {
      let start, goal;

      // 各日程の出発地到着地の緯度経度を設定
      if (day.dayNumber === 1) {
        start = firstDepartureLatLon;
        goal = await getHotelLatLon(selectHotels, day.arrival);
      } else if (day.dayNumber === tripData.tripDays) {
        start = await getHotelLatLon(selectHotels, day.departure);
        goal = firstDepartureLatLon;
      } else {
        start = await getHotelLatLon(selectHotels, day.departure);
        goal = await getHotelLatLon(selectHotels, day.arrival);
      }

      const params = {
        start: `${start.lat},${start.lon}`,
        goal: `${goal.lat},${goal.lon}`,
        'goal-time': "2024-11-24T19:00", // 検索時の日時と時間を取得
        order: "walk_distance",
        'move-priority': "gas",
        'via-type': 1,
        via: []
      };

      // グループ内のスポット・出発地・到着地間それぞれの移動時間と距離を計算
      const spotRoutes = await calculateTravelTimesAndDistances(spotGroups[day.dayNumber - 1].spots, start, goal);
      console.log(`Day ${day.dayNumber}spotRoutes: `, spotRoutes)

      // 経由する順番を決める
      const viaSpots = await determineViaSpots(spotGroups[day.dayNumber - 1], spotRoutes, start, spotGroups);
      console.log(`Day ${day.dayNumber}viaSpots: `, viaSpots);

      // 経由地パラメーターを設定
      const viaArray = viaSpots.map(viaSpot => {
        let maxStayTime;  // stayTimeの最大値を設定

        if (typeof viaSpot.stayTime === 'string' && viaSpot.stayTime.includes('-')) {
          const times = viaSpot.stayTime.split('-').map(t => parseInt(t, 10));
          maxStayTime = Math.max(...times);  // 範囲の場合
        } else if (typeof viaSpot.stayTime === 'number' || !isNaN(parseInt(viaSpot.stayTime, 10))) {
          maxStayTime = parseInt(viaSpot.stayTime, 10);  // 単一の場合
        } else {
          maxStayTime = 90;
        }

        return { lat: viaSpot.lat, lon: viaSpot.lon, 'stay-time': maxStayTime };
      });

      params.via = JSON.stringify(viaArray);

      // ルート探索APIを実行
      const routeResponse = await fetchRouteAPI(params);

      // ルート結果を格納
      routeResults.push({
        day: day.dayNumber,
        start: { lat: start.lat, lon: start.lon },
        goal: { lat: goal.lat, lon: goal.lon },
        route: routeResponse,
      });
    }

    console.log("routeResults: ", routeResults);
    for (const s of routeResults) {
      console.log("route: ", s.route);
    }
    res.json({ tripData, routeResults });
  } catch (error) {
    console.log(error);
  }
}

// 住所から緯度・経度を取得(初日出発地と最終日到着地)
async function getLatLonFromAddress(address) {
  const BASE_URL = `http://dp.navitime.biz/v1/${NAVITIME_SID}/address/list`;
  const params = {
    'word': address
  };
  try {
    const queryString = querystring.stringify(params);
    const signature = getBase64Signature(`/v1/${NAVITIME_SID}/address/list?${queryString}`, NAVITIME_SIGNATURE_KEY);
    const urlWithParams = await fetch(`${BASE_URL}?${queryString}&signature=${signature}`);
    const response = await urlWithParams.json();
    if (response.items && response.items.length > 0) {
      const coord = response.items[0].coord;
      return { lat: coord.lat, lon: coord.lon };
    }
  } catch (error) {
    console.log(error);
  }
}

// 宿泊施設の緯度経度を取得
async function getHotelLatLon(selectHotels, hotelName) {
  const hotel = selectHotels.find(h => h.hotelName === hotelName);
  return hotel ? { lat: hotel.hotelLat, lon: hotel.hotelLon } : null;
}

// スポットの情報を再取得して、スポットを各日程に振り分けグループ化
async function assignSpotsToClosestsDays(selectSpots, tripDays, start, goal) {
  const spotsInfo = await Promise.all(selectSpots.map(s => getSpotsInfo(s.placeCode)));
  const tripDataWithSpots = tripDays.map(day => ({
    ...day,
    spots: []
  }));

  spotsInfo.forEach(spot => {
    const spotItem = spot.items[0];
    const spotDetails = {
      spotName: spotItem.name,
      lat: spotItem.coord.lat,
      lon: spotItem.coord.lon,
      stayTime: null,
      businessHours: null,
      category: spotItem.categories[0].code || null
    };

    if (spotItem.details && spotItem.details[0].texts) {
      spotItem.details[0].texts.forEach(text => {
        if (text.label === "滞在目安時間") {
          spotDetails.stayTime = text.value;
        }
        if (text.label === "時間") {
          spotDetails.businessHours = text.value;
        }
      });
    }

    let closestDay = tripDataWithSpots[0];  // そのスポットに行く日程
    let minDistance = Infinity;  // 最短距離

    tripDataWithSpots.forEach(day => {
      const dayGoalLatLon = day.arrival === spotItem.name ? goal : null;
      let distance;

      if (dayGoalLatLon) {
        distance = calculateDistance(spotDetails.lat, spotDetails.lon, dayGoalLatLon.lat, dayGoalLatLon.lon);
      } else {
        const dayDepartureLatLon = start;
        distance = calculateDistance(spotDetails.lat, spotDetails.lon, dayDepartureLatLon.lat, dayDepartureLatLon.lon);
      }

      if((distance < minDistance) || (distance === minDistance && day.spots.length < closestDay.spots.length)) {
        minDistance = distance;
        closestDay = day;
      }
    });

    closestDay.spots.push(spotDetails);

  });

  return tripDataWithSpots;

}

// スポット情報の再取得
async function getSpotsInfo(code) {
  const BASE_URL = `http://dp.navitime.biz/v1/${NAVITIME_SID}/spot`;

  const params = {
    'code': code,
    'add': "detail"
  };

  try {
    const queryString = querystring.stringify(params);
    const signature = getBase64Signature(`/v1/${NAVITIME_SID}/spot?${queryString}`, NAVITIME_SIGNATURE_KEY);
    const urlWithParams = await fetch(`${BASE_URL}?${queryString}&signature=${signature}`);
    const response = await urlWithParams.json();
    return response;
  } catch (error) {
    console.log(error);
  }
}

// グループ内のスポット・出発地・到着地、各地点間の移動時間と距離を計算
async function calculateTravelTimesAndDistances(spots, start, goal) {
  const spotRoutes = [];

  for (const spot of spots) {    
    const toSpotParams = {
      start: JSON.stringify({ lat: start.lat, lon: start.lon }),
      goal: JSON.stringify({ lat: spot.lat, lon: spot.lon }),
    };
    const fromSpotParams = {
      start: JSON.stringify({ lat: spot.lat, lon: spot.lon }),
      goal: JSON.stringify({ lat: goal.lat, lon: goal.lon }),
    };
    const toSpotRoute = await fetchRouteAPI(toSpotParams);
    const fromSpotRoute = await fetchRouteAPI(fromSpotParams);  
    spotRoutes.push({
      routeType: "toSpot",
      from: { lat: start.lat, lon: start.lon, name: "start" },
      to: { lat: spot.lat, lon: spot.lon, name: spot.spotName },
      routeData: toSpotRoute,
    });
    spotRoutes.push({
      routeType: "fromSpot",
      from: { lat: spot.lat, lon: spot.lon, name: spot.spotName },
      to: { lat: goal.lat, lon: goal.lon, name: "goal" },
      routeData: fromSpotRoute,
    });  

    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) {
        const startSpot = spots[i];
        const endSpot = spots[j];
        const spotToSpotParams1 = {
          start: JSON.stringify({ lat: startSpot.lat, lon: startSpot.lon }),
          goal: JSON.stringify({ lat: endSpot.lat, lon: endSpot.lon }),
        };
        const spotToSpotRoute1 = await fetchRouteAPI(spotToSpotParams1);
        spotRoutes.push({
          routeType: "spotToSpot",
          from: { lat: startSpot.lat, lon: startSpot.lon, name: startSpot.spotName },
          to: { lat: endSpot.lat, lon: endSpot.lon, name: endSpot.spotName },
          routeData: spotToSpotRoute1,
        });
        const spotToSpotParams2 = {
          start: JSON.stringify({ lat: endSpot.lat, lon: endSpot.lon }),
          goal: JSON.stringify({ lat: startSpot.lat, lon: startSpot.lon }),
        };
        const spotToSpotRoute2 = await fetchRouteAPI(spotToSpotParams2);
        spotRoutes.push({
          routeType: "spotToSpot",
          from: { lat: endSpot.lat, lon: endSpot.lon, name: endSpot.spotName },
          to: { lat: startSpot.lat, lon: startSpot.lon, name: startSpot.spotName },
          routeData: spotToSpotRoute2,
        });

      }
    }
  }

  return spotRoutes;

}

// ルート探索API
async function fetchRouteAPI(params) {
  const BASE_URL = `http://dp.navitime.biz/v1/${NAVITIME_SID}/route`;
  try {
    const queryString = querystring.stringify(params);
    const signature = getBase64Signature(`/v1/${NAVITIME_SID}/route?${queryString}`, NAVITIME_SIGNATURE_KEY);
    const urlWithParams = await fetch(`${BASE_URL}?${queryString}&signature=${signature}`);
    const response = await urlWithParams.json();
    return response;
  } catch (error) {
    console.log(error);
  }
}

// 経由地の順番を決定
async function determineViaSpots(spotGroups, spotRoutes, start, allDaysSpotGroups) {
  const viaSpots = [];
  const startHour = 10;  // 仮出発時間
  const endHour = 19;  // 仮到着時間
  let currentHour = startHour;  // 現在の時間
  let currentLocation = start;

  // スポットを近い順に並び替え
  let remainingSpots = [...(spotGroups.spots || [])].sort((a, b) => {
    const aRoute = spotRoutes.find(route => 
      route.from.lat === currentLocation.lat && route.from.lon === currentLocation.lon && route.to.lat === a.lat && route.to.lon === a.lon
    );

    const bRoute = spotRoutes.find(route =>
      route.from.lat === currentLocation.lat && route.from.lon === currentLocation.lon && route.to.lat === b.lat && route.to.lon === b.lon
    );

    const aTime = aRoute ? aRoute.routeData.items.reduce((sum, item) => sum + item.summary.move.time, 0) : Infinity;
    const bTime = bRoute ? bRoute.routeData.items.reduce((sum, item) => sum + item.summary.move.time, 0) : Infinity;
    return aTime - bTime;
  });
  
  const unvisitedSpots = [];  // 入りきらなかったスポットを格納するリスト

  // 全てのスポットを巡る
  while (remainingSpots.length > 0) {
    let nextSpot;

    // 昼食時間帯のスポット選択
    if (currentHour >= 11 && currentHour <= 13) {
      nextSpot = remainingSpots.find(spot => spot.category?.startsWith("03"));
    }

    // 最も近いスポットを選択
    if (!nextSpot) {
      nextSpot = remainingSpots.reduce((closestSpot, spot) => {
        const route = spotRoutes.find(r =>
          r.from.lat === currentLocation.lat && r.from.lon === currentLocation.lon && r.to.lat === spot.lat && r.to.lon === spot.lon
        );
        const travelTime = route ? route.routeData.items.reduce((sum, item) => sum + item.summary.move.time, 0) : Infinity;
        return (!closestSpot || travelTime < closestSpot.travelTime) ? { spot, travelTime } : closestSpot;
      }, null)?.spot;
    }

    // 次のスポットへのルート取得
    const routeToNextSpot = spotRoutes.find(route => 
      route.from.lat === currentLocation.lat && route.from.lon === currentLocation.lon && route.to.lat === nextSpot.lat && route.to.lon === nextSpot.lon
    );

    // 移動時間と滞在時間の計算
    const travelTime = routeToNextSpot.routeData.items.reduce((sum, item) => sum + item.summary.move.time, 0) / 60;
    const stayTime = nextSpot.stayTime ?? (nextSpot.category?.startsWith("03") ? 90 : 120);
    const totalVisitTime = travelTime + stayTime / 60;

    // 到着時間が終了時間を超えたらループ終了
    if (currentHour + totalVisitTime > endHour) {
      unvisitedSpots.push(nextSpot);
      remainingSpots = remainingSpots.filter(spot => spot !== nextSpot);
      continue;
    }

    // 経由地に追加
    viaSpots.push({
      lat: nextSpot.lat,
      lon: nextSpot.lon,
      stayTime: stayTime
    });

    // 時間と現在位置を更新
    currentHour += totalVisitTime;
    currentLocation = nextSpot;

    // 訪問済みスポットをremainingSpotsから削除
    remainingSpots = remainingSpots.filter(spot => spot !== nextSpot);
  }

  // 入りきらなかったスポットは最も少ないスポット数の日程に追加
  if (unvisitedSpots.length > 0) {
    const dayWithFewestSpots = allDaysSpotGroups.reduce((fewestDay, currentDay) =>
      (currentDay.spots.length < fewestDay.spots.length ? currentDay : fewestDay)
    );
    dayWithFewestSpots.spots.push(...unvisitedSpots);
  }

  return viaSpots;
}