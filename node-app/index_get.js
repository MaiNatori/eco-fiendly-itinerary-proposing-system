const express = require('express');
const { default: fetch } = require('node-fetch');
const { Headers } = require('node-fetch').default;
// const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_KEY = "AIzaSyD6UaRw_ME-1NiWguJurxiCUPq83Q0R6lI";

//expressのインスタンス化
const app = express();

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

      console.log(response)
  } catch (error) {
      console.log(error)
  }
};

//GETリクエストの設定
//'/get'でアクセスされた時に、JSONとログを出力するようにする
app.get('/searchText', (req, res) => {
  console.log('GETリクエストを受け取りました');
  fetchRestaurantViaV2TextSearch();
  res.end();
});