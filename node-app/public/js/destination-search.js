// index.jsにアクセスしてplace_idを取得する
function inqueryDestinationSpots() {
  fetch("/interfacedestination")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        };
      return response.json();
      })
      .then(data => {
        console.log("result> ",data.results);
        viewSearchResult(data.results);
      })
      .catch(error => {
        console.error("Error fetching data: ", error);
      });
}

// 結果の表示
function viewSearchResult(results) {
  console.log("results > ", results.items);
  const info = results.items;
  const target = document.querySelector(".search-result"); // 表示先

  // 各ホテル情報を取り出す
  info.forEach((spotInfo) => {
  
    // 表示
    const div = document.createElement("div");
      div.classList.add("result-contents");

    const img = document.createElement("img");
      img.src = (spotInfo.details[0].images[0].path !== undefined) ? `${spotInfo.details[0].images[0].path}` : "/images/noimage_spot.jpg";
      img.alt = "スポットの画像";

    const h2 = document.createElement("h2");
      h2.innerText = spotInfo.name;

    const p = document.createElement("p");
      p.innerHTML = spotInfo.details[0].key_value_texts.紹介;

    div.appendChild(img);
    div.appendChild(h2);
    div.appendChild(p);
    target.appendChild(div);
    
  });
}
/*
// 既存の表示内容を消去する関数
function clearSearchResults(){
  const target = document.querySelector(".search-candidate");
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }
}*/

// プルダウン
const prefectures = [
    { id: 'hokkaido', name: '北海道' },
    { id: 'aomori', name: '青森県' },
    { id: 'iwate', name: '岩手県' },
    { id: 'miyagi', name: '宮城県' },
    { id: 'akita', name: '秋田県' },
    { id: 'yamagata', name: '山形県' },
    { id: 'hukushima', name: '福島県' },
    { id: 'ibaragi', name: '茨城県' },
    { id: 'tochigi', name: '栃木県' },
    { id: 'gunma', name: '群馬県' },
    { id: 'saitama', name: '埼玉県' },
    { id: 'tiba', name: '千葉県' },
    { id: 'tokyo', name: '東京都' },
    { id: 'kanagawa', name: '神奈川県' },
    { id: 'niigata', name: '新潟県' },
    { id: 'toyama', name: '富山県' },
    { id: 'ishikawa', name: '石川県' },
    { id: 'hukui', name: '福井県' },
    { id: 'yamanashi', name: '山梨県' },
    { id: 'nagano', name: '長野県' },
    { id: 'gihu', name: '岐阜県' },
    { id: 'shizuoka', name: '静岡県' },
    { id: 'aichi', name: '愛知県' },
    { id: 'mie', name: '三重県' },
    { id: 'shiga', name: '滋賀県' },
    { id: 'kyoto', name: '京都府' },
    { id: 'osaka', name: '大阪府' },
    { id: 'hyogo', name: '兵庫県' },
    { id: 'nara', name: '奈良県' },
    { id: 'wakayama', name: '和歌山県' },
    { id: 'tottori', name: '鳥取県' },
    { id: 'simane', name: '島根県' },
    { id: 'okayama', name: '岡山県' },
    { id: 'hiroshima', name: '広島県' },
    { id: 'yamaguchi', name: '山口県' },
    { id: 'tokushima', name: '徳島県' },
    { id: 'kagawa', name: '香川県' },
    { id: 'ehime', name: '愛媛県' },
    { id: 'kouchi', name: '高知県' },
    { id: 'hukuoka', name: '福岡県' },
    { id: 'saga', name: '佐賀県' },
    { id: 'nagasaki', name: '長崎県' },
    { id: 'kumamoto', name: '熊本県' },
    { id: 'ooita', name: '大分県' },
    { id: 'miyazaki', name: '宮崎県' },
    { id: 'kagoshima', name: '鹿児島県' },
    { id: 'okinawa', name: '沖縄県' }
];

