const { session, initSession } = require('./mods/session.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { default: fetch, Headers } = require('node-fetch-cjs');
const querystring = require('querystring');

require('dotenv').config();

const GOOGLE_CUSTOM_SEARCH_API_KEY_DESTINATION = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY_DESTINATION;
console.log("GOOGLE_CUSTOM_SEARCH_API_KEY_DESTINATION > ", GOOGLE_CUSTOM_SEARCH_API_KEY_DESTINATION);

const GOOGLE_CUSTOM_SEARCH_ENGINE_ID_DESTINATION = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID_DESTINATION;
console.log("GOOGLE_CUSTOM_SEARCH_ENGINE_ID_DESTINATION > ", GOOGLE_CUSTOM_SEARCH_ENGINE_ID_DESTINATION);

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
app.get('/', viewDestination);
app.get('/destination', viewDestination);
app.get('/destination-search', viewDestinationSearch);
app.get('/spot', viewSpot);
app.get('/hotel', viewHotel);
app.get('/place', viewPlace);
app.get('/result', viewResult);

// Places API
app.get('/interfacespots', getSpotPlaceIds);
app.get('/interfacedestination', getDestinationSpots);
app.get('/interfacehotels', getHotelDetails);

// 選択したIDをPOST
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

// 目的から目的地を探すページ
function viewDestinationSearch(req, res) {
  try {
    res.render('destination-search.ejs');
  } catch (error) {
    console.log(error)
  }
}

// 目的に沿った観光地を取得
async function getDestinationSpots(req, res) {

  async function fetchCustomSearch() {

    const BASE_URL = "https://www.googleapis.com/customsearch/v1";
  
    const params = {
      'key': GOOGLE_CUSTOM_SEARCH_API_KEY_DESTINATION, // APIキー
      'cx': GOOGLE_CUSTOM_SEARCH_ENGINE_ID_DESTINATION, // 検索エンジンID
      // 'c2coff': "1", // 中国語の検索を無効
      // 'cr': "countryJP", // 検索結果を日本で作成されたドキュメントに限定
      // 'exactTerms': "", // 検索結果内のすべてのドキュメントに含まれるフレーズを識別
      // 'fileType': "json", // 結果を指定した拡張子のファイルに制限
      // 'filter': "1", // 重複コンテンツ フィルタを有効
      // 'gl': "jp", // エンドユーザーの位置情報
      // 'hl': "ja", // ユーザー インターフェースの言語を設定
      // 'hq': "", // 指定したクエリ語句を論理AND演算子で結合されているかのようにクエリに追加
      'lr': "lang_ja", //検索対象を特定の言語に設定
      'num': 5, // 返される検索結果の数
      // 'orTerms': "", // ドキュメント内をチェックする追加の検索キーワードを指定
      'q': "海水浴場 HP", // クエリ
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
    const result = await fetchCustomSearch();

    console.log("getDestinationSearch.result > \n", result);

    res.json({ results: result });  

  } catch (error) {
    console.log(error)
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
  const selectedPlaces = req.session.selectplaces;
  const prefecture = selectedPlaces.prefecture;
  const area = selectedPlaces.area;

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
      textQuery: `SDGs 観光スポット ${prefecture} ${area}`,
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
/*
// hotel_areaClass.jsonの読み込み
fs.readFile(path.join(__dirname, 'hotel_areaClass.json'), 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading the JSON file: ", err);
    return;
  }
  try {
    hotelAreaClassData = JSON.parse(data);
  } catch (parseError) {
    console.error("Error parsing the JSON file: ", parseError);
  }
});

// 都道府県とエリア名を元にclassCodeを取得する関数
function getClassCode(prefecture, area) {
  const largeClass = hotelAreaClassData.areaClasses.largeClasses.find(lc => lc[0].largeClassName === '日本');
  if (!largeClass) return null;

  const middleClass = largeClass[1].middleClasses.find(mc => mc.middleClass[0].middleClassName === prefecture);
  if (!middleClass) return null;

  for (const smallClassGroup of middleClass.middleClass[1].smallClasses) {
      const smallClass = smallClassGroup.smallClass.find(sc => sc.smallClassName === area);
      if (smallClass) {
          return {
              largeClassCode: largeClass[0].largeClassCode,
              middleClassCode: middleClass.middleClass[0].middleClassCode,
              smallClassCode: smallClass.smallClassCode,
              detailClassCode: smallClass.detailClasses ? smallClass.detailClasses[0].detailClassCode : null
          };
      }
  }
  console.log("large:",large,"middle:",middle,"small:",small,"detail:",detail);
  return null;
}
*/
// 楽天トラベル施設検索APIで宿泊施設情報を取得
async function getHotelDetails(req, res) {
  /*const { prefecture, area } = req.body;
  const classCode = getClassCode(prefecture, area);

  if(!classCode) {
    return res.status(400).json({ error: 'Invalid area selection' });
  }*/

  async function fetchHotelSearch() {

    const BASE_URL = "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426";
  
    const params = {
      'format': "json",
      'responseType': "large",
      'elements': "hotelNo,hotelName,hotelInformationUrl,hotelMinCharge,telephoneNo,access,hotelImageUrl,reviewAverage,hotelClassCode",
      'formatVersion': "2",
      'largeClassCode': "japan",//classCode.largeClassCode,
      'middleClassCode': "hokkaido",//classCode.middleClassCode, //都道府県 destinationページで選択されたもの
      'smallClassCode': "sapporo",//classCode.smallClassCode, //市区町村 destinationページで選択されたもの
      'detailClassCode': "A",//classCode.detailClassCode, //駅、詳細地域 destinationページで選択されたもの
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
        // 'c2coff': "1", // 中国語の検索を無効
        // 'cr': "countryJP", // 検索結果を日本で作成されたドキュメントに限定
        'exactTerms': "SDGs OR 環境保全 OR 環境に優しい OR 地産地消 OR 環境に配慮 OR エコ OR エシカル OR 持続可能 OR オーガニック", // 検索結果内のすべてのドキュメントに含まれるフレーズを識別
        // 'fileType': "json", // 結果を指定した拡張子のファイルに制限
        // 'filter': "1", // 重複コンテンツ フィルタを有効
        // 'gl': "jp", // エンドユーザーの位置情報
        // 'hl': "ja", // ユーザー インターフェースの言語を設定
        // 'hq': "", // 指定したクエリ語句を論理AND演算子で結合されているかのようにクエリに追加
        'lr': "lang_ja", //検索対象を特定の言語に設定
        'num': 5, // 返される検索結果の数
        // 'orTerms': "", // ドキュメント内をチェックする追加の検索キーワードを指定
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