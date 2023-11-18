'use strict';

// 都道府県、地名の選択肢配列
const prefectures = [
    '北海道',
    '青森県',
    '岩手県',
    '宮城県',
    '秋田県',
    '山形県',
    '福島県',
    '茨城県',
    '栃木県',
    '群馬県',
    '埼玉県',
    '千葉県',
    '東京都',
    '神奈川県',
    '新潟県',
    '富山県',
    '石川県',
    '福井県',
    '山梨県',
    '長野県',
    '岐阜県',
    '静岡県',
    '愛知県',
    '三重県',
    '滋賀県',
    '京都府',
    '大阪府',
    '兵庫県',
    '奈良県',
    '和歌山県',
    '鳥取県',
    '島根県',
    '岡山県',
    '広島県',
    '山口県',
    '徳島県',
    '香川県',
    '愛媛県',
    '高知県',
    '福岡県',
    '佐賀県',
    '長崎県',
    '熊本県',
    '大分県',
    '宮崎県',
    '鹿児島県',
    '沖縄県'
];

// 地名は都道府県と紐づけるためにオブジェクト型
const places = [
    {category: '北海道', name: '札幌'},
    {category: '北海道', name: '定山渓'},
    {category: '北海道', name: '稚内・留萌・利尻・礼文'},
    {category: '北海道', name: '網走・紋別・北見・知床'},
    {category: '北海道', name: '釧路・阿寒・川湯・根室'},
    {category: '北海道', name: '帯広・十勝'},
    {category: '北海道', name: '日高・えりも'},
    {category: '北海道', name: '富良野・美瑛・トマム'},
    {category: '北海道', name: '旭川・層雲峡・旭岳'},
    {category: '北海道', name: '千歳・支笏・苫小牧・滝川・夕張・空知'},
    {category: '北海道', name: '小樽・キロロ・積丹・余市'},
    {category: '北海道', name: 'ルスツ・ニセコ・倶知安'},
    {category: '北海道', name: '函館・湯の川・大沼・奥尻'},
    {category: '北海道', name: '洞爺・室蘭・登別'},
    {category: '青森県', name: '青森・浅虫温泉'},
    {category: '青森県', name: '津軽半島・五所川原'},
    {category: '青森県', name: '白神山地・西津軽'},
    {category: '青森県', name: '弘前・黒石'},
    {category: '青森県', name: '八甲田・十和田湖・奥入瀬'},
    {category: '青森県', name: '八戸・三沢・七戸十和田'},
    {category: '青森県', name: '下北・大間・むつ'},
    {category: '岩手県', name: '盛岡'},
    {category: '岩手県', name: '雫石'},
    {category: '岩手県', name: '安比高原・八幡平・二戸'},
    {category: '岩手県', name: '宮古・久慈・岩泉'},
    {category: '岩手県', name: '釜石・大船渡・陸前高田'},
    {category: '岩手県', name: '北上・花巻・遠野'},
    {category: '岩手県', name: '奥州・平泉・一関'},
    {category: '宮城県', name: '仙台・多賀城・名取'},
    {category: '宮城県', name: '秋保・作並'},
    {category: '宮城県', name: '鳴子・古川・くりこま高原'},
    {category: '宮城県', name: '松島・塩釜・石巻・南三陸・気仙沼'},
    {category: '宮城県', name: '白石・宮城蔵王'},
    {category: '秋田県', name: '秋田'},
    {category: '秋田県', name: '能代・男鹿・白神'},
    {category: '秋田県', name: '大館・鹿角・十和田大湯・八幡平'},
    {category: '秋田県', name: '角館・大曲・田沢湖'},
    {category: '秋田県', name: '湯沢・横手'},
    {category: '秋田県', name: '由利本荘・鳥海山'},
    {category: '山形県', name: '山形・蔵王・天童・上山'},
    {category: '山形県', name: '米沢・赤湯・高畠・長井'},
    {category: '山形県', name: '寒河江・月山'},
    {category: '山形県', name: '尾花沢・新庄・村山'},
    {category: '山形県', name: '酒田・鶴岡・湯野浜・温海'},
    {category: '福島県', name: '福島・二本松'},
    {category: '福島県', name: '会津若松・喜多方'},
    {category: '福島県', name: '猪苗代・表磐梯'},
    {category: '福島県', name: '磐梯高原・裏磐梯'},
    {category: '福島県', name: '郡山・磐梯熱海'},
    {category: '福島県', name: '南会津・下郷・只見・檜枝岐'},
    {category: '福島県', name: '白河・須賀川'},
    {category: '福島県', name: 'いわき・南相馬・相馬'},
    {category: '茨城県', name: '水戸・笠間'},
    {category: '茨城県', name: '大洗・ひたちなか'},
    {category: '茨城県', name: '日立・北茨城・奥久慈'},
    {category: '茨城県', name: 'つくば・土浦・取手'},
    {category: '茨城県', name: '古河・結城・筑西・常総'},
    {category: '茨城県', name: '鹿嶋・神栖・潮来・北浦'},
    {category: '栃木県', name: '宇都宮・さくら'},
    {category: '栃木県', name: '日光・中禅寺湖・奥日光・今市'},
    {category: '栃木県', name: '鬼怒川・川治・湯西川・川俣'},
    {category: '栃木県', name: '那須・板室・黒磯'},
    {category: '栃木県', name: '塩原・矢板・大田原・西那須野'},
    {category: '栃木県', name: '真岡・益子・茂木'},
    {category: '栃木県', name: '小山・足利・佐野・栃木'},
    {category: '群馬県', name: '前橋・赤城'},
    {category: '群馬県', name: '伊香保温泉・渋川'},
    {category: '群馬県', name: '万座･嬬恋･北軽井沢'},
    {category: '群馬県', name: '草津温泉・白根'},
    {category: '群馬県', name: '四万温泉'},
    {category: '群馬県', name: '水上・猿ヶ京・沼田'},
    {category: '群馬県', name: '尾瀬・丸沼'},
    {category: '群馬県', name: '伊勢崎・太田・館林・桐生'},
    {category: '群馬県', name: '高崎'},
    {category: '群馬県', name: '富岡・藤岡・安中・磯部温泉'},
    {category: '埼玉県', name: '大宮・浦和・川口・上尾'},
    {category: '埼玉県', name: '草加・越谷・春日部・羽生'},
    {category: '埼玉県', name: '熊谷・深谷・本庄'},
    {category: '埼玉県', name: '川越・東松山・志木・和光'},
    {category: '埼玉県', name: '所沢・狭山・飯能'},
    {category: '埼玉県', name: '秩父・長瀞'},
    {category: '千葉県', name: '千葉'},
    {category: '千葉県', name: '舞浜・浦安・船橋・幕張'},
    {category: '千葉県', name: '松戸・柏'},
    {category: '千葉県', name: '成田空港・佐倉'},
    {category: '千葉県', name: '銚子・旭・九十九里・東金・茂原'},
    {category: '千葉県', name: '鴨川・勝浦・御宿・養老渓谷'},
    {category: '千葉県', name: '南房総・館山・白浜・千倉'},
    {category: '千葉県', name: '市原・木更津・君津・富津・鋸南'},
    {category: '東京都', name: '東京２３区内'},
    {category: '東京都', name: '立川・八王子・町田・府中・吉祥寺'},
    {category: '東京都', name: '奥多摩・青梅・羽村'},
    {category: '東京都', name: '八丈島'},
    {category: '東京都', name: '大島'},
    {category: '東京都', name: '神津島・新島・式根島'},
    {category: '東京都', name: '三宅島'},
    {category: '東京都', name: '小笠原諸島'},
    {category: '神奈川県', name: '横浜'},
    {category: '神奈川県', name: '川崎'},
    {category: '神奈川県', name: '箱根'},
    {category: '神奈川県', name: '小田原'},
    {category: '神奈川県', name: '湯河原・真鶴'},
    {category: '神奈川県', name: '相模湖・丹沢'},
    {category: '神奈川県', name: '大和・相模原・町田西部'},
    {category: '神奈川県', name: '厚木・海老名・伊勢原'},
    {category: '神奈川県', name: '湘南・鎌倉・江ノ島・藤沢・平塚'},
    {category: '神奈川県', name: '横須賀・三浦'},
    {category: '新潟県', name: '新潟'},
    {category: '新潟県', name: '月岡・瀬波・咲花'},
    {category: '新潟県', name: '長岡・燕三条・柏崎・弥彦・岩室・寺泊'},
    {category: '新潟県', name: '魚沼・十日町・津南・六日町・大湯'},
    {category: '新潟県', name: '越後湯沢・苗場'},
    {category: '新潟県', name: '上越・糸魚川・妙高'},
    {category: '新潟県', name: '佐渡'},
    {category: '富山県', name: '富山・八尾・立山'},
    {category: '富山県', name: '滑川・魚津・朝日・黒部・宇奈月'},
    {category: '富山県', name: '高岡・氷見・砺波'},
    {category: '石川県', name: '金沢'},
    {category: '石川県', name: '加賀・小松・辰口'},
    {category: '石川県', name: '能登・輪島・珠洲'},
    {category: '石川県', name: '七尾・和倉・羽咋'},
    {category: '福井県', name: '福井'},
    {category: '福井県', name: 'あわら・三国'},
    {category: '福井県', name: '永平寺・ 勝山・大野'},
    {category: '福井県', name: '越前・鯖江・武生'},
    {category: '福井県', name: '敦賀・美浜'},
    {category: '福井県', name: '若狭・小浜・高浜'},
    {category: '山梨県', name: '甲府・湯村・昇仙峡'},
    {category: '山梨県', name: '山梨・石和・勝沼・塩山'},
    {category: '山梨県', name: '大月・都留・道志渓谷'},
    {category: '山梨県', name: '山中湖・忍野'},
    {category: '山梨県', name: '河口湖・富士吉田・本栖湖・西湖・精進湖'},
    {category: '山梨県', name: '下部・身延・早川'},
    {category: '山梨県', name: '韮崎・南アルプス'},
    {category: '山梨県', name: '八ヶ岳・小淵沢・清里・大泉'},
    {category: '長野県', name: '長野・小布施・信州高山・戸隠・飯綱'},
    {category: '長野県', name: '斑尾・飯山・信濃町・野尻湖・黒姫'},
    {category: '長野県', name: '野沢温泉・木島平・秋山郷'},
    {category: '長野県', name: '志賀高原･湯田中･渋'},
    {category: '長野県', name: '上田・別所・鹿教湯'},
    {category: '長野県', name: '戸倉上山田・千曲'},
    {category: '長野県', name: '菅平・峰の原'},
    {category: '長野県', name: '軽井沢・佐久･小諸'},
    {category: '長野県', name: '八ヶ岳・野辺山・富士見・原村'},
    {category: '長野県', name: '蓼科・白樺湖・霧ヶ峰・車山'},
    {category: '長野県', name: '諏訪湖'},
    {category: '長野県', name: '伊那・駒ヶ根・飯田・昼神'},
    {category: '長野県', name: '木曽'},
    {category: '長野県', name: '松本・塩尻・浅間温泉・美ヶ原温泉'},
    {category: '長野県', name: '上高地・乗鞍・白骨'},
    {category: '長野県', name: '安曇野・穂高・大町・豊科'},
    {category: '長野県', name: '白馬・八方尾根・栂池高原・小谷'},
    {category: '岐阜県', name: '岐阜・各務原'},
    {category: '岐阜県', name: '奥飛騨・新穂高'},
    {category: '岐阜県', name: '高山・飛騨'},
    {category: '岐阜県', name: '下呂温泉・濁河温泉'},
    {category: '岐阜県', name: '中津川・多治見・恵那・美濃加茂'},
    {category: '岐阜県', name: '郡上八幡・関・美濃'},
    {category: '岐阜県', name: '白川郷'},
    {category: '岐阜県', name: '大垣・岐阜羽島'},
    {category: '静岡県', name: '静岡・清水'},
    {category: '静岡県', name: '熱海'},
    {category: '静岡県', name: '伊東'},
    {category: '静岡県', name: '伊豆高原'},
    {category: '静岡県', name: '東伊豆・河津'},
    {category: '静岡県', name: '下田・南伊豆'},
    {category: '静岡県', name: '西伊豆・戸田・土肥・堂ヶ島'},
    {category: '静岡県', name: '伊豆長岡・修善寺・天城湯ヶ島'},
    {category: '静岡県', name: '富士・富士宮'},
    {category: '静岡県', name: '御殿場・沼津・三島'},
    {category: '静岡県', name: '焼津・藤枝・御前崎・寸又峡'},
    {category: '静岡県', name: '浜松・浜名湖・天竜'},
    {category: '静岡県', name: '掛川・袋井・磐田'},
    {category: '愛知県', name: '名古屋'},
    {category: '愛知県', name: '豊橋・豊川・蒲郡・伊良湖'},
    {category: '愛知県', name: '奥三河・新城・湯谷温泉'},
    {category: '愛知県', name: '豊田・刈谷・知立・安城・岡崎'},
    {category: '愛知県', name: '一宮・犬山・小牧・瀬戸・春日井'},
    {category: '愛知県', name: 'セントレア・東海・半田・知多'},
    {category: '愛知県', name: '南知多・日間賀島・篠島'},
    {category: '三重県', name: '津･鈴鹿･亀山'},
    {category: '三重県', name: '四日市・桑名・湯の山・長島温泉'},
    {category: '三重県', name: '伊賀・名張'},
    {category: '三重県', name: '松阪'},
    {category: '三重県', name: '伊勢・二見'},
    {category: '三重県', name: '鳥羽'},
    {category: '三重県', name: '志摩・賢島'},
    {category: '三重県', name: '熊野・尾鷲・紀北'},
    {category: '滋賀県', name: '大津・雄琴・草津・栗東'},
    {category: '滋賀県', name: '湖西・高島・マキノ'},
    {category: '滋賀県', name: '長浜・米原'},
    {category: '滋賀県', name: '彦根・近江八幡・守山・東近江'},
    {category: '滋賀県', name: '信楽・甲賀'},
    {category: '京都府', name: '京都'},
    {category: '京都府', name: '宇治・長岡京'},
    {category: '京都府', name: '亀岡・湯の花・美山・京丹波'},
    {category: '京都府', name: '福知山・綾部'},
    {category: '京都府', name: '丹後・久美浜'},
    {category: '京都府', name: '天橋立・宮津・舞鶴'},
    {category: '大阪府', name: '大阪'},
    {category: '大阪府', name: '高槻・茨木・箕面・伊丹空港'},
    {category: '大阪府', name: '枚方・守口・東大阪'},
    {category: '大阪府', name: '八尾・藤井寺・河内長野'},
    {category: '大阪府', name: '堺・岸和田・関空・泉佐野'},
    {category: '兵庫県', name: '神戸・有馬温泉・六甲山'},
    {category: '兵庫県', name: '宝塚・西宮・甲子園・三田・篠山'},
    {category: '兵庫県', name: '明石・加古川・三木'},
    {category: '兵庫県', name: '姫路・相生・赤穂'},
    {category: '兵庫県', name: '和田山・竹田城・ハチ高原'},
    {category: '兵庫県', name: '城崎温泉・豊岡・出石・神鍋'},
    {category: '兵庫県', name: '香住・浜坂・湯村'},
    {category: '兵庫県', name: '淡路島'},
    {category: '奈良県', name: '奈良・大和高原'},
    {category: '奈良県', name: '橿原・大和郡山・天理・生駒'},
    {category: '奈良県', name: '吉野・十津川・天川・五條'},
    {category: '和歌山県', name: '和歌山・加太・和歌浦'},
    {category: '和歌山県', name: '高野山・橋本'},
    {category: '和歌山県', name: '御坊・有田・海南・日高'},
    {category: '和歌山県', name: '南紀白浜・紀伊田辺・龍神'},
    {category: '和歌山県', name: '勝浦・串本・すさみ'},
    {category: '和歌山県', name: '熊野古道・新宮・本宮・中辺路'},
    {category: '鳥取県', name: '鳥取・岩美・浜村'},
    {category: '鳥取県', name: '倉吉・三朝温泉'},
    {category: '鳥取県', name: '米子・皆生温泉・大山'},
    {category: '島根県', name: '松江・玉造・安来・奥出雲'},
    {category: '島根県', name: '出雲・大田・石見銀山'},
    {category: '島根県', name: '津和野・益田・浜田・江津'},
    {category: '島根県', name: '隠岐諸島'},
    {category: '岡山県', name: '岡山'},
    {category: '岡山県', name: '牛窓・瀬戸内・備前'},
    {category: '岡山県', name: '津山・湯郷・美作・奥津'},
    {category: '岡山県', name: '湯原・蒜山・新見・高梁'},
    {category: '岡山県', name: '倉敷・総社・玉野・笠岡'},
    {category: '広島県', name: '広島'},
    {category: '広島県', name: '東広島・竹原・三原・広島空港'},
    {category: '広島県', name: '福山・尾道・しまなみ海道'},
    {category: '広島県', name: '呉・江田島'},
    {category: '広島県', name: '三次・庄原・帝釈峡'},
    {category: '広島県', name: '三段峡・芸北・北広島'},
    {category: '広島県', name: '宮島・宮浜温泉・廿日市'},
    {category: '山口県', name: '山口・湯田温泉・防府'},
    {category: '山口県', name: '下関・宇部'},
    {category: '山口県', name: '岩国・周南・柳井'},
    {category: '山口県', name: '萩・長門・秋吉台'},
    {category: '徳島県', name: '徳島・鳴門'},
    {category: '徳島県', name: '大歩危・祖谷・剣山・吉野川'},
    {category: '徳島県', name: '阿南・日和佐・宍喰'},
    {category: '香川県', name: '高松・さぬき・東かがわ'},
    {category: '香川県', name: '坂出・宇多津・丸亀'},
    {category: '香川県', name: '琴平・観音寺'},
    {category: '香川県', name: '小豆島・直島'},
    {category: '愛媛県', name: '松山・道後'},
    {category: '愛媛県', name: '今治・しまなみ海道'},
    {category: '愛媛県', name: '西条・新居浜・四国中央'},
    {category: '愛媛県', name: '宇和島・八幡浜'},
    {category: '高知県', name: '高知・南国・香南・伊野'},
    {category: '高知県', name: '安芸・室戸'},
    {category: '高知県', name: '足摺・四万十・宿毛・須崎'},
    {category: '福岡県', name: '博多・キャナルシティ・海の中道・太宰府・二日市'},
    {category: '福岡県', name: '天神・中洲・薬院・福岡ドーム・糸島'},
    {category: '福岡県', name: '北九州'},
    {category: '福岡県', name: '宗像・宮若・飯塚'},
    {category: '福岡県', name: '久留米・甘木・原鶴温泉・筑後川温泉'},
    {category: '福岡県', name: '北九州空港・苅田・行橋・豊前'},
    {category: '福岡県', name: '大牟田・柳川・八女・筑後'},
    {category: '佐賀県', name: '佐賀・古湯温泉'},
    {category: '佐賀県', name: '鳥栖'},
    {category: '佐賀県', name: '嬉野・武雄・伊万里・有田・太良'},
    {category: '佐賀県', name: '唐津・呼子'},
    {category: '長崎県', name: '長崎'},
    {category: '長崎県', name: '雲仙・島原・小浜'},
    {category: '長崎県', name: '諫早・大村・長崎空港'},
    {category: '長崎県', name: 'ハウステンボス・佐世保・平戸'},
    {category: '長崎県', name: '五島列島'},
    {category: '長崎県', name: '対馬'},
    {category: '長崎県', name: '壱岐島'},
    {category: '熊本県', name: '熊本'},
    {category: '熊本県', name: '大津・玉名・山鹿・荒尾・菊池'},
    {category: '熊本県', name: '阿蘇'},
    {category: '熊本県', name: '宇土・八代・水俣'},
    {category: '熊本県', name: '人吉・球磨'},
    {category: '熊本県', name: '天草･本渡'},
    {category: '熊本県', name: '黒川温泉・杖立'},
    {category: '大分県', name: '大分'},
    {category: '大分県', name: '別府・日出'},
    {category: '大分県', name: '佐伯・臼杵・豊後大野'},
    {category: '大分県', name: '湯布院・湯平'},
    {category: '大分県', name: '久住・竹田'},
    {category: '大分県', name: '九重・日田・天瀬'},
    {category: '大分県', name: '国東・中津・宇佐・耶馬渓'},
    {category: '宮崎県', name: '宮崎'},
    {category: '宮崎県', name: '高千穂・延岡・日向・高鍋'},
    {category: '宮崎県', name: '都城・えびの・日南・綾'},
    {category: '鹿児島県', name: '鹿児島・桜島'},
    {category: '鹿児島県', name: '霧島・国分・鹿児島空港'},
    {category: '鹿児島県', name: '鹿屋・垂水・志布志'},
    {category: '鹿児島県', name: '川内・出水'},
    {category: '鹿児島県', name: '指宿・枕崎・南さつま'},
    {category: '鹿児島県', name: '屋久島'},
    {category: '鹿児島県', name: '種子島'},
    {category: '鹿児島県', name: '奄美大島･喜界島・徳之島'},
    {category: '鹿児島県', name: '沖永良部島・与論島'},
    {category: '沖縄県', name: '那覇'},
    {category: '沖縄県', name: '恩納・名護・本部・今帰仁'},
    {category: '沖縄県', name: '宜野湾・北谷・読谷・沖縄市・うるま'},
    {category: '沖縄県', name: '糸満・豊見城・南城'},
    {category: '沖縄県', name: '慶良間・渡嘉敷・座間味・阿嘉'},
    {category: '沖縄県', name: '久米島'},
    {category: '沖縄県', name: '宮古島・伊良部島'},
    {category: '沖縄県', name: '石垣・西表・小浜島'},
    {category: '沖縄県', name: '与那国島'},
    {category: '沖縄県', name: '大東島'},
];