const places = [
    {category: '北海道', id: 'sapporo-A', name: '札幌・新札幌・琴似'},
    {category: '北海道', id: 'sapporo-B', name: '大通公園・時計台・狸小路'},
    {category: '北海道', id: 'sapporo-C', name: 'すすきの・中島公園'},
    {category: '北海道', id: 'jozankei', name: '定山渓'},
    {category: '北海道', id: 'wakkanai', name: '稚内・留萌・利尻・礼文'},
    {category: '北海道', id: 'abashiri', name: '網走・紋別・北見・知床'},
    {category: '北海道', id: 'kushiro', name: '釧路・阿寒・川湯・根室'},
    {category: '北海道', id: 'obihiro', name: '帯広・十勝'},
    {category: '北海道', id: 'hidaka', name: '日高・えりも'},
    {category: '北海道', id: 'furano', name: '富良野・美瑛・トマム'},
    {category: '北海道', id: 'asahikawa', name: '旭川・層雲峡・旭岳'},
    {category: '北海道', id: 'chitose', name: '千歳・支笏・苫小牧・滝川・夕張・空知'},
    {category: '北海道', id: 'otaru', name: '小樽・キロロ・積丹・余市'},
    {category: '北海道', id: 'niseko', name: 'ルスツ・ニセコ・倶知安'},
    {category: '北海道', id: 'hakodate', name: '函館・湯の川・大沼・奥尻'},
    {category: '北海道', id: 'noboribetsu', name: '洞爺・室蘭・登別'},
    {category: '青森県', id: 'aomori', name: '青森・浅虫温泉'},
    {category: '青森県', id: 'tsugaru', name: '津軽半島・五所川原'},
    {category: '青森県', id: 'ntsugaru', name: '白神山地・西津軽'},
    {category: '青森県', id: 'hirosaki', name: '弘前・黒石'},
    {category: '青森県', id: 'towadako', name: '八甲田・十和田湖・奥入瀬'},
    {category: '青森県', id: 'hachinohe', name: '八戸・三沢・七戸十和田'},
    {category: '青森県', id: 'shimokita', name: '下北・大間・むつ'},
    {category: '岩手県', id: 'morioka', name: '盛岡'},
    {category: '岩手県', id: 'shizukuishi', name: '雫石'},
    {category: '岩手県', id: 'appi', name: '安比高原・八幡平・二戸'},
    {category: '岩手県', id: 'kuji', name: '宮古・久慈・岩泉'},
    {category: '岩手県', id: 'ofunato', name: '釜石・大船渡・陸前高田'},
    {category: '岩手県', id: 'kitakami', name: '北上・花巻・遠野'},
    {category: '岩手県', id: 'ichinoseki', name: '奥州・平泉・一関'},
    {category: '宮城県', id: 'sendai', name: '仙台・多賀城・名取'},
    {category: '宮城県', id: 'akiu', name: '秋保・作並'},
    {category: '宮城県', id: 'naruko', name: '鳴子・古川・くりこま高原'},
    {category: '宮城県', id: 'matsushima', name: '松島・塩釜・石巻・南三陸・気仙沼'},
    {category: '宮城県', id: 'shiroishi', name: '白石・宮城蔵王'},
    {category: '秋田県', id: 'akita', name: '秋田'},
    {category: '秋田県', id: 'noshiro', name: '能代・男鹿・白神'},
    {category: '秋田県', id: 'odate', name: '大館・鹿角・十和田大湯・八幡平'},
    {category: '秋田県', id: 'tazawa', name: '角館・大曲・田沢湖'},
    {category: '秋田県', id: 'yuzawa', name: '湯沢・横手'},
    {category: '秋田県', id: 'honjo', name: '由利本荘・鳥海山'},
    {category: '山形県', id: 'yamagata', name: '山形・蔵王・天童・上山'},
    {category: '山形県', id: 'yonezawa', name: '米沢・赤湯・高畠・長井'},
    {category: '山形県', id: 'sagae', name: '寒河江・月山'},
    {category: '山形県', id: 'mogami', name: '尾花沢・新庄・村山'},
    {category: '山形県', id: 'shonai', name: '酒田・鶴岡・湯野浜・温海'},
    {category: '福島県', id: 'fukushima', name: '福島・二本松'},
    {category: '福島県', id: 'aizu', name: '会津若松・喜多方'},
    {category: '福島県', id: 'bandai', name: '猪苗代・表磐梯'},
    {category: '福島県', id: 'urabandai', name: '磐梯高原・裏磐梯'},
    {category: '福島県', id: 'koriyama', name: '郡山・磐梯熱海'},
    {category: '福島県', id: 'minami', name: '南会津・下郷・只見・檜枝岐'},
    {category: '福島県', id: 'nakadori', name: '白河・須賀川'},
    {category: '福島県', id: 'hamadori', name: 'いわき・南相馬・相馬'},
    {category: '茨城県', id: 'mito', name: '水戸・笠間'},
    {category: '茨城県', id: 'oarai', name: '大洗・ひたちなか'},
    {category: '茨城県', id: 'hitachi', name: '日立・北茨城・奥久慈'},
    {category: '茨城県', id: 'tsukuba', name: 'つくば・土浦・取手'},
    {category: '茨城県', id: 'yuki', name: '古河・結城・筑西・常総'},
    {category: '茨城県', id: 'kashima', name: '鹿嶋・神栖・潮来・北浦'},
    {category: '栃木県', id: 'utsunomiya', name: '宇都宮・さくら'},
    {category: '栃木県', id: 'nikko', name: '日光・中禅寺湖・奥日光・今市'},
    {category: '栃木県', id: 'kinugawa', name: '鬼怒川・川治・湯西川・川俣'},
    {category: '栃木県', id: 'nasu', name: '那須・板室・黒磯'},
    {category: '栃木県', id: 'shiobara', name: '塩原・矢板・大田原・西那須野'},
    {category: '栃木県', id: 'mashiko', name: '真岡・益子・茂木'},
    {category: '栃木県', id: 'koyama', name: '小山・足利・佐野・栃木'},
    {category: '群馬県', id: 'maebashi', name: '前橋・赤城'},
    {category: '群馬県', id: 'ikaho', name: '伊香保温泉・渋川'},
    {category: '群馬県', id: 'manza', name: '万座･嬬恋･北軽井沢'},
    {category: '群馬県', id: 'kusatsu', name: '草津温泉・白根'},
    {category: '群馬県', id: 'shimaonsen', name: '四万温泉'},
    {category: '群馬県', id: 'numata', name: '水上・猿ヶ京・沼田'},
    {category: '群馬県', id: 'oze', name: '尾瀬・丸沼'},
    {category: '群馬県', id: 'kiryu', name: '伊勢崎・太田・館林・桐生'},
    {category: '群馬県', id: 'takasaki', name: '高崎'},
    {category: '群馬県', id: 'fujioka', name: '富岡・藤岡・安中・磯部温泉'},
    {category: '埼玉県', id: 'saitama', name: '大宮・浦和・川口・上尾'},
    {category: '埼玉県', id: 'kasukabe', name: '草加・越谷・春日部・羽生'},
    {category: '埼玉県', id: 'kumagaya', name: '熊谷・深谷・本庄'},
    {category: '埼玉県', id: 'kawagoe', name: '川越・東松山・志木・和光'},
    {category: '埼玉県', id: 'tokorozawa', name: '所沢・狭山・飯能'},
    {category: '埼玉県', id: 'chichibu', name: '秩父・長瀞'},
    {category: '千葉県', id: 'chiba', name: '千葉'},
    {category: '千葉県', id: 'keiyo', name: '舞浜・浦安・船橋・幕張'},
    {category: '千葉県', id: 'kashiwa', name: '松戸・柏'},
    {category: '千葉県', id: 'narita', name: '成田空港・佐倉'},
    {category: '千葉県', id: 'choshi', name: '銚子・旭・九十九里・東金・茂原'},
    {category: '千葉県', id: 'sotobo', name: '鴨川・勝浦・御宿・養老渓谷'},
    {category: '千葉県', id: 'tateyama', name: '南房総・館山・白浜・千倉'},
    {category: '千葉県', id: 'uchibo', name: '市原・木更津・君津・富津・鋸南'},
    {category: '東京都', id: 'tokyo-A', name: '東京駅・銀座・秋葉原・東陽町・葛西'},
    {category: '東京都', id: 'tokyo-B', name: '新橋・汐留・浜松町・お台場'},
    {category: '東京都', id: 'tokyo-C', name: '赤坂・六本木・霞ヶ関・永田町'},
    {category: '東京都', id: 'tokyo-D', name: '渋谷・恵比寿・目黒・二子玉川'},
    {category: '東京都', id: 'tokyo-E', name: '品川・大井町・蒲田・羽田空港'},
    {category: '東京都', id: 'tokyo-F', name: '新宿・中野・荻窪・四谷'},
    {category: '東京都', id: 'tokyo-G', name: '池袋・赤羽・巣鴨・大塚'},
    {category: '東京都', id: 'tokyo-H', name: '東京ドーム・飯田橋・御茶ノ水'},
    {category: '東京都', id: 'tokyo-I', name: '上野・浅草・錦糸町・新小岩・北千住'},
    {category: '東京都', id: 'nishi', name: '立川・八王子・町田・府中・吉祥寺'},
    {category: '東京都', id: 'okutama', name: '奥多摩・青梅・羽村'},
    {category: '東京都', id: 'ritou', name: '八丈島'},
    {category: '東京都', id: 'oshima', name: '大島'},
    {category: '東京都', id: 'kouzu', name: '神津島・新島・式根島'},
    {category: '東京都', id: 'miyake', name: '三宅島'},
    {category: '東京都', id: 'Ogasawara', name: '小笠原諸島'},
    {category: '神奈川県', id: 'yokohama', name: '横浜'},
    {category: '神奈川県', id: 'kawasaki', name: '川崎'},
    {category: '神奈川県', id: 'hakone', name: '箱根'},
    {category: '神奈川県', id: 'odawara', name: '小田原'},
    {category: '神奈川県', id: 'yugawara', name: '湯河原・真鶴'},
    {category: '神奈川県', id: 'sagamiko', name: '相模湖・丹沢'},
    {category: '神奈川県', id: 'sagamihara', name: '大和・相模原・町田西部'},
    {category: '神奈川県', id: 'ebina', name: '厚木・海老名・伊勢原'},
    {category: '神奈川県', id: 'shonan', name: '湘南・鎌倉・江ノ島・藤沢・平塚'},
    {category: '神奈川県', id: 'miura', name: '横須賀・三浦'},
    {category: '新潟県', id: 'niigata', name: '新潟'},
    {category: '新潟県', id: 'kaetsu', name: '月岡・瀬波・咲花'},
    {category: '新潟県', id: 'kita', name: '長岡・燕三条・柏崎・弥彦・岩室・寺泊'},
    {category: '新潟県', id: 'minami', name: '魚沼・十日町・津南・六日町・大湯'},
    {category: '新潟県', id: 'yuzawa', name: '越後湯沢・苗場'},
    {category: '新潟県', id: 'joetsu', name: '上越・糸魚川・妙高'},
    {category: '新潟県', id: 'sado', name: '佐渡'},
    {category: '富山県', id: 'toyama', name: '富山・八尾・立山'},
    {category: '富山県', id: 'goto', name: '滑川・魚津・朝日・黒部・宇奈月'},
    {category: '富山県', id: 'gosei', name: '高岡・氷見・砺波'},
    {category: '石川県', id: 'kanazawa', name: '金沢'},
    {category: '石川県', id: 'kaga', name: '加賀・小松・辰口'},
    {category: '石川県', id: 'noto', name: '能登・輪島・珠洲'},
    {category: '石川県', id: 'nanao', name: '七尾・和倉・羽咋'},
    {category: '福井県', id: 'hukui', name: '福井'},
    {category: '福井県', id: 'awara', name: 'あわら・三国'},
    {category: '福井県', id: 'katsuyama', name: '永平寺・ 勝山・大野'},
    {category: '福井県', id: 'echizen', name: '越前・鯖江・武生'},
    {category: '福井県', id: 'tsuruga', name: '敦賀・美浜'},
    {category: '福井県', id: 'obama', name: '若狭・小浜・高浜'},
    {category: '山梨県', id: 'kofu', name: '甲府・湯村・昇仙峡'},
    {category: '山梨県', id: 'yamanashi', name: '山梨・石和・勝沼・塩山'},
    {category: '山梨県', id: 'otsuki', name: '大月・都留・道志渓谷'},
    {category: '山梨県', id: 'yamanakako', name: '山中湖・忍野'},
    {category: '山梨県', id: 'kawaguchiko', name: '河口湖・富士吉田・本栖湖・西湖・精進湖'},
    {category: '山梨県', id: 'minobu', name: '下部・身延・早川'},
    {category: '山梨県', id: 'nirasaki', name: '韮崎・南アルプス'},
    {category: '山梨県', id: 'kiyosato', name: '八ヶ岳・小淵沢・清里・大泉'},
    {category: '長野県', id: 'nagano', name: '長野・小布施・信州高山・戸隠・飯綱'},
    {category: '長野県', id: 'madara', name: '斑尾・飯山・信濃町・野尻湖・黒姫'},
    {category: '長野県', id: 'nozawa', name: '野沢温泉・木島平・秋山郷'},
    {category: '長野県', id: 'shiga', name: '志賀高原･湯田中･渋'},
    {category: '長野県', id: 'ueda', name: '上田・別所・鹿教湯'},
    {category: '長野県', id: 'chikuma', name: '戸倉上山田・千曲'},
    {category: '長野県', id: 'sugadaira', name: '菅平・峰の原'},
    {category: '長野県', id: 'karui', name: '軽井沢・佐久･小諸'},
    {category: '長野県', id: 'yatsu', name: '八ヶ岳・野辺山・富士見・原村'},
    {category: '長野県', id: 'kirigamine', name: '蓼科・白樺湖・霧ヶ峰・車山'},
    {category: '長野県', id: 'suwa', name: '諏訪湖'},
    {category: '長野県', id: 'ina', name: '伊那・駒ヶ根・飯田・昼神'},
    {category: '長野県', id: 'kiso', name: '木曽'},
    {category: '長野県', id: 'matsumo', name: '松本・塩尻・浅間温泉・美ヶ原温泉'},
    {category: '長野県', id: 'kamiko', name: '上高地・乗鞍・白骨'},
    {category: '長野県', id: 'hotaka', name: '安曇野・穂高・大町・豊科'},
    {category: '長野県', id: 'hakuba', name: '白馬・八方尾根・栂池高原・小谷'},
    {category: '岐阜県', id: 'gifu', name: '岐阜・各務原'},
    {category: '岐阜県', id: 'kamitakara', name: '奥飛騨・新穂高'},
    {category: '岐阜県', id: 'takayama', name: '高山・飛騨'},
    {category: '岐阜県', id: 'gero', name: '下呂温泉・濁河温泉'},
    {category: '岐阜県', id: 'tajimi', name: '中津川・多治見・恵那・美濃加茂'},
    {category: '岐阜県', id: 'gujo', name: '郡上八幡・関・美濃'},
    {category: '岐阜県', id: 'shirakawago', name: '白川郷'},
    {category: '岐阜県', id: 'ogaki', name: '大垣・岐阜羽島'},
    {category: '静岡県', id: 'shizuoka', name: '静岡・清水'},
    {category: '静岡県', id: 'atami', name: '熱海'},
    {category: '静岡県', id: 'ito', name: '伊東'},
    {category: '静岡県', id: 'izukogen', name: '伊豆高原'},
    {category: '静岡県', id: 'higashi', name: '東伊豆・河津'},
    {category: '静岡県', id: 'shimoda', name: '下田・南伊豆'},
    {category: '静岡県', id: 'nishi', name: '西伊豆・戸田・土肥・堂ヶ島'},
    {category: '静岡県', id: 'naka', name: '伊豆長岡・修善寺・天城湯ヶ島'},
    {category: '静岡県', id: 'fuji', name: '富士・富士宮'},
    {category: '静岡県', id: 'numazu', name: '御殿場・沼津・三島'},
    {category: '静岡県', id: 'yaizu', name: '焼津・藤枝・御前崎・寸又峡'},
    {category: '静岡県', id: 'hamamatsu', name: '浜松・浜名湖・天竜'},
    {category: '静岡県', id: 'kinugawa', name: '掛川・袋井・磐田'},
    {category: '愛知県', id: 'nagoyashi-A', name: '名古屋駅・伏見・丸の内'},
    {category: '愛知県', id: 'nagoyashi-B', name: '栄・錦・名古屋城'},
    {category: '愛知県', id: 'nagoyashi-C', name: '金山・熱田・千種・ナゴヤドーム'},
    {category: '愛知県', id: 'mikawawan', name: '豊橋・豊川・蒲郡・伊良湖'},
    {category: '愛知県', id: 'okumikawa', name: '奥三河・新城・湯谷温泉'},
    {category: '愛知県', id: 'mikawa', name: '豊田・刈谷・知立・安城・岡崎'},
    {category: '愛知県', id: 'owari', name: '一宮・犬山・小牧・瀬戸・春日井'},
    {category: '愛知県', id: 'chita', name: 'セントレア・東海・半田・知多'},
    {category: '愛知県', id: 'minamichita', name: '南知多・日間賀島・篠島'},
    {category: '三重県', id: 'tsu', name: '津･鈴鹿･亀山'},
    {category: '三重県', id: 'yunoyama', name: '四日市・桑名・湯の山・長島温泉'},
    {category: '三重県', id: 'iga', name: '伊賀・名張'},
    {category: '三重県', id: 'matsusaka', name: '松阪'},
    {category: '三重県', id: 'ise', name: '伊勢・二見'},
    {category: '三重県', id: 'toba', name: '鳥羽'},
    {category: '三重県', id: 'shima', name: '志摩・賢島'},
    {category: '三重県', id: 'kumano', name: '熊野・尾鷲・紀北'},
    {category: '滋賀県', id: 'ootsu', name: '大津・雄琴・草津・栗東'},
    {category: '滋賀県', id: 'kosei', name: '湖西・高島・マキノ'},
    {category: '滋賀県', id: 'kohoku', name: '長浜・米原'},
    {category: '滋賀県', id: 'kotou', name: '彦根・近江八幡・守山・東近江'},
    {category: '滋賀県', id: 'shigaraki', name: '信楽・甲賀'},
    {category: '京都府', id: 'shi-D', name: '京都駅'},
    {category: '京都府', id: 'shi-A', name: '嵐山・嵯峨野・太秦・高雄'},
    {category: '京都府', id: 'shi-B', name: '河原町・四条烏丸・二条城・御所'},
    {category: '京都府', id: 'shi-C', name: '祇園・東山・北白川'},
    {category: '京都府', id: 'shi-E', name: '大原・鞍馬・貴船'},
    {category: '京都府', id: 'nannbu', name: '宇治・長岡京'},
    {category: '京都府', id: 'yunohana', name: '亀岡・湯の花・美山・京丹波'},
    {category: '京都府', id: 'fukuchiyama', name: '福知山・綾部'},
    {category: '京都府', id: 'hokubu', name: '丹後・久美浜'},
    {category: '京都府', id: 'miyazu', name: '天橋立・宮津・舞鶴'},
    {category: '大阪府', id: 'shi-B', name: '大阪駅・梅田・ユニバーサルシティ・尼崎'},
    {category: '大阪府', id: 'shi-D', name: 'なんば・心斎橋・天王寺・阿倍野・長居'},
    {category: '大阪府', id: 'shi-C', name: '京橋・淀屋橋・本町・ベイエリア・弁天町'},
    {category: '大阪府', id: 'shi-A', name: '新大阪・江坂'},
    {category: '大阪府', id: 'hokubu', name: '高槻・茨木・箕面・伊丹空港'},
    {category: '大阪府', id: 'toubu', name: '枚方・守口・東大阪'},
    {category: '大阪府', id: 'nantou', name: '八尾・藤井寺・河内長野'},
    {category: '大阪府', id: 'nanbu', name: '堺・岸和田・関空・泉佐野'},
    {category: '兵庫県', id: 'kobe', name: '神戸・有馬温泉・六甲山'},
    {category: '兵庫県', id: 'nantou', name: '宝塚・西宮・甲子園・三田・篠山'},
    {category: '兵庫県', id: 'minamichu', name: '明石・加古川・三木'},
    {category: '兵庫県', id: 'nannansei', name: '姫路・相生・赤穂'},
    {category: '兵庫県', id: 'chubu', name: '和田山・竹田城・ハチ高原'},
    {category: '兵庫県', id: 'kita', name: '城崎温泉・豊岡・出石・神鍋'},
    {category: '兵庫県', id: 'kasumi', name: '香住・浜坂・湯村'},
    {category: '兵庫県', id: 'awaji', name: '淡路島'},
    {category: '奈良県', id: 'nara', name: '奈良・大和高原'},
    {category: '奈良県', id: 'hokubu', name: '橿原・大和郡山・天理・生駒'},
    {category: '奈良県', id: 'nanbu', name: '吉野・十津川・天川・五條'},
    {category: '和歌山県', id: 'wakayama', name: '和歌山・加太・和歌浦'},
    {category: '和歌山県', id: 'Kihoku', name: '高野山・橋本'},
    {category: '和歌山県', id: 'gobo', name: '御坊・有田・海南・日高'},
    {category: '和歌山県', id: 'shirahama', name: '南紀白浜・紀伊田辺・龍神'},
    {category: '和歌山県', id: 'Katsuura', name: '勝浦・串本・すさみ'},
    {category: '和歌山県', id: 'hongu', name: '熊野古道・新宮・本宮・中辺路'},
    {category: '鳥取県', id: 'tottori', name: '鳥取・岩美・浜村'},
    {category: '鳥取県', id: 'chubu', name: '倉吉・三朝温泉'},
    {category: '鳥取県', id: 'seibu', name: '米子・皆生温泉・大山'},
    {category: '島根県', id: 'matsue', name: '松江・玉造・安来・奥出雲'},
    {category: '島根県', id: 'toubu', name: '出雲・大田・石見銀山'},
    {category: '島根県', id: 'masuda', name: '津和野・益田・浜田・江津'},
    {category: '島根県', id: 'ritou', name: '隠岐諸島'},
    {category: '岡山県', id: 'okayama', name: '岡山'},
    {category: '岡山県', id: 'bizen', name: '牛窓・瀬戸内・備前'},
    {category: '岡山県', id: 'tsuyama', name: '津山・湯郷・美作・奥津'},
    {category: '岡山県', id: 'niimi', name: '湯原・蒜山・新見・高梁'},
    {category: '岡山県', id: 'kurashiki', name: '倉敷・総社・玉野・笠岡'},
    {category: '広島県', id: 'hiroshima', name: '広島'},
    {category: '広島県', id: 'higashihiroshima', name: '東広島・竹原・三原・広島空港'},
    {category: '広島県', id: 'fukuyama', name: '福山・尾道・しまなみ海道'},
    {category: '広島県', id: 'kure', name: '呉・江田島'},
    {category: '広島県', id: 'shohara', name: '三次・庄原・帝釈峡'},
    {category: '広島県', id: 'sandankyo', name: '三段峡・芸北・北広島'},
    {category: '広島県', id: 'miyajima', name: '宮島・宮浜温泉・廿日市'},
    {category: '山口県', id: 'yamaguchi', name: '山口・湯田温泉・防府'},
    {category: '山口県', id: 'shimonoseki', name: '下関・宇部'},
    {category: '山口県', id: 'iwakuni', name: '岩国・周南・柳井'},
    {category: '山口県', id: 'hagi', name: '萩・長門・秋吉台'},
    {category: '徳島県', id: 'tokushima', name: '徳島・鳴門'},
    {category: '徳島県', id: 'hokubu', name: '大歩危・祖谷・剣山・吉野川'},
    {category: '徳島県', id: 'nanbu', name: '阿南・日和佐・宍喰'},
    {category: '香川県', id: 'takamatsu', name: '高松・さぬき・東かがわ'},
    {category: '香川県', id: 'sakaide', name: '坂出・宇多津・丸亀'},
    {category: '香川県', id: 'kotohira', name: '琴平・観音寺'},
    {category: '香川県', id: 'ritou', name: '小豆島・直島'},
    {category: '愛媛県', id: 'chuuyo', name: '松山・道後'},
    {category: '愛媛県', id: 'touyo', name: '今治・しまなみ海道'},
    {category: '愛媛県', id: 'saijo', name: '西条・新居浜・四国中央'},
    {category: '愛媛県', id: 'nanyo', name: '宇和島・八幡浜'},
    {category: '高知県', id: 'kouchi', name: '高知・南国・香南・伊野'},
    {category: '高知県', id: 'toubu', name: '安芸・室戸'},
    {category: '高知県', id: 'seibu', name: '足摺・四万十・宿毛・須崎'},
    {category: '福岡県', id: 'fukuoka', name: '博多・キャナルシティ・海の中道・太宰府・二日市'},
    {category: '福岡県', id: 'seibu', name: '天神・中洲・薬院・福岡ドーム・糸島'},
    {category: '福岡県', id: 'kitakyusyu', name: '北九州'},
    {category: '福岡県', id: 'chikuzen', name: '宗像・宮若・飯塚'},
    {category: '福岡県', id: 'kurume', name: '久留米・甘木・原鶴温泉・筑後川温泉'},
    {category: '福岡県', id: 'buzen', name: '北九州空港・苅田・行橋・豊前'},
    {category: '福岡県', id: 'chikugo', name: '大牟田・柳川・八女・筑後'},
    {category: '佐賀県', id: 'saga', name: '佐賀・古湯温泉'},
    {category: '佐賀県', id: 'tosu', name: '鳥栖'},
    {category: '佐賀県', id: 'ureshino', name: '嬉野・武雄・伊万里・有田・太良'},
    {category: '佐賀県', id: 'karatsu', name: '唐津・呼子'},
    {category: '長崎県', id: 'nagasaki', name: '長崎'},
    {category: '長崎県', id: 'unzen', name: '雲仙・島原・小浜'},
    {category: '長崎県', id: 'airport', name: '諫早・大村・長崎空港'},
    {category: '長崎県', id: 'sasebo', name: 'ハウステンボス・佐世保・平戸'},
    {category: '長崎県', id: 'ritou', name: '五島列島'},
    {category: '長崎県', id: 'tsushima', name: '対馬'},
    {category: '長崎県', id: 'iki', name: '壱岐島'},
    {category: '熊本県', id: 'kumamoto', name: '熊本'},
    {category: '熊本県', id: 'kikuchi', name: '大津・玉名・山鹿・荒尾・菊池'},
    {category: '熊本県', id: 'aso', name: '阿蘇'},
    {category: '熊本県', id: 'yatsushiro', name: '宇土・八代・水俣'},
    {category: '熊本県', id: 'kuma', name: '人吉・球磨'},
    {category: '熊本県', id: 'amakusa', name: '天草･本渡'},
    {category: '熊本県', id: 'kurokawa', name: '黒川温泉・杖立'},
    {category: '大分県', id: 'oita', name: '大分'},
    {category: '大分県', id: 'beppu', name: '別府・日出'},
    {category: '大分県', id: 'usuki', name: '佐伯・臼杵・豊後大野'},
    {category: '大分県', id: 'yufuin', name: '湯布院・湯平'},
    {category: '大分県', id: 'taketa', name: '久住・竹田'},
    {category: '大分県', id: 'hita', name: '九重・日田・天瀬'},
    {category: '大分県', id: 'kunisaki', name: '国東・中津・宇佐・耶馬渓'},
    {category: '宮崎県', id: 'miyazaki', name: '宮崎'},
    {category: '宮崎県', id: 'hokubu', name: '高千穂・延岡・日向・高鍋'},
    {category: '宮崎県', id: 'nanbu', name: '都城・えびの・日南・綾'},
    {category: '鹿児島県', id: 'kagoshima', name: '鹿児島・桜島'},
    {category: '鹿児島県', id: 'oosumi', name: '霧島・国分・鹿児島空港'},
    {category: '鹿児島県', id: 'kanoya', name: '鹿屋・垂水・志布志'},
    {category: '鹿児島県', id: 'hokusatsu', name: '川内・出水'},
    {category: '鹿児島県', id: 'nansatsu', name: '指宿・枕崎・南さつま'},
    {category: '鹿児島県', id: 'yakushima', name: '屋久島'},
    {category: '鹿児島県', id: 'ritou', name: '種子島'},
    {category: '鹿児島県', id: 'amami', name: '奄美大島･喜界島・徳之島'},
    {category: '鹿児島県', id: 'okinoerabu', name: '沖永良部島・与論島'},
    {category: '沖縄県', id: 'nahashi', name: '那覇'},
    {category: '沖縄県', id: 'hokubu', name: '恩納・名護・本部・今帰仁'},
    {category: '沖縄県', id: 'chubu', name: '宜野湾・北谷・読谷・沖縄市・うるま'},
    {category: '沖縄県', id: 'nanbu', name: '糸満・豊見城・南城'},
    {category: '沖縄県', id: 'kerama', name: '慶良間・渡嘉敷・座間味・阿嘉'},
    {category: '沖縄県', id: 'kumejima', name: '久米島'},
    {category: '沖縄県', id: 'Miyako', name: '宮古島・伊良部島'},
    {category: '沖縄県', id: 'ritou', name: '石垣・西表・小浜島'},
    {category: '沖縄県', id: 'yonaguni', name: '与那国島'},
    {category: '沖縄県', id: 'daito', name: '大東島'},
];

