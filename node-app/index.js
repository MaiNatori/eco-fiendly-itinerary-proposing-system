const { session, initSession } = require('./mods/session.js');
const express = require('express');
const path = require('path');
const { default: fetch, Headers } = require('node-fetch-cjs');
const querystring = require('querystring');

require('dotenv').config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
console.log("GOOGLE_PLACES_API_KEY > ", GOOGLE_PLACES_API_KEY);

const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID;
console.log("RAKUTEN_APP_ID > ", RAKUTEN_APP_ID);

// expressのインスタンス化
const app = express();

// express session
app.use(initSession());

// ejs テンプレートエンジン
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

//8080番ポートでサーバー待ち
const PORT = 8080;

app.listen(PORT, () => {
  console.log("サーバー起動中 #" + PORT, `http://localhost:${PORT}`);
});

// メソッド
// HTML表示
app.get('/', viewDestination);
app.get('/destination', viewDestination);
app.get('/spot', viewSpot);
app.get('/hotel', viewHotel);
app.get('/place', viewPlace);
app.get('/result', viewResult);

// Places API
app.get('/interfacespots', getSpotPlaceIds);
//app.get('/interfacehotels', getHotelPlaceIds);
app.get('/interfacehotels', getHotelDetails);

// 選択したIDをPOST
app.post('/userselectspots', doGetUserSelectSpots);
app.post('/userselecthotels', doGetUserSelectHotels);


// 目的地ページ
function viewDestination(req, res) {
  try {
    res.render('destination.ejs');
  } catch (error) {
    console.log(error)
  }
}

// スポットページ
function viewSpot(req, res) {
  try {
    res.render('spot.ejs');
  } catch (error) {
    console.log(error)
  }
}

function doGetUserSelectSpots(req, res) {
  const placeIds = req.body; // 選択されたスポットのplace_id配列
  console.log('received data:', placeIds);

  // const sess = new Session(req, res); // session利用準備
  // sess.set("selectspots", placeIds); // sessionのselectspotsというキーにplaceIdsを保管
  req.session.selectspots = placeIds;
  req.session.save();
  console.log("session.selectspots > ", req.session.selectspots);

  res.json({ result: true });
}

async function getSpotPlaceIds(req, res) {

  async function fetchRestaurantViaV2TextSearch() {

    const BASE_URL = "https://places.googleapis.com/v1/places:searchText";
  
    const requestHeader = new Headers({
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.id',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY
    });
  
    const requestBody = {
        textQuery: "SDGs 市ヶ谷 レストラン",
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
      
      return response;
    } catch (error) {
        console.log(error)
    }
  }

  try {
    const result = await fetchRestaurantViaV2TextSearch();

    console.log("getSpotPlaceIds.result > ", result);

    const placeIds = result.places.map(places => places.id);

    res.json({ places_id: placeIds });
    } catch (error) {
      console.log(error)
    }
}

// ホテルページ
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

function doGetUserSelectHotels(req, res) {
  const placeIds = req.body; // 選択されたスポットのplace_id配列
  console.log('received data:', placeIds);

  // const sess = new Session(req, res); // session利用準備
  // sess.set("selectspots", placeIds); // sessionのselectspotsというキーにplaceIdsを保管
  req.session.selecthotels = placeIds;
  req.session.save();
  console.log("session.selecthotels > ", req.session.selecthotels);

  res.json({ result: true });
}
/* ホテルのPlace ID
async function getHotelPlaceIds(req, res) {

  async function fetchHotelViaV2TextSearch() {

    const BASE_URL = "https://places.googleapis.com/v1/places:searchText";
  
    const requestHeader = new Headers({
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.id',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY
    });
  
    const requestBody = {
        textQuery: "SDGs 東京 ホテル",
        languageCode: "ja",
        maxResultCount: 20,
        //includedType: "lodging", 定義された指定タイプに一致する場所のみに結果を制限
        // strictTypeFiltering: boolean,
        // priceLevels: [], 価格帯 UNSPECIFIED/INEXPENSIVE/MODERATE/EXPENSIVE/VERY_EXPENSIVE
    };

    console.log("fetchHotelViaV2TextSearch > requestBody: \n", requestBody);
  
    try {
      const rawResponse = await fetch(`${BASE_URL}`, {
          method: "POST",
          headers: requestHeader,
          body: JSON.stringify(requestBody)
      })

      const response = await rawResponse.json()
      
      return response;
    } catch (error) {
        console.log(error)
    }
  }

  try {
    const result = await fetchHotelViaV2TextSearch();

    console.log("getHotelPlaceIds.result > ", result);

    const placeIds = result.places.map(places => places.id);

    res.json({ places_id: placeIds });
    } catch (error) {
      console.log(error)
    }
}
*/

// 楽天トラベル施設検索APIで地区区分コードから施設番号を検索、施設番号から施設情報を取得
async function getHotelDetails(req, res) {

  // 施設番号の検索
  async function fetchHotelSearch() {

    const BASE_URL = "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426";
  
    const params = {
      'format': "json",
      'elements': "hotelNo",
      'formatVersion': "2",
      'largeClassCode': "japan",
      'middleClassCode': "tokyo", //都道府県 destinationページで選択されたもの
      'smallClassCode': "tokyo", //市区町村 destinationページで選択されたもの
      'detailClassCode': "A", //駅、詳細地域 destinationページで選択されたもの
      'page': 1,
      'hits': "10",
      'applicationId': RAKUTEN_APP_ID
    }

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

  // 施設番号の抽出、配列化
  const result = await fetchHotelSearch();
  console.log("getFacilityNumbers.result >");
  const flattenedHotels = result.hotels.flat(); // ネストされた配列をフラットに
  const facilityNumbers = flattenedHotels.map(hotel => hotel.hotelBasicInfo.hotelNo);
  console.log(facilityNumbers);

  // 施設情報の検索
  async function fetchHotelDetail(hotelNo) {

    const BASE_URL = "https://app.rakuten.co.jp/services/api/Travel/HotelDetailSearch/20170426";
  
    const params = {
      'format': "json",
      'elements': "hotelNo,hotelName,hotelInformationUrl,planListUrl,hotelKanaName,hotelMinCharge,address1,address2,telephoneNo,access,hotelImageUrl,reviewAverage,hotelClassCode",
      'formatVersion': "2",
      'hotelNo': hotelNo,
      'page': 1,
      'hits': "10",
      'applicationId': RAKUTEN_APP_ID
    }

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
    const resultsArray = [];
    for (const hotelNo of facilityNumbers) {
      const resultDetail = await fetchHotelDetail(hotelNo);
      console.log("hotelNo: ", hotelNo);
      console.log("getHotelDetails.result > ", resultDetail);
      resultsArray.push(resultDetail);
    }
    res.json({ results: resultsArray });
  }
  catch (error) {
    console.log(error)
  }

}

// 出発地・到着地入力ページ
function viewPlace(req, res) {
  try {
    res.render('place.ejs');
  } catch (error) {
    console.log(error)
  }
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