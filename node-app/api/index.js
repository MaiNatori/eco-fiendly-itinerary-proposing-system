import { fetchRestaurantViaV2TextSearch } from "./fetch-esm.js";

// コマンドライン引数を取得
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error("コマンドライン引数が設定されていません!")
    process.exit(1);
}

// 指定された関数を呼び出す
const functionName = args[0];

// 指定された関数を実行
if(functionName === "fetchRestaurantViaV2TextSearch") {
    console.log("新バージョンのTextSearchによるレストラン情報取得")
    fetchRestaurantViaV2TextSearch()
}