const prefectureSelect = document.getElementById('prefecture-select');
const placeSelect = document.getElementById('place-select');

// 大分類のプルダウンを生成

prefectures.forEach(prefecture => {
    const option = document.createElement('option');
    option.textContent = prefecture.name;
    option.value = prefecture.name;
    option.id = prefecture.id;
    prefectureSelect.appendChild(option);    
  });
  
  // 大分類が選択されたら小分類のプルダウンを生成
  prefectureSelect.addEventListener('input', () => {

    // 小分類のプルダウンをリセット
    const options = document.querySelectorAll('#place-select > option');
    options.forEach(option => {
      option.remove();
    });
    
    // 小分類のプルダウンに「選択してください」を加える
    const firstSelect = document.createElement('option');
    firstSelect.textContent = '選択してください';
    placeSelect.appendChild(firstSelect);
  
    // 小分類を選択（クリック）できるようにする
    placeSelect.disabled = false;
  
    // 大分類が選択されていない（「選択してください」になっている）とき、小分類を選択（クリック）できないようにする
    if (prefectureSelect.value == '選択してください') {
      placeSelect.disabled = true;
      return;
    }
  
    // 大分類で選択されたカテゴリーと同じ小分類のみを、プルダウンの選択肢に設定する
    places.forEach(place => {
      if (prefectureSelect.value === place.category) {
        const option = document.createElement('option');
        option.textContent = place.name;
        option.value = place.name;
        option.id = place.id;
        placeSelect.appendChild(option);
      }
    });
});