const prefectureSelect = document.getElementById('prefecture-select');
const placeSelect = document.getElementById('place-select');

// 大分類のプルダウンを生成
prefectures.forEach(prefecture => {
    const option = document.createElement('option');
    option.textContent = prefecture;
  
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
      if (prefectureSelect.value == place.category) {
        const option = document.createElement('option');
        option.textContent = place.name;
        
        placeSelect.appendChild(option);
      }
    });
  });


// モーダルウィンドウ 北海道
const modalH = document.querySelector('#js-modal-H');
const modalButtonH = document.querySelector('.js-modal-button-H');
const modalCloseH = document.querySelector('.js-close-button-H');
const detailsElementH = document.querySelector('.accordion-hokkaido');

var moda = false;

modalButtonH.addEventListener('click', () => {
  if (!moda) {
    modalH.classList.add('is-open');
    moda = true;
  } else {
    moda = false;
  }
  console.log('open');
});

modalCloseH.addEventListener('click', () => {
  modalH.classList.remove('is-open');
  console.log('modal-close');
  detailsElementH.removeAttribute('open');
  console.log('button-close')
});

//モーダルウィンドウ　東北
const modalT = document.querySelector('#js-modal-T');
const modalButtonT = document.querySelector('.js-modal-button-T');
const modalCloseT = document.querySelector('.js-close-button-T');
const detailsElementT = document.querySelector('.accordion-tohoku')

