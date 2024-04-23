const { session, initSession } = require('./mods/session.js');
const express = require('express');
const path = require('path');
const { default: fetch, Headers } = require('node-fetch-cjs');
const querystring = require('querystring');

require('dotenv').config();

const GOOGLE_CUSTOM_SEARCH_API_KEY = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
console.log("GOOGLE_CUSTOM_SEARCH_API_KEY > ", GOOGLE_CUSTOM_SEARCH_API_KEY);

const GOOGLE_CUSTOM_SEARCH_ENGINE_ID = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
console.log("GOOGLE_CUSTOM_SEARCH_ENGINE_ID > ", GOOGLE_CUSTOM_SEARCH_ENGINE_ID);

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
app.post('/userselectspots', doGetUserSelectSpots);
app.post('/userselecthotels', doGetUserSelectHotels);


// 目的地ページ
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

async function getDestinationSpots(req, res) {

  async function fetchCustomSearch() {

    const BASE_URL = "https://www.googleapis.com/customsearch/v1";
  
    const params = {
      'key': GOOGLE_CUSTOM_SEARCH_API_KEY, // APIキー
      'cx': GOOGLE_CUSTOM_SEARCH_ENGINE_ID, // 検索エンジンID
      // 'c2coff': "1", // 中国語の検索を無効
      // 'cr': "countryJP", // 検索結果を日本で作成されたドキュメントに限定
      //'exactTerms': "", // 検索結果内のすべてのドキュメントに含まれるフレーズを識別
      // 'fileType': "json", // 結果を指定した拡張子のファイルに制限
      // 'filter': "1", // 重複コンテンツ フィルタを有効
      // 'gl': "jp", // エンドユーザーの位置情報
      // 'hl': "ja", // ユーザー インターフェースの言語を設定
      // 'hq': "", // 指定したクエリ語句を論理AND演算子で結合されているかのようにクエリに追加
      'lr': "lang_ja", //検索対象を特定の言語に設定
      'num': 5, // 返される検索結果の数
      // 'orTerms': "", // ドキュメント内をチェックする追加の検索キーワードを指定
      'q': "横浜ロイヤルパークホテル SDGs 公式", // クエリ
    };

    console.log("fetchHotelSearch > params: \n", params);

    try {
      const queryString = new URLSearchParams(params).toString();
  
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

// 楽天トラベル施設検索APIで地区区分コードから施設情報を取得
async function getHotelDetails(req, res) {

  async function fetchHotelSearch() {

    const BASE_URL = "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426";
  
    const params = {
      'format': "json",
      'responseType': "large",
      'elements': "hotelNo,hotelName,hotelInformationUrl,hotelMinCharge,telephoneNo,access,hotelImageUrl,reviewAverage,hotelClassCode",
      'formatVersion': "2",
      'largeClassCode': "japan",
      'middleClassCode': "saitama", //都道府県 destinationページで選択されたもの
      'smallClassCode': "saitama", //市区町村 destinationページで選択されたもの
      //'detailClassCode': "A", //駅、詳細地域 destinationページで選択されたもの
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
        'key': GOOGLE_CUSTOM_SEARCH_API_KEY, // APIキー
        'cx': GOOGLE_CUSTOM_SEARCH_ENGINE_ID, // 検索エンジンID
        // 'c2coff': "1", // 中国語の検索を無効
        // 'cr': "countryJP", // 検索結果を日本で作成されたドキュメントに限定
        'exactTerms': "SDGs OR 環境保全", // 検索結果内のすべてのドキュメントに含まれるフレーズを識別
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