// モーダルウィンドウ 北海道
const modalH = document.querySelector('#js-modal-H');
const modalButtonH = document.querySelector('.js-modal-button-H');
const modalCloseH = document.querySelector('.js-close-button-H');
const detailsElementH = document.querySelector('.accordion-hokkaido');

detailsElementH.addEventListener('toggle', () => {
  if (detailsElementH.open) {
    modalH.classList.add('is-open');
    console.log('open');
  } else {
    modalH.classList.remove('is-open');
    console.log('modal-close');
  }
});

modalCloseH.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (modalH.classList.contains('is-open')) {
    modalH.classList.remove('is-open');
    detailsElementH.removeAttribute('open');
    console.log('close');
  }
});

//モーダルウィンドウ　東北
const modalT = document.querySelector('#js-modal-T');
const modalButtonT = document.querySelector('.js-modal-button-T');
const modalCloseT = document.querySelector('.js-close-button-T');
const detailsElementT = document.querySelector('.accordion-tohoku')

detailsElementT.addEventListener('toggle', () => {
  if (detailsElementT.open) {
    modalT.classList.add('is-open');
    console.log('open');
  } else {
    modalT.classList.remove('is-open');
    console.log('modal-close');
  }
});

modalCloseT.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (modalT.classList.contains('is-open')) {
    modalT.classList.remove('is-open');
    detailsElementT.removeAttribute('open');
    console.log('close');
  }
});

