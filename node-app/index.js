const { session, initSession } = require('./mods/session.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { default: fetch, Headers } = require('node-fetch-cjs');
const querystring = require('querystring');
const crypto = require('crypto');
const bodyParser = require('body-parser');

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

// ejs テンプレートエンジン
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

// メソッド
// HTML表示
app.get('/destination', viewDestination);
app.get('/destination-search', viewDestinationSearch);
app.get('/spot', viewSpot);
app.get('/hotel', viewHotel);
app.get('/place', viewPlace);
app.get('/result', viewResult);

// API
app.get('/interfacedestination', getDestinationSpots);
app.get('/interfacespots', getSpotPlaceIds);
app.get('/interfacehotels', getHotelDetails);
app.get('/get-hotels', sendSelectedHotels);

// 選択したIDをPOST
app.post('/userselectpurpose', doGetUserSelectPurpose);
app.post('/userselectplaces', doGetUserSelectPlaces);
app.post('/userselectspots', doGetUserSelectSpots);
app.post('/userselecthotels', doGetUserSelectHotels);

let dataFromScripts = {};
let selectedSpots = [];
let selectedHotels = [];

app.post('/data', (req, res) => {
  const { source, data } = req.body;
  dataFromScripts[source] = data;
  res.sendStatus(200);
});

// 目的地ページの表示
function viewDestination(req, res) {
  try {
    res.render('destination-modal.ejs');
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
      const queryString = querystring.stringify(params);

      const signature = getBase64Signature(`/v1/${NAVITIME_SID}/spot/list?${queryString}`, NAVITIME_SIGNATURE_KEY);

      const urlWithParams = await fetch(`${BASE_URL}?${queryString}&signature=${signature}`);

      const response = await urlWithParams.json();

      return response;

    } catch (error) {
      console.log(error);
    }
  }

  try {
    const allResults = await Promise.all(req.session.selectpurpose.map(purpose => {
      const params = {
        'add': "detail",
        'limit': 100
      };

      if (purpose.id) {
        params['category'] = purpose.id;
      } else if (purpose.word) {
        params['word'] = purpose.word;
      }

      return fetchNavitimeAPI(params);
    }));
    const mergedResults = [].concat(...allResults);
    res.json({ results: mergedResults });
  } catch (error) {
    console.log(error);
  }
  
  function getBase64Signature(data, key) {
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(data);
    const signature = hmac.digest('base64').replace(/\+/g, '-').replace(/\//g, '_'); //Base64エンコードされた署名文字列をURLセーフにする
    return signature;
  }
}

// 選択した目的地(都道府県名・エリア名)
async function doGetUserSelectPlaces(req, res) {
  selectedPlaces = req.body; // 選択されたスポットのオブジェクト配列
  console.log('received selected places:', selectedPlaces);

  // const sess = new Session(req, res); // session利用準備
  // sess.set("selectplaces", selectedPlaces); // sessionのselectspotsというキーにselectedPlacesを保管
  req.session.selectplaces = selectedPlaces;
  req.session.save();
  console.log("session.selectplaces > ", req.session.selectplaces);

  res.json({ result: true });
}

// スポットページの表示
function viewSpot(req, res) {
  try {
    res.render('spot.ejs');
  } catch (error) {
    console.log(error)
  }
}

// スポット情報の取得
async function getSpotPlaceIds(req,res) {
  console.log('req.session:', req.session);
  const selectedPlaces = req.session.selectplaces;
  const prefecture = selectedPlaces.prefectureName;
  const area = selectedPlaces.areaName;

  try {
    const result = await fetchRestaurantViaV2TextSearch(prefecture, area);

    console.log("getSpotPlaceIds.result > ", result);

    const placeIds = result.places.map(places => places.id);

    res.json({ places_id: placeIds });
  } catch (error) {
    console.log(error)
  }
}

async function fetchRestaurantViaV2TextSearch(prefecture, area) {
  const BASE_URL = "https://places.googleapis.com/v1/places:searchText";

  const requestHeader = new Headers({
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': 'places.id',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY
  });

  const requestBody = {
      textQuery: `${prefecture} ${area} 観光スポット`,
      languageCode: "ja",
      maxResultCount: 5,
      // includedType: "", 定義された指定タイプに一致する場所のみに結果を制限
      // strictTypeFiltering: boolean,
      // priceLevels: [], 価格帯 UNSPECIFIED/INEXPENSIVE/MODERATE/EXPENSIVE/VERY_EXPENSIVE
  };
  console.log("fetchRestaurantViaV2TextSearch > requestBody: \n", requestBody);

  try {
    const rawResponse = await fetch(`${BASE_URL}`, {
        method: "POST",
        headers: requestHeader,
        body: JSON.stringify(requestBody)
    })
    const response = await rawResponse.json()
    console.log("getSpotPlaceIds.result > ", response);
    return response;
  } catch (error) {
      console.log(error)
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

// ホテルページの表示
function viewHotel(req, res) {
  // const sess = new Session(req, res); // session利用準備
  // sess.check("selectspots"); // 念のためsession.selectspotsを確認
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

    const params = {
      'format': "json",
      'responseType': "large",
      'elements': "hotelNo,hotelName,hotelInformationUrl,hotelMinCharge,telephoneNo,access,hotelImageUrl,reviewAverage,hotelClassCode",
      'formatVersion': "2",
      'largeClassCode': "japan",
      'middleClassCode': prefectureId, //都道府県 destinationページで選択されたもの
      'smallClassCode': smallAreaId, //市区町村 destinationページで選択されたもの
      'detailClassCode': detailAreaId, //駅、詳細地域 destinationページで選択されたもの
      'page': 1,
      'hits': "10",
      'applicationId': RAKUTEN_APP_ID
    };

    console.log("fetchHotelSearch > params: \n", params);

    try {
      const queryString = querystring.stringify(params);
  
      const urlWithParams = await fetch(`${BASE_URL}?${queryString}`)
    
      const response = await urlWithParams.json()

      return response;

    } catch (error) {
      console.log(error)
    }
  }

  try {
    const result = await fetchHotelSearch();
    const hotels = result.hotels;

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
        console.log(error)
      }
    }

    // ホテルごとにSDGsに関する情報を検索して抽出
    const hotelPromises = hotels.map(async hotelGroup => {
      const hotelInfo = {
        hotelBasicInfo: hotelGroup[0].hotelBasicInfo,
        hotelDetailInfo: hotelGroup[1].hotelDetailInfo
      };
      const sdgsInfo = await fetchHotelSDGs(hotelInfo.hotelBasicInfo.hotelName);
      if (sdgsInfo && sdgsInfo.items && sdgsInfo.items.length > 0) {
        return { hotelInfo, sdgsInfo };
      } else {
        return null; // SDGs関連の情報が見つからない場合はnullを返す
      }
    });

    // すべてのホテルのSDGsに関する情報を取得
    const hotelsWithSDGs = await Promise.all(hotelPromises);

    // nullを除外し、hotel_Rakuten.jsに結果を送信
    const filteredHotels = hotelsWithSDGs.filter(hotel => hotel !== null);
    console.log(filteredHotels);
    res.json({ results: filteredHotels });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
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

// 出発地・到着地入力ページ
function viewPlace(req, res) {
  try {
    res.render('place.ejs', { data: dataFromScripts, selectedSpots, selectedHotels });
  } catch (error) {
    console.log(error)
  }
}

function sendSelectedHotels(req, res) {
  console.log("selecthotels: ",req.session.selecthotels);
  res.json({ selectHotels: req.session.selecthotels });
}


// 結果表示ページ
function viewResult(req, res) {
  try {
    res.render('result.ejs');
  } catch (error) {
    console.log(error)
  }
}

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error/error.ejs');
});