var moda = false

modalButtonT.addEventListener('click', () => {
  if (!moda) {
    modalT.classList.add('is-open');
    moda = true;
  } else {
    moda = false;
  }
  console.log('open');
});

modalCloseT.addEventListener('click', () => {
  modalT.classList.remove('is-open');
  console.log('modal-close');
  detailsElementT.removeAttribute('open');
  console.log('button-close')
});

//モーダルウィンドウ　関東
const modalK = document.querySelector('#js-modal-K');
const modalButtonK = document.querySelector('.js-modal-button-K');
const modalCloseK = document.querySelector('.js-close-button-K');
const detailsElementK = document.querySelector('.accordion-kanto')

var moda = false

modalButtonK.addEventListener('click', () => {
  if (!moda) {
    modalK.classList.add('is-open');
    moda = true;
  } else {
    moda = false;
  }
  console.log('open');
});

modalCloseK.addEventListener('click', () => {
  modalK.classList.remove('is-open');
  console.log('modal-close');
  detailsElementK.removeAttribute('open');
  console.log('button-close')
});

//モーダルウィンドウ　中部
const modalC = document.querySelector('#js-modal-C');
const modalButtonC = document.querySelector('.js-modal-button-C');
const modalCloseC = document.querySelector('.js-close-button-C');
const detailsElementC = document.querySelector('.accordion-chubu')