//モーダルウィンドウ　関東
const modalK = document.querySelector('#js-modal-K');
const modalButtonK = document.querySelector('.js-modal-button-K');
const modalCloseK = document.querySelector('.js-close-button-K');
const detailsElementK = document.querySelector('.accordion-kanto')

detailsElementK.addEventListener('toggle', () => {
  if (detailsElementK.open) {
    modalK.classList.add('is-open');
    console.log('open');
  } else {
    modalK.classList.remove('is-open');
    console.log('modal-close');
  }
});

modalCloseK.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (modalK.classList.contains('is-open')) {
    modalK.classList.remove('is-open');
    detailsElementK.removeAttribute('open');
    console.log('close');
  }
});

//モーダルウィンドウ　中部
const modalC = document.querySelector('#js-modal-C');
const modalButtonC = document.querySelector('.js-modal-button-C');
const modalCloseC = document.querySelector('.js-close-button-C');
const detailsElementC = document.querySelector('.accordion-chubu')

detailsElementC.addEventListener('toggle', () => {
  if (detailsElementC.open) {
    modalC.classList.add('is-open');
    console.log('open');
  } else {
    modalC.classList.remove('is-open');
    console.log('modal-close');
  }
});

modalCloseC.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (modalC.classList.contains('is-open')) {
    modalC.classList.remove('is-open');
    detailsElementC.removeAttribute('open');
    console.log('close');
  }
});

