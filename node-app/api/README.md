# Google Maps Place APIを使用する方法

# 前提
- バージョン
    - Node.js(v19.0.1)
    - NPM(8.19.2)

## 準備
1. このリポジトリをクローンする（zipダウンロードでも可）
2. `cd exmaple_google_maps_places_api`でフォルダ移動
3. `npm install`をターミナルで実行
4. ディレクトリ直下（package.jsonがある階層）に`.envファイル`を作成し、`GOOGLE_PLACES_API_KEY=(APIキーをコピペ)`を記述する
5. 以下いずれかのコマンドを実行すると、ターミナルに結果が表示されます.
    - `npm run v1Text` (旧バージョンのTextSearch)
    - `npm run v1Near` (旧バージョンのNearBySearch)
    - `npm run v1Detail` (旧バージョンのPlaceDetail)
    - `npm run v2Text` (新バージョンのTextSearch)
    - `npm run v2Near`(新バージョンのNearBySearch)
    - `npm run v2Detail` (新バージョンのPlaceDetail)

## 概要
- ファイル構成
    - index.js　エントリーファイル（関数の呼び出しを行っている）
    - fetch.js　実際にGoogle Places APIに対してリクエスト処理を行っている関数がまとめてある
        - 各関数の中身をコピペすれば他の場所で使えます
- v1とv2について
    - v1とv2で情報を取る際のインターフェースが異なる
    - v1 
        - 旧バージョンのPlace APIを使用
        - 基本、GETで取得、パラメーターはクエリパラメーターを使用
    - v2
        - 新バージョンのPlace APIを使用
        - 基本、POSTで取得、リクエストヘッダーとリクエストボディを使用

## ざっくり処理内容について

- 各関数内で行っていること
    1. リクエストする際に必要な情報を設定する
        - クエリパラメーター
        - ヘッダー
        - リクエストボディ等
        - リクエスト先のURL
        - この辺りの必要な情報は公式ドキュメント読んだ方が正確
    2. try/catch文内で実際にGoogle Places APIへリクエスト実行
        - fetch()を使用する処理は非同期処理になるため、awaitで処理が終わるまで待っている
        - 途中エラーが発生したら、catch文内の処理が実行される
- 読んでおいた方が良い公式リファレンス
    - 特に、新旧バージョンにおけるTypesパラメーターの違い、新バージョンにおけるFieldMaskの値についてはドキュメントを読んだ方が良い
    - 旧バージョン
        - [NearBySearchのリクエストに必要な情報](https://developers.google.com/maps/documentation/places/web-service/search-nearby?hl=ja)
        - [SearchTextのリクエストに必要な情報](https://developers.google.com/maps/documentation/places/web-service/search-text?hl=ja)
        - [旧バージョンにおけるsupport Typeの種類](https://developers.google.com/maps/documentation/places/web-service/supported_types?hl=ja)
    - 新バージョン
        - [各APIで使用するFieldMaskの値](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing?hl=ja#preferred-textsearch)
        - [新バージョンにおけるsupport Typeの種類](https://developers.google.com/maps/documentation/places/web-service/place-types?hl=ja#table-a)

