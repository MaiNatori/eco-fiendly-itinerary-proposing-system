const express = require('express');
const path = require('path');
const { default: fetch } = require('node-fetch');
const { Headers } = require('node-fetch').default;
// const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_KEY = "AIzaSyD6UaRw_ME-1NiWguJurxiCUPq83Q0R6lI";

//expressのインスタンス化
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//8080番ポートでサーバーを待ちの状態にする。
//またサーバーが起動したことがわかるようにログを出力する
app.listen(8080, () => {
  console.log("サーバー起動中");
});

async function fetchRestaurantViaV2TextSearch() {

  const BASE_URL = "https://places.googleapis.com/v1/places:searchText";

  const requestHeader = new Headers({
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': 'places.id',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY
  });

  const requestBody = {
      textQuery: "市ヶ谷周辺のレストラン",
      languageCode: "ja",
      maxResultCount: 20,
      // includedType: "", 定義された指定タイプに一致する場所のみに結果を制限
      // strictTypeFiltering: boolean,
      // priceLevels: [], 価格帯 UNSPECIFIED/INEXPENSIVE/MODERATE/EXPENSIVE/VERY_EXPENSIVE
  };

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
};

app.get('/', async (req, res) => {
  try {
    res.render('index.ejs');
  } catch (error) {
    console.log(error)
  }
});

app.get('/interface', async (req, res) => {
  try {
    // const result = await fetchRestaurantViaV2TextSearch();
    // const placesId = result.places.map(places => places.id);
    // res.json( {places_id: placesId} );

    // --- テスト用 ---
    // APIの無料枠使い切るの怖いので、疑似的に
    const test = {
      places_id: [
        "ChIJT3uLlGCMGGAR93pYEzgfN68",
        "ChIJlxSZ-mCMGGAR96CeYLIoCg0",
        "ChIJAQBwEWGMGGARZdl3ojfR-DY",
        "ChIJmVnECGGMGGARBRpt08Onimo",
        "ChIJY1KBOl6MGGARaO6sSubg2g8",
        "ChIJb6HtSGeMGGARn8lCdfLfu7Q",
        "ChIJmVnECGGMGGARcviNnirYt-8",
        "ChIJucopg4qNGGARAtcgsKvcv6Q",
        "ChIJqeVhN16MGGARH2KeHUoDKa0",
        "ChIJOSGkdF6MGGARh4p0aRP2h_o",
        "ChIJ7-1BdWeMGGARZt7MRFQ0onw",
        "ChIJUR5wH2GMGGARQlD0rrYQ598",
        "ChIJ5W2kGmeMGGARCHWNAnQLJnE",
        "ChIJ2bXqGmGMGGARFOVEty4fahQ",
        "ChIJCXem81-MGGARZeJZIBTRh8Q",
        "ChIJq-9ANCiNGGARdOQb0YHZDyI",
        "ChIJUR5wH2GMGGARl_ggMCghrzE",
        "ChIJw0FFtmeMGGAR0F7bhsBTRLo",
        "ChIJ1QpW2V2MGGARPVBufPKS5UU",
        "ChIJoWVltmCMGGAROk9-acBwWAQ"
      ]
    }
    res.json( test );
    // --- テスト用 ---

  } catch (error) {
    console.log(error)
  }
})
/*
//GETリクエストの設定
//'/get'でアクセスされた時に、JSONとログを出力するようにする
app.get('/searchText', (req, res) => {
  console.log('GETリクエストを受け取りました');
  fetchRestaurantViaV2TextSearch();
  res.end();
});
*/