//モーダルウィンドウ　近畿
const modalKK = document.querySelector('#js-modal-KK');
const modalButtonKK = document.querySelector('.js-modal-button-KK');
const modalCloseKK = document.querySelector('.js-close-button-KK');
const detailsElementKK = document.querySelector('.accordion-kinki')

detailsElementKK.addEventListener('toggle', () => {
  if (detailsElementKK.open) {
    modalKK.classList.add('is-open');
    console.log('open');
  } else {
    modalKK.classList.remove('is-open');
    console.log('modal-close');
  }
});

modalCloseKK.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (modalKK.classList.contains('is-open')) {
    modalKK.classList.remove('is-open');
    detailsElementKK.removeAttribute('open');
    console.log('close');
  }
});

//モーダルウィンドウ　中四国
const modalCS = document.querySelector('#js-modal-CS');
const modalButtonCS = document.querySelector('.js-modal-button-CS');
const modalCloseCS = document.querySelector('.js-close-button-CS');
const detailsElementCS = document.querySelector('.accordion-chushikoku')

detailsElementCS.addEventListener('toggle', () => {
  if (detailsElementCS.open) {
    modalCS.classList.add('is-open');
    console.log('open');
  } else {
    modalCS.classList.remove('is-open');
    console.log('modal-close');
  }
});

