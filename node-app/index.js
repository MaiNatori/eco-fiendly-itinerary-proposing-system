const { session, initSession } = require('./mods/session.js');
const express = require('express');
const path = require('path');
const { default: fetch, Headers } = require('node-fetch-cjs');

require('dotenv').config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
console.log("GOOGLE_PLACES_API_KEY > ", GOOGLE_PLACES_API_KEY);

// expressのインスタンス化
const app = express();

// express session
app.use(initSession());

// ejs テンプレートエンジン
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

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
app.get('/interface', getPlaceIds);

// 選択したスポットのIDをPOST
app.post('/userselectspots', doGetUserSelectSpots);


// 関数定義
function viewDestination(req, res) {
  try {
    res.render('destination.ejs');
  } catch (error) {
    console.log(error)
  }
}

function viewSpot(req, res) {
  try {
    res.render('spot.ejs');
  } catch (error) {
    console.log(error)
  }
}

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

function viewPlace(req, res) {
  try {
    res.render('place.ejs');
  } catch (error) {
    console.log(error)
  }
}

function viewResult(req, res) {
  try {
    res.render('result.ejs');
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

async function getPlaceIds(req, res) {

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

    console.log("getPlaceIds.result > ", result);

    const placeIds = result.places.map(places => places.id);

    res.json({ places_id: placeIds });
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