var moda = false

modalButtonC.addEventListener('click', () => {
  if (!moda) {
    modalC.classList.add('is-open');
    moda = true;
  } else {
    moda = false;
  }
  console.log('open');
});

modalCloseC.addEventListener('click', () => {
  modalC.classList.remove('is-open');
  console.log('modal-close');
  detailsElementC.removeAttribute('open');
  console.log('button-close')
});

//モーダルウィンドウ　近畿
const modalKK = document.querySelector('#js-modal-KK');
const modalButtonKK = document.querySelector('.js-modal-button-KK');
const modalCloseKK = document.querySelector('.js-close-button-KK');
const detailsElementKK = document.querySelector('.accordion-kinki')

var moda = false

modalButtonKK.addEventListener('click', () => {
  if (!moda) {
    modalKK.classList.add('is-open');
    moda = true;
  } else {
    moda = false;
  }
  console.log('open');
});

modalCloseKK.addEventListener('click', () => {
  modalKK.classList.remove('is-open');
  console.log('modal-close');
  detailsElementKK.removeAttribute('open');
  console.log('button-close')
});

//モーダルウィンドウ　中四国
const modalCS = document.querySelector('#js-modal-CS');
const modalButtonCS = document.querySelector('.js-modal-button-CS');
const modalCloseCS = document.querySelector('.js-close-button-CS');
const detailsElementCS = document.querySelector('.accordion-chushikoku')

var moda = false

modalButtonCS.addEventListener('click', () => {
  if (!moda) {
    modalCS.classList.add('is-open');
    moda = true;
  } else {
    moda = false;
  }
  console.log('open');
});

modalCloseCS.addEventListener('click', () => {
  modalCS.classList.remove('is-open');
  console.log('modal-close');
  detailsElementCS.removeAttribute('open');
  console.log('button-close')
});

//モーダルウィンドウ　九州
const modalKS = document.querySelector('#js-modal-KS');
const modalButtonKS = document.querySelector('.js-modal-button-KS');
const modalCloseKS = document.querySelector('.js-close-button-KS');
const detailsElementKS = document.querySelector('.accordion-kyushu')

var moda = false

modalButtonKS.addEventListener('click', () => {
  if (!moda) {
    modalKS.classList.add('is-open');
    moda = true;
  } else {
    moda = false;
  }
  console.log('open');
});

modalCloseKS.addEventListener('click', () => {
  modalKS.classList.remove('is-open');
  console.log('modal-close');
  detailsElementKS.removeAttribute('open');
  console.log('button-close')
});

//モーダルウィンドウ　沖縄
const modalO = document.querySelector('#js-modal-O');
const modalButtonO = document.querySelector('.js-modal-button-O');
const modalCloseO = document.querySelector('.js-close-button-O');
const detailsElementO = document.querySelector('.accordion-okinawa')

var moda = false

modalButtonO.addEventListener('click', () => {
  if (!moda) {
    modalO.classList.add('is-open');
    moda = true;
  } else {
    moda = false;
  }
  console.log('open');
});

modalCloseO.addEventListener('click', () => {
  modalO.classList.remove('is-open');
  console.log('modal-close');
  detailsElementO.removeAttribute('open');
  console.log('button-close')
});