modalCloseCS.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (modalCS.classList.contains('is-open')) {
    modalCS.classList.remove('is-open');
    detailsElementCS.removeAttribute('open');
    console.log('close');
  }
});

//モーダルウィンドウ　九州
const modalKS = document.querySelector('#js-modal-KS');
const modalButtonKS = document.querySelector('.js-modal-button-KS');
const modalCloseKS = document.querySelector('.js-close-button-KS');
const detailsElementKS = document.querySelector('.accordion-kyushu')

detailsElementKS.addEventListener('toggle', () => {
  if (detailsElementKS.open) {
    modalKS.classList.add('is-open');
    console.log('open');
  } else {
    modalKS.classList.remove('is-open');
    console.log('modal-close');
  }
});

modalCloseKS.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (modalKS.classList.contains('is-open')) {
    modalKS.classList.remove('is-open');
    detailsElementKS.removeAttribute('open');
    console.log('close');
  }
});

//モーダルウィンドウ　沖縄
const modalO = document.querySelector('#js-modal-O');
const modalButtonO = document.querySelector('.js-modal-button-O');
const modalCloseO = document.querySelector('.js-close-button-O');
const detailsElementO = document.querySelector('.accordion-okinawa')

detailsElementO.addEventListener('toggle', () => {
  if (detailsElementO.open) {
    modalO.classList.add('is-open');
    console.log('open');
  } else {
    modalO.classList.remove('is-open');
    console.log('modal-close');
  }
});

modalCloseO.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (modalO.classList.contains('is-open')) {
    modalO.classList.remove('is-open');
    detailsElementO.removeAttribute('open');
    console.log('close');
  }
});

// 画面左の選択済みスポットリストをサーバに送信して、画面遷移
function sendSelectPlacesPulldown(){
  const selectedPrefectureName = prefectureSelect.value;
  const selectedPrefectureId = prefectureSelect.options[prefectureSelect.selectedIndex].id;
  const selectedPlaceName = placeSelect.value;
  const selectedPlaceId = placeSelect.options[placeSelect.selectedIndex].id;
  let bodyData = {};

  if (selectedPrefectureName === '選択してください' && selectedPlaceName === '選択してください') {
      alert('都道府県とエリアを選択してください。');
      return;
  } else {
    console.log('プルダウンから選択');
    console.log('選択された都道府県: ', selectedPrefectureName);
    console.log('選択された都道府県id: ', selectedPrefectureId);
    console.log('選択されたエリア: ', selectedPlaceName);
    console.log('選択されたエリアid: ', selectedPlaceId);

    bodyData = {
      prefectureName: selectedPrefectureName,
      prefectureId: selectedPrefectureId,
      areaName: selectedPlaceName,
      areaId: selectedPlaceId
    };
  }
  // 送信
  fetch("/userselectplaces", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.json();
  })
  .then(data => {
    console.log("POST /userselectplaces -> ", data);
    // 送信成功なら /hotel に遷移、失敗なら警告表示
    if (data.result == true) {
      window.location.href = "/spot";
    } else {
      alert("送信失敗！");
    }
  });
}

function sendSelectPlacesMap(){
  let bodyData = {};
  const selectedRadioButton = document.querySelector('input[type="radio"]:checked');
  if (selectedRadioButton) {
    const selectedPrefectureNameMap = selectedRadioButton.closest('details').querySelector('summary').textContent;
    const selectedPrefectureIdMap = selectedRadioButton.closest('div').id;
    const selectedPlaceNameMap = selectedRadioButton.value;
    const selectedPlaceIdMap = selectedRadioButton.id;
      console.log('マップから選択');
      console.log('選択された都道府県: ', selectedPrefectureNameMap);
      console.log('選択された都道府県id: ', selectedPrefectureIdMap);
      console.log('選択されたエリア: ', selectedPlaceNameMap);
      console.log('選択されたエリアid: ', selectedPlaceIdMap);
      bodyData = {
        prefectureName: selectedPrefectureNameMap,
        prefectureId: selectedPrefectureIdMap,
        areaName: selectedPlaceNameMap,
        areaId: selectedPlaceIdMap
      };
  } else {
    alert('都道府県とエリアを選択してください。');
    return;
  }

  // 送信
  fetch("/userselectplaces", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.json();
  })
  .then(data => {
    console.log("POST /userselectplaces -> ", data);
    // 送信成功なら /hotel に遷移、失敗なら警告表示
    if (data.result == true) {
      window.location.href = "/spot";
    } else {
      alert("送信失敗！");
    }
  });
}

inqueryDestinationSpots();
