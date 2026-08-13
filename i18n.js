(() => {
  'use strict';

  const STORAGE_KEY = 'tzt-game-language';
  const SUPPORTED = ['en', 'ja', 'fr', 'es', 'ru', 'it', 'ar', 'ko', 'zh-CN', 'zh-TW', 'pt'];

  const translations = {
    en: {
      ui: { metaTitle:'TZT GAME | Free Browser Games', metaDescription:'Play Mahjong, racing and Texas Hold’em free in your browser.', brandAria:'TZT GAME home', brandTagline:'Play anytime', navAria:'Main navigation', navLobby:'Game Lobby', navDev:'Dev Log', navContact:'Contact', languageAria:'Change language', online:'3 games online', heroKicker:'WELCOME, PLAYER!', heroTitle:'Game Center', heroSub:'No install · Free to play · Auto updates', searchPlaceholder:'Search games', featuredKicker:'FEATURED GAMES', featuredTitle:'Featured Games', playable:'ready to play', emptyTitle:'No games found', emptyBody:'Try another keyword.', sideAria:'Game categories and details', quickCategories:'QUICK CATEGORIES', allGames:'All Games', allSlots:'12 slots', tableGames:'Table Games', tableSub:'Mahjong & cards', racingGames:'Racing', racingSub:'Speed & circuits', strategyGames:'Strategy', strategySub:'Think & challenge', comingSoon:'Coming Soon', futureSlots:'9 reserved slots', updates:'Always Updating', updateBody:'New games will appear here when they are ready.', previewClose:'Close game details', previewLabel:'GAME DETAILS', playNow:'START NOW', footerCenter:'Browser Game Center', contactAuthor:'Contact author', reservedLabel:'RESERVED', reservedTitle:'Coming Soon', reservedBody:'A future game will appear here' },
      games: {
        mahjong:{title:'Mahjong',cardCategory:'TABLE · STRATEGY',summary:'Four-player & three-player riichi',description:'A complete four-player and three-player riichi mahjong experience with calls, riichi, yaku results and AI efficiency analysis.',features:['4P / 3P riichi','AI efficiency analysis','Mobile friendly'],search:'mahjong riichi table strategy japanese',alt:'Cartoon Mahjong game cover'},
        racing:{title:'Racing',cardCategory:'RACING · SIMULATION',summary:'Race against AI rivals',description:'Drive a formula car across multiple circuits and race AI opponents with keyboard, touch or gamepad controls.',features:['Multiple circuits','AI opponents','Keyboard / touch / gamepad'],search:'racing formula speed simulation car',alt:'Cartoon racing game cover'},
        poker:{title:'Poker',cardCategory:'TABLE · STRATEGY',summary:'Challenge four AI players',description:'Single-player Texas Hold’em against four natural AI opponents, from pre-flop action all the way to the river.',features:['Four AI opponents','Full betting rounds','No sign-in'],search:'poker texas holdem cards strategy',alt:'Cartoon poker game cover'}
      }
    },
    ja: {
      ui: { metaTitle:'TZT GAME｜無料ブラウザゲーム', metaDescription:'麻雀、レース、テキサスホールデムをブラウザで無料プレイ。', brandAria:'TZT GAME ホーム', brandTagline:'いつでも遊べる', navAria:'メインナビゲーション', navLobby:'ゲームロビー', navDev:'開発ログ', navContact:'作者に連絡', languageAria:'言語を変更', online:'3本公開中', heroKicker:'ようこそ、プレイヤー！', heroTitle:'ゲームセンター', heroSub:'インストール不要 · 無料 · 自動更新', searchPlaceholder:'ゲームを検索', featuredKicker:'おすすめ', featuredTitle:'注目ゲーム', playable:'本をすぐにプレイ', emptyTitle:'ゲームが見つかりません', emptyBody:'別のキーワードをお試しください。', sideAria:'ゲームのカテゴリーと紹介', quickCategories:'クイック分類', allGames:'すべて', allSlots:'12スロット', tableGames:'テーブルゲーム', tableSub:'麻雀・カード', racingGames:'レーシング', racingSub:'スピード・コース', strategyGames:'ストラテジー', strategySub:'思考・挑戦', comingSoon:'近日公開', futureSlots:'予約枠9個', updates:'随時更新', updateBody:'完成した新作はここに追加されます。', previewClose:'ゲーム紹介を閉じる', previewLabel:'ゲーム紹介', playNow:'今すぐ開始', footerCenter:'ブラウザゲームセンター', contactAuthor:'作者に連絡', reservedLabel:'予約枠', reservedTitle:'近日公開', reservedBody:'新しいゲームを追加予定' },
      games: {
        mahjong:{title:'麻雀',cardCategory:'テーブル · 戦略',summary:'四人・三人リーチ麻雀',description:'四人麻雀と三人麻雀を遊べる本格リーチ麻雀。鳴き、立直、役表示、AI牌効率分析に対応。',features:['四人 / 三人麻雀','AI牌効率分析','スマホ対応'],search:'麻雀 リーチ麻雀 テーブル 戦略',alt:'麻雀のカートゥーンゲームカバー'},
        racing:{title:'レーシング',cardCategory:'レース · シミュレーション',summary:'AIライバルと対戦',description:'フォーミュラカーで複数のコースに挑戦。キーボード、タッチ、ゲームパッドに対応。',features:['複数のコース','AIライバル','キー / タッチ / パッド'],search:'レース レーシング 車 シミュレーション',alt:'レーシングのカートゥーンゲームカバー'},
        poker:{title:'ポーカー',cardCategory:'カード · 戦略',summary:'4人のAIに挑戦',description:'4人の自然なAIと戦う一人用テキサスホールデム。プリフロップからリバーまで完全収録。',features:['4人のAI','完全なベット進行','ログイン不要'],search:'ポーカー テキサスホールデム カード 戦略',alt:'ポーカーのカートゥーンゲームカバー'}
      }
    },
    fr: {
      ui:{metaTitle:'TZT GAME | Jeux gratuits en ligne',metaDescription:'Jouez gratuitement au mah-jong, à la course et au Texas Hold’em.',brandAria:'Accueil TZT GAME',brandTagline:'Jouez à tout moment',navAria:'Navigation principale',navLobby:'Accueil des jeux',navDev:'Journal de dev',navContact:'Contact',languageAria:'Changer de langue',online:'3 jeux en ligne',heroKicker:'BIENVENUE !',heroTitle:'Centre de jeux',heroSub:'Sans installation · Gratuit · Mises à jour auto',searchPlaceholder:'Rechercher un jeu',featuredKicker:'JEUX À LA UNE',featuredTitle:'Jeux à la une',playable:'jeux disponibles',emptyTitle:'Aucun jeu trouvé',emptyBody:'Essayez un autre mot-clé.',sideAria:'Catégories et détails des jeux',quickCategories:'CATÉGORIES',allGames:'Tous les jeux',allSlots:'12 emplacements',tableGames:'Jeux de table',tableSub:'Mah-jong et cartes',racingGames:'Course',racingSub:'Vitesse et circuits',strategyGames:'Stratégie',strategySub:'Réflexion et défi',comingSoon:'Bientôt',futureSlots:'9 places réservées',updates:'Toujours à jour',updateBody:'Les nouveaux jeux apparaîtront ici une fois prêts.',previewClose:'Fermer les détails',previewLabel:'DÉTAILS DU JEU',playNow:'JOUER',footerCenter:'Centre de jeux web',contactAuthor:'Contacter l’auteur',reservedLabel:'RÉSERVÉ',reservedTitle:'Bientôt',reservedBody:'Un futur jeu apparaîtra ici'},
      games:{mahjong:{title:'Mah-jong',cardCategory:'TABLE · STRATÉGIE',summary:'Riichi à quatre ou trois joueurs',description:'Une expérience complète de mah-jong riichi à quatre ou trois joueurs, avec appels, riichi, résultats des yaku et analyse IA.',features:['Riichi à 4 / 3','Analyse IA','Adapté au mobile'],search:'mahjong riichi table stratégie japonais',alt:'Couverture cartoon du jeu de mah-jong'},racing:{title:'Course',cardCategory:'COURSE · SIMULATION',summary:'Affrontez les pilotes IA',description:'Pilotez une monoplace sur plusieurs circuits avec clavier, écran tactile ou manette.',features:['Plusieurs circuits','Adversaires IA','Clavier / tactile / manette'],search:'course voiture formule vitesse simulation',alt:'Couverture cartoon du jeu de course'},poker:{title:'Poker',cardCategory:'CARTES · STRATÉGIE',summary:'Défiez quatre joueurs IA',description:'Texas Hold’em solo contre quatre adversaires IA, du pré-flop jusqu’à la rivière.',features:['Quatre adversaires IA','Mises complètes','Sans connexion'],search:'poker texas holdem cartes stratégie',alt:'Couverture cartoon du jeu de poker'}}
    },
    es: {
      ui:{metaTitle:'TZT GAME | Juegos gratis online',metaDescription:'Juega gratis a Mahjong, carreras y Texas Hold’em en tu navegador.',brandAria:'Inicio de TZT GAME',brandTagline:'Juega cuando quieras',navAria:'Navegación principal',navLobby:'Sala de juegos',navDev:'Diario de desarrollo',navContact:'Contacto',languageAria:'Cambiar idioma',online:'3 juegos online',heroKicker:'¡BIENVENIDO!',heroTitle:'Centro de juegos',heroSub:'Sin instalación · Gratis · Actualización automática',searchPlaceholder:'Buscar juegos',featuredKicker:'JUEGOS DESTACADOS',featuredTitle:'Juegos destacados',playable:'juegos listos',emptyTitle:'No se encontraron juegos',emptyBody:'Prueba otra palabra.',sideAria:'Categorías y detalles',quickCategories:'CATEGORÍAS',allGames:'Todos',allSlots:'12 espacios',tableGames:'Juegos de mesa',tableSub:'Mahjong y cartas',racingGames:'Carreras',racingSub:'Velocidad y circuitos',strategyGames:'Estrategia',strategySub:'Piensa y compite',comingSoon:'Próximamente',futureSlots:'9 espacios reservados',updates:'Siempre actualizado',updateBody:'Los juegos nuevos aparecerán aquí cuando estén listos.',previewClose:'Cerrar detalles',previewLabel:'DETALLES DEL JUEGO',playNow:'JUGAR AHORA',footerCenter:'Centro de juegos web',contactAuthor:'Contactar al autor',reservedLabel:'RESERVADO',reservedTitle:'Próximamente',reservedBody:'Aquí aparecerá un juego futuro'},
      games:{mahjong:{title:'Mahjong',cardCategory:'MESA · ESTRATEGIA',summary:'Riichi para cuatro o tres',description:'Mahjong riichi completo para cuatro y tres jugadores, con llamadas, riichi, resultados de yaku y análisis de eficiencia con IA.',features:['Riichi 4 / 3','Análisis con IA','Adaptado a móvil'],search:'mahjong riichi mesa estrategia japonés',alt:'Portada de juego de Mahjong'},racing:{title:'Carreras',cardCategory:'CARRERAS · SIMULACIÓN',summary:'Compite contra la IA',description:'Conduce un monoplaza por varios circuitos con teclado, controles táctiles o mando.',features:['Varios circuitos','Rivales IA','Teclado / táctil / mando'],search:'carreras coche fórmula velocidad simulación',alt:'Portada de juego de carreras'},poker:{title:'Póker',cardCategory:'CARTAS · ESTRATEGIA',summary:'Desafía a cuatro IA',description:'Texas Hold’em para un jugador contra cuatro rivales IA, desde el preflop hasta el river.',features:['Cuatro rivales IA','Rondas completas','Sin registro'],search:'póker texas holdem cartas estrategia',alt:'Portada de juego de póker'}}
    },
    ru: {
      ui:{metaTitle:'TZT GAME | Бесплатные браузерные игры',metaDescription:'Играйте бесплатно в маджонг, гонки и техасский холдем.',brandAria:'Главная TZT GAME',brandTagline:'Играйте в любое время',navAria:'Основная навигация',navLobby:'Игровой зал',navDev:'Журнал разработки',navContact:'Связаться',languageAria:'Сменить язык',online:'3 игры онлайн',heroKicker:'ДОБРО ПОЖАЛОВАТЬ!',heroTitle:'Игровой центр',heroSub:'Без установки · Бесплатно · Автообновление',searchPlaceholder:'Поиск игр',featuredKicker:'ЛУЧШИЕ ИГРЫ',featuredTitle:'Рекомендуемые игры',playable:'игры доступны',emptyTitle:'Игры не найдены',emptyBody:'Попробуйте другое слово.',sideAria:'Категории и описание игр',quickCategories:'КАТЕГОРИИ',allGames:'Все игры',allSlots:'12 мест',tableGames:'Настольные',tableSub:'Маджонг и карты',racingGames:'Гонки',racingSub:'Скорость и трассы',strategyGames:'Стратегии',strategySub:'Думайте и побеждайте',comingSoon:'Скоро',futureSlots:'9 свободных мест',updates:'Постоянные обновления',updateBody:'Новые игры появятся здесь после выпуска.',previewClose:'Закрыть описание',previewLabel:'ОБ ИГРЕ',playNow:'ИГРАТЬ',footerCenter:'Центр браузерных игр',contactAuthor:'Связаться с автором',reservedLabel:'СВОБОДНО',reservedTitle:'Скоро',reservedBody:'Здесь появится новая игра'},
      games:{mahjong:{title:'Маджонг',cardCategory:'СТОЛ · СТРАТЕГИЯ',summary:'Риичи на четверых и троих',description:'Полный риичи-маджонг для четырёх и трёх игроков: коллы, риичи, яку и анализ эффективности ИИ.',features:['Риичи 4 / 3','Анализ ИИ','Для мобильных'],search:'маджонг риичи настольная стратегия',alt:'Обложка игры Маджонг'},racing:{title:'Гонки',cardCategory:'ГОНКИ · СИМУЛЯТОР',summary:'Гонка против ИИ',description:'Управляйте болидом на нескольких трассах с клавиатуры, сенсорного экрана или геймпада.',features:['Несколько трасс','Соперники ИИ','Клавиши / сенсор / геймпад'],search:'гонки формула скорость симулятор',alt:'Обложка гоночной игры'},poker:{title:'Покер',cardCategory:'КАРТЫ · СТРАТЕГИЯ',summary:'Игра с четырьмя ИИ',description:'Одиночный техасский холдем против четырёх ИИ — от префлопа до ривера.',features:['Четыре ИИ','Все раунды ставок','Без регистрации'],search:'покер техасский холдем карты стратегия',alt:'Обложка игры Покер'}}
    },
    it: {
      ui:{metaTitle:'TZT GAME | Giochi online gratuiti',metaDescription:'Gioca gratis a Mahjong, corse e Texas Hold’em nel browser.',brandAria:'Home TZT GAME',brandTagline:'Gioca quando vuoi',navAria:'Navigazione principale',navLobby:'Sala giochi',navDev:'Diario di sviluppo',navContact:'Contatti',languageAria:'Cambia lingua',online:'3 giochi online',heroKicker:'BENVENUTO!',heroTitle:'Centro giochi',heroSub:'Nessuna installazione · Gratis · Aggiornamenti auto',searchPlaceholder:'Cerca giochi',featuredKicker:'GIOCHI IN EVIDENZA',featuredTitle:'Giochi in evidenza',playable:'giochi disponibili',emptyTitle:'Nessun gioco trovato',emptyBody:'Prova un’altra parola.',sideAria:'Categorie e dettagli',quickCategories:'CATEGORIE',allGames:'Tutti i giochi',allSlots:'12 spazi',tableGames:'Giochi da tavolo',tableSub:'Mahjong e carte',racingGames:'Corse',racingSub:'Velocità e circuiti',strategyGames:'Strategia',strategySub:'Pensa e sfida',comingSoon:'Prossimamente',futureSlots:'9 spazi riservati',updates:'Sempre aggiornato',updateBody:'I nuovi giochi appariranno qui quando pronti.',previewClose:'Chiudi dettagli',previewLabel:'DETTAGLI DEL GIOCO',playNow:'GIOCA ORA',footerCenter:'Centro giochi web',contactAuthor:'Contatta l’autore',reservedLabel:'RISERVATO',reservedTitle:'Prossimamente',reservedBody:'Qui apparirà un nuovo gioco'},
      games:{mahjong:{title:'Mahjong',cardCategory:'TAVOLO · STRATEGIA',summary:'Riichi a quattro o tre',description:'Mahjong riichi completo per quattro e tre giocatori, con chiamate, riichi, risultati yaku e analisi IA.',features:['Riichi 4 / 3','Analisi IA','Ottimizzato mobile'],search:'mahjong riichi tavolo strategia giapponese',alt:'Copertina cartoon Mahjong'},racing:{title:'Corse',cardCategory:'CORSE · SIMULAZIONE',summary:'Sfida i piloti IA',description:'Guida una monoposto su vari circuiti con tastiera, tocco o gamepad.',features:['Vari circuiti','Avversari IA','Tastiera / tocco / gamepad'],search:'corse auto formula velocità simulazione',alt:'Copertina cartoon del gioco di corse'},poker:{title:'Poker',cardCategory:'CARTE · STRATEGIA',summary:'Sfida quattro IA',description:'Texas Hold’em in singolo contro quattro avversari IA, dal pre-flop fino al river.',features:['Quattro avversari IA','Puntate complete','Senza accesso'],search:'poker texas holdem carte strategia',alt:'Copertina cartoon Poker'}}
    },
    ar: {
      ui:{metaTitle:'TZT GAME | ألعاب متصفح مجانية',metaDescription:'العب الماجونغ والسباقات وتكساس هولدم مجانًا في المتصفح.',brandAria:'الصفحة الرئيسية لـ TZT GAME',brandTagline:'العب في أي وقت',navAria:'التنقل الرئيسي',navLobby:'صالة الألعاب',navDev:'سجل التطوير',navContact:'تواصل معنا',languageAria:'تغيير اللغة',online:'3 ألعاب متاحة',heroKicker:'مرحبًا أيها اللاعب!',heroTitle:'مركز الألعاب',heroSub:'بلا تثبيت · مجاني · تحديث تلقائي',searchPlaceholder:'ابحث عن لعبة',featuredKicker:'ألعاب مميزة',featuredTitle:'الألعاب المميزة',playable:'ألعاب جاهزة',emptyTitle:'لم نعثر على ألعاب',emptyBody:'جرّب كلمة أخرى.',sideAria:'فئات الألعاب وتفاصيلها',quickCategories:'الفئات السريعة',allGames:'كل الألعاب',allSlots:'12 خانة',tableGames:'ألعاب الطاولة',tableSub:'ماجونغ وبطاقات',racingGames:'سباقات',racingSub:'سرعة وحلبات',strategyGames:'استراتيجية',strategySub:'فكر وتحدَّ',comingSoon:'قريبًا',futureSlots:'9 خانات محجوزة',updates:'تحديث مستمر',updateBody:'ستظهر الألعاب الجديدة هنا عند اكتمالها.',previewClose:'إغلاق التفاصيل',previewLabel:'تفاصيل اللعبة',playNow:'ابدأ الآن',footerCenter:'مركز ألعاب المتصفح',contactAuthor:'تواصل مع المطور',reservedLabel:'محجوز',reservedTitle:'قريبًا',reservedBody:'ستظهر لعبة جديدة هنا'},
      games:{mahjong:{title:'ماجونغ',cardCategory:'طاولة · استراتيجية',summary:'رييتشي لأربعة أو ثلاثة لاعبين',description:'تجربة ماجونغ رييتشي كاملة لأربعة وثلاثة لاعبين مع النداءات والرييتشي ونتائج الياكو وتحليل الذكاء الاصطناعي.',features:['رييتشي 4 / 3','تحليل بالذكاء الاصطناعي','مناسب للهاتف'],search:'ماجونغ رييتشي طاولة استراتيجية',alt:'غلاف كرتوني للعبة ماجونغ'},racing:{title:'سباق',cardCategory:'سباق · محاكاة',summary:'تسابق ضد الذكاء الاصطناعي',description:'قد سيارة فورمولا على حلبات متعددة باستخدام لوحة المفاتيح أو اللمس أو يد التحكم.',features:['حلبات متعددة','منافسون آليون','لوحة / لمس / يد تحكم'],search:'سباق سيارات فورمولا سرعة محاكاة',alt:'غلاف كرتوني للعبة سباق'},poker:{title:'بوكر',cardCategory:'بطاقات · استراتيجية',summary:'تحدَّ أربعة لاعبين آليين',description:'تكساس هولدم فردي ضد أربعة منافسين آليين من ما قبل الفلوب حتى الريفر.',features:['أربعة منافسين آليين','جولات رهان كاملة','بلا تسجيل'],search:'بوكر تكساس هولدم بطاقات استراتيجية',alt:'غلاف كرتوني للعبة بوكر'}}
    },
    ko: {
      ui:{metaTitle:'TZT GAME | 무료 웹 게임',metaDescription:'마작, 레이싱, 텍사스 홀덤을 브라우저에서 무료로 즐기세요.',brandAria:'TZT GAME 홈',brandTagline:'언제든 플레이',navAria:'주요 메뉴',navLobby:'게임 로비',navDev:'개발 기록',navContact:'문의',languageAria:'언어 변경',online:'게임 3개 공개',heroKicker:'환영합니다!',heroTitle:'게임 센터',heroSub:'설치 없음 · 무료 플레이 · 자동 업데이트',searchPlaceholder:'게임 검색',featuredKicker:'추천 게임',featuredTitle:'추천 게임',playable:'개 바로 플레이',emptyTitle:'게임을 찾지 못했습니다',emptyBody:'다른 검색어를 입력해 보세요.',sideAria:'게임 분류 및 소개',quickCategories:'빠른 분류',allGames:'전체 게임',allSlots:'12개 슬롯',tableGames:'테이블 게임',tableSub:'마작 및 카드',racingGames:'레이싱',racingSub:'속도 및 서킷',strategyGames:'전략 게임',strategySub:'생각하고 도전',comingSoon:'출시 예정',futureSlots:'예약 슬롯 9개',updates:'계속 업데이트',updateBody:'새 게임이 완성되면 이곳에 표시됩니다.',previewClose:'게임 소개 닫기',previewLabel:'게임 소개',playNow:'지금 시작',footerCenter:'웹 게임 센터',contactAuthor:'제작자에게 문의',reservedLabel:'예약 공간',reservedTitle:'출시 예정',reservedBody:'새 게임이 이곳에 추가됩니다'},
      games:{mahjong:{title:'마작',cardCategory:'테이블 · 전략',summary:'4인 및 3인 리치 마작',description:'울기, 리치, 역 결과, AI 효율 분석을 갖춘 완전한 4인·3인 리치 마작입니다.',features:['4인 / 3인 리치','AI 효율 분석','모바일 지원'],search:'마작 리치 테이블 전략 일본',alt:'마작 카툰 게임 표지'},racing:{title:'레이싱',cardCategory:'레이싱 · 시뮬레이션',summary:'AI 라이벌과 경주',description:'포뮬러 카로 여러 서킷을 달리며 키보드, 터치 또는 게임패드로 AI와 겨룹니다.',features:['여러 서킷','AI 라이벌','키보드 / 터치 / 패드'],search:'레이싱 포뮬러 자동차 속도 시뮬레이션',alt:'레이싱 카툰 게임 표지'},poker:{title:'포커',cardCategory:'카드 · 전략',summary:'AI 4명에게 도전',description:'프리플롭부터 리버까지 네 명의 AI와 겨루는 싱글 플레이 텍사스 홀덤입니다.',features:['AI 상대 4명','전체 베팅 라운드','로그인 불필요'],search:'포커 텍사스 홀덤 카드 전략',alt:'포커 카툰 게임 표지'}}
    },
    'zh-CN': {
      ui:{metaTitle:'TZT GAME｜免费网页小游戏：日麻、赛车、德州扑克',metaDescription:'无需安装，免费游玩四人及三人日麻、方程式赛车和单机德州扑克。',brandAria:'TZT GAME 首页',brandTagline:'随时开玩',navAria:'主导航',navLobby:'游戏大厅',navDev:'开发日志',navContact:'联系作者',languageAria:'切换语言',online:'3 款在线',heroKicker:'欢迎，玩家！',heroTitle:'游戏中心',heroSub:'无需安装 · 免费游玩 · 自动更新',searchPlaceholder:'搜索游戏',featuredKicker:'推荐游戏',featuredTitle:'推荐游戏',playable:'款可以立即游玩',emptyTitle:'没有找到这个游戏',emptyBody:'换个关键词试试看吧。',sideAria:'游戏分类与介绍',quickCategories:'快速分类',allGames:'全部游戏',allSlots:'12 个位置',tableGames:'棋牌游戏',tableSub:'麻将与卡牌',racingGames:'竞速游戏',racingSub:'速度与赛道',strategyGames:'策略游戏',strategySub:'思考与挑战',comingSoon:'即将上线',futureSlots:'9 个预留位置',updates:'持续更新',updateBody:'新游戏完成后会自动出现在这里。',previewClose:'关闭游戏介绍',previewLabel:'游戏介绍',playNow:'立即开始',footerCenter:'网页小游戏中心',contactAuthor:'联系作者',reservedLabel:'预留位置',reservedTitle:'敬请期待',reservedBody:'未来游戏将在这里出现'},
      games:{mahjong:{title:'麻雀',cardCategory:'棋牌 · 策略',summary:'四人及三人日麻',description:'完整的四人及三人日式麻将体验，包含立直、吃碰杠、和牌番种展示与 AI 牌效分析。',features:['四人 / 三人日麻','AI 牌效分析','手机端适配'],search:'麻雀 日麻 麻将 棋牌 策略',alt:'麻雀卡通游戏封面'},racing:{title:'赛车',cardCategory:'竞速 · 模拟',summary:'赛道与 AI 对手',description:'驾驶方程式赛车挑战多条赛道，与 AI 对手竞速，支持键盘、手机触控和游戏手柄。',features:['多条真实赛道','AI 竞速对手','键鼠 / 触控 / 手柄'],search:'赛车 方程式 竞速 模拟',alt:'赛车卡通游戏封面'},poker:{title:'德扑',cardCategory:'棋牌 · 策略',summary:'挑战四名 AI',description:'单机德州扑克牌桌，对战四名风格自然的 AI 对手，体验完整的翻牌前到河牌轮次。',features:['四名 AI 对手','完整下注流程','无需登录'],search:'德扑 德州扑克 棋牌 策略',alt:'德扑卡通游戏封面'}}
    },
    'zh-TW': {
      ui:{metaTitle:'TZT GAME｜免費網頁小遊戲',metaDescription:'免安裝，免費遊玩日麻、方程式賽車和德州撲克。',brandAria:'TZT GAME 首頁',brandTagline:'隨時開玩',navAria:'主選單',navLobby:'遊戲大廳',navDev:'開發日誌',navContact:'聯絡作者',languageAria:'切換語言',online:'3 款上線',heroKicker:'歡迎，玩家！',heroTitle:'遊戲中心',heroSub:'免安裝 · 免費遊玩 · 自動更新',searchPlaceholder:'搜尋遊戲',featuredKicker:'精選遊戲',featuredTitle:'推薦遊戲',playable:'款可立即遊玩',emptyTitle:'找不到這個遊戲',emptyBody:'換個關鍵字試試看。',sideAria:'遊戲分類與介紹',quickCategories:'快速分類',allGames:'全部遊戲',allSlots:'12 個位置',tableGames:'棋牌遊戲',tableSub:'麻將與卡牌',racingGames:'競速遊戲',racingSub:'速度與賽道',strategyGames:'策略遊戲',strategySub:'思考與挑戰',comingSoon:'即將推出',futureSlots:'9 個預留位置',updates:'持續更新',updateBody:'新遊戲完成後會自動出現在這裡。',previewClose:'關閉遊戲介紹',previewLabel:'遊戲介紹',playNow:'立即開始',footerCenter:'網頁小遊戲中心',contactAuthor:'聯絡作者',reservedLabel:'預留位置',reservedTitle:'敬請期待',reservedBody:'未來遊戲將在這裡出現'},
      games:{mahjong:{title:'麻雀',cardCategory:'棋牌 · 策略',summary:'四人及三人日麻',description:'完整的四人及三人日式麻將體驗，包含立直、吃碰槓、和牌番種顯示與 AI 牌效分析。',features:['四人 / 三人日麻','AI 牌效分析','手機版適配'],search:'麻雀 日麻 麻將 棋牌 策略',alt:'麻雀卡通遊戲封面'},racing:{title:'賽車',cardCategory:'競速 · 模擬',summary:'賽道與 AI 對手',description:'駕駛方程式賽車挑戰多條賽道，與 AI 對手競速，支援鍵盤、觸控和遊戲手把。',features:['多條真實賽道','AI 競速對手','鍵盤 / 觸控 / 手把'],search:'賽車 方程式 競速 模擬',alt:'賽車卡通遊戲封面'},poker:{title:'德撲',cardCategory:'棋牌 · 策略',summary:'挑戰四名 AI',description:'單機德州撲克牌桌，對戰四名自然的 AI 對手，體驗完整的翻牌前到河牌輪次。',features:['四名 AI 對手','完整下注流程','無需登入'],search:'德撲 德州撲克 棋牌 策略',alt:'德撲卡通遊戲封面'}}
    },
    pt: {
      ui:{metaTitle:'TZT GAME | Jogos grátis no navegador',metaDescription:'Jogue Mahjong, corrida e Texas Hold’em grátis no navegador.',brandAria:'Início do TZT GAME',brandTagline:'Jogue quando quiser',navAria:'Navegação principal',navLobby:'Salão de jogos',navDev:'Diário de desenvolvimento',navContact:'Contato',languageAria:'Mudar idioma',online:'3 jogos online',heroKicker:'BEM-VINDO!',heroTitle:'Centro de jogos',heroSub:'Sem instalar · Grátis · Atualização automática',searchPlaceholder:'Buscar jogos',featuredKicker:'JOGOS EM DESTAQUE',featuredTitle:'Jogos em destaque',playable:'jogos disponíveis',emptyTitle:'Nenhum jogo encontrado',emptyBody:'Tente outra palavra.',sideAria:'Categorias e detalhes',quickCategories:'CATEGORIAS',allGames:'Todos os jogos',allSlots:'12 espaços',tableGames:'Jogos de mesa',tableSub:'Mahjong e cartas',racingGames:'Corrida',racingSub:'Velocidade e pistas',strategyGames:'Estratégia',strategySub:'Pense e desafie',comingSoon:'Em breve',futureSlots:'9 espaços reservados',updates:'Sempre atualizado',updateBody:'Novos jogos aparecerão aqui quando estiverem prontos.',previewClose:'Fechar detalhes',previewLabel:'DETALHES DO JOGO',playNow:'JOGAR AGORA',footerCenter:'Centro de jogos web',contactAuthor:'Contatar o autor',reservedLabel:'RESERVADO',reservedTitle:'Em breve',reservedBody:'Um novo jogo aparecerá aqui'},
      games:{mahjong:{title:'Mahjong',cardCategory:'MESA · ESTRATÉGIA',summary:'Riichi para quatro ou três',description:'Mahjong riichi completo para quatro e três jogadores, com chamadas, riichi, resultados de yaku e análise por IA.',features:['Riichi 4 / 3','Análise por IA','Adaptado ao celular'],search:'mahjong riichi mesa estratégia japonês',alt:'Capa cartoon do jogo Mahjong'},racing:{title:'Corrida',cardCategory:'CORRIDA · SIMULAÇÃO',summary:'Corra contra a IA',description:'Pilote um carro de fórmula em várias pistas com teclado, toque ou controle.',features:['Várias pistas','Rivais de IA','Teclado / toque / controle'],search:'corrida carro fórmula velocidade simulação',alt:'Capa cartoon do jogo de corrida'},poker:{title:'Pôquer',cardCategory:'CARTAS · ESTRATÉGIA',summary:'Desafie quatro IAs',description:'Texas Hold’em para um jogador contra quatro rivais de IA, do pré-flop até o river.',features:['Quatro rivais de IA','Rodadas completas','Sem cadastro'],search:'pôquer texas holdem cartas estratégia',alt:'Capa cartoon do jogo de pôquer'}}
    }
  };

  const spiderTranslations = {
    en:{title:'Spider Solitaire',cardCategory:'CARDS · STRATEGY',summary:'Three levels and daily challenges',description:'Classic Spider Solitaire with one-, two- and four-suit difficulty, unlimited hints and a daily speed leaderboard.',features:['3 standard levels','Unlimited hints','Daily leaderboard'],search:'spider solitaire cards strategy daily',alt:'Cartoon Spider Solitaire game cover'},
    ja:{title:'スパイダーソリティア',cardCategory:'カード · 戦略',summary:'3段階の難易度とデイリー',description:'1・2・4スートの難易度、無制限ヒント、デイリータイムランキングを備えた定番スパイダーソリティア。',features:['3段階の難易度','無制限ヒント','デイリーランキング'],search:'スパイダー ソリティア カード 戦略',alt:'スパイダーソリティアのカートゥーンカバー'},
    fr:{title:'Spider Solitaire',cardCategory:'CARTES · STRATÉGIE',summary:'Trois niveaux et défi quotidien',description:'Spider Solitaire classique avec un, deux ou quatre symboles, indices illimités et classement quotidien.',features:['3 niveaux','Indices illimités','Classement quotidien'],search:'spider solitaire cartes stratégie quotidien',alt:'Couverture cartoon de Spider Solitaire'},
    es:{title:'Solitario Spider',cardCategory:'CARTAS · ESTRATEGIA',summary:'Tres niveles y reto diario',description:'Solitario Spider clásico con uno, dos o cuatro palos, pistas ilimitadas y clasificación diaria.',features:['3 niveles','Pistas ilimitadas','Clasificación diaria'],search:'solitario spider cartas estrategia diario',alt:'Portada cartoon de Solitario Spider'},
    ru:{title:'Паук',cardCategory:'КАРТЫ · СТРАТЕГИЯ',summary:'Три уровня и ежедневный турнир',description:'Классический пасьянс Паук: одна, две или четыре масти, бесконечные подсказки и ежедневный рейтинг.',features:['3 уровня','Подсказки без лимита','Ежедневный рейтинг'],search:'пасьянс паук карты стратегия',alt:'Обложка пасьянса Паук'},
    it:{title:'Solitario Spider',cardCategory:'CARTE · STRATEGIA',summary:'Tre livelli e sfida giornaliera',description:'Solitario Spider classico con uno, due o quattro semi, suggerimenti illimitati e classifica giornaliera.',features:['3 livelli','Suggerimenti illimitati','Classifica giornaliera'],search:'solitario spider carte strategia',alt:'Copertina cartoon di Solitario Spider'},
    ar:{title:'سوليتير العنكبوت',cardCategory:'بطاقات · استراتيجية',summary:'ثلاثة مستويات وتحد يومي',description:'سوليتير العنكبوت الكلاسيكي بصعوبة لون أو لونين أو أربعة، وتلميحات غير محدودة وترتيب يومي.',features:['3 مستويات','تلميحات بلا حدود','ترتيب يومي'],search:'سوليتير العنكبوت بطاقات استراتيجية',alt:'غلاف كرتوني لسوليتير العنكبوت'},
    ko:{title:'스파이더 카드놀이',cardCategory:'카드 · 전략',summary:'3단계 난이도와 일일 도전',description:'1·2·4 슈트 난이도, 무제한 힌트, 일일 기록 순위를 갖춘 클래식 스파이더 카드놀이입니다.',features:['3단계 난이도','무제한 힌트','일일 순위'],search:'스파이더 카드놀이 솔리테어 전략',alt:'스파이더 카드놀이 카툰 표지'},
    'zh-CN':{title:'蜘蛛纸牌',cardCategory:'纸牌 · 策略',summary:'三档难度与每日挑战',description:'经典蜘蛛纸牌，提供单花色、双花色和四花色三档难度，并支持无限提示与每日挑战排行榜。',features:['三档标准难度','无限次数提示','每日挑战排行榜'],search:'蜘蛛纸牌 纸牌 接龙 策略',alt:'蜘蛛纸牌卡通游戏封面'},
    'zh-TW':{title:'蜘蛛紙牌',cardCategory:'紙牌 · 策略',summary:'三種難度與每日挑戰',description:'經典蜘蛛紙牌，提供單花色、雙花色和四花色三種難度，並支援無限提示與每日挑戰排行榜。',features:['三種標準難度','無限次提示','每日挑戰排行榜'],search:'蜘蛛紙牌 紙牌 接龍 策略',alt:'蜘蛛紙牌卡通遊戲封面'},
    pt:{title:'Paciência Spider',cardCategory:'CARTAS · ESTRATÉGIA',summary:'Três níveis e desafio diário',description:'Paciência Spider clássica com um, dois ou quatro naipes, dicas ilimitadas e ranking diário.',features:['3 níveis','Dicas ilimitadas','Ranking diário'],search:'paciência spider cartas estratégia',alt:'Capa cartoon de Paciência Spider'}
  };

  const availabilityTranslations = {
    en:['6 games online','6 reserved slots'],ja:['6本公開中','予約枠6個'],fr:['6 jeux en ligne','6 places réservées'],es:['6 juegos online','6 espacios reservados'],ru:['6 игр онлайн','6 свободных мест'],it:['6 giochi online','6 spazi riservati'],ar:['6 ألعاب متاحة','6 خانات محجوزة'],ko:['게임 6개 공개','예약 슬롯 6개'],'zh-CN':['6 款在线','6 个预留位置'],'zh-TW':['6 款上線','6 個預留位置'],pt:['6 jogos online','6 espaços reservados']
  };
  const newGameTranslations = {
    en:{minesweeper:{title:'Minesweeper',cardCategory:'LOGIC · PUZZLE',summary:'Three levels and easy flagging',description:'Classic Minesweeper with three standard difficulties, a safe first move and mobile-friendly flag controls.',features:['3 standard levels','Mobile flag mode & long press','Desktop left / right click'],search:'minesweeper logic mines puzzle',alt:'Cartoon Minesweeper game cover'},'2048':{title:'2048',cardCategory:'NUMBERS · PUZZLE',summary:'Smooth merging with undo',description:'A smooth number-merging puzzle with touch swipes, keyboard and mouse controls, plus step-by-step undo.',features:['Smooth mobile swipes','Keyboard & mouse controls','Step-by-step undo'],search:'2048 numbers merge puzzle',alt:'Cartoon 2048 game cover'}},
    ja:{minesweeper:{title:'マインスイーパー',cardCategory:'ロジック · パズル',summary:'3段階と簡単な旗操作',description:'3段階の難易度、初手安全、スマホ向け旗モードを備えた定番マインスイーパー。',features:['3段階','旗モードと長押し','左右クリック対応'],search:'マインスイーパー 地雷 パズル',alt:'マインスイーパーのカートゥーンカバー'},'2048':{title:'2048',cardCategory:'数字 · パズル',summary:'なめらかな合成と元に戻す',description:'スワイプ、キーボード、マウス操作と一手戻しに対応した数字合成パズル。',features:['滑らかなスワイプ','キー・マウス対応','一手戻す'],search:'2048 数字 合成 パズル',alt:'2048のカートゥーンカバー'}},
    fr:{minesweeper:{title:'Démineur',cardCategory:'LOGIQUE · PUZZLE',summary:'Trois niveaux et drapeaux faciles',description:'Démineur classique avec trois niveaux, premier coup sûr et mode drapeau mobile.',features:['3 niveaux','Mode drapeau mobile','Clic gauche / droit'],search:'démineur logique mines puzzle',alt:'Couverture cartoon du Démineur'},'2048':{title:'2048',cardCategory:'NOMBRES · PUZZLE',summary:'Fusion fluide et annulation',description:'Puzzle de nombres fluide avec glissement tactile, clavier, souris et annulation.',features:['Glissement fluide','Clavier et souris','Annulation'],search:'2048 nombres fusion puzzle',alt:'Couverture cartoon de 2048'}},
    es:{minesweeper:{title:'Buscaminas',cardCategory:'LÓGICA · PUZLE',summary:'Tres niveles y banderas fáciles',description:'Buscaminas clásico con tres niveles, primer toque seguro y modo bandera móvil.',features:['3 niveles','Modo bandera móvil','Clic izquierdo / derecho'],search:'buscaminas lógica minas puzle',alt:'Portada cartoon de Buscaminas'},'2048':{title:'2048',cardCategory:'NÚMEROS · PUZLE',summary:'Fusión fluida y deshacer',description:'Puzle numérico fluido con gestos, teclado, ratón y deshacer.',features:['Gestos fluidos','Teclado y ratón','Deshacer'],search:'2048 números fusionar puzle',alt:'Portada cartoon de 2048'}},
    ru:{minesweeper:{title:'Сапёр',cardCategory:'ЛОГИКА · ГОЛОВОЛОМКА',summary:'Три уровня и удобные флаги',description:'Классический Сапёр: три уровня, безопасный первый ход и удобные флаги на телефоне.',features:['3 уровня','Режим флага','Левая / правая кнопка'],search:'сапёр мины логика',alt:'Мультяшная обложка Сапёра'},'2048':{title:'2048',cardCategory:'ЧИСЛА · ГОЛОВОЛОМКА',summary:'Плавное сложение и отмена',description:'Плавная числовая головоломка с жестами, клавиатурой, мышью и отменой.',features:['Плавные жесты','Клавиатура и мышь','Отмена хода'],search:'2048 числа головоломка',alt:'Мультяшная обложка 2048'}},
    it:{minesweeper:{title:'Campo minato',cardCategory:'LOGICA · PUZZLE',summary:'Tre livelli e bandiere facili',description:'Campo minato classico con tre livelli, prima mossa sicura e modalità bandiera mobile.',features:['3 livelli','Modalità bandiera','Clic sinistro / destro'],search:'campo minato logica puzzle',alt:'Copertina cartoon di Campo minato'},'2048':{title:'2048',cardCategory:'NUMERI · PUZZLE',summary:'Fusioni fluide e annulla',description:'Puzzle numerico fluido con gesti, tastiera, mouse e annullamento.',features:['Gesti fluidi','Tastiera e mouse','Annulla'],search:'2048 numeri puzzle',alt:'Copertina cartoon di 2048'}},
    ar:{minesweeper:{title:'كاسحة الألغام',cardCategory:'منطق · ألغاز',summary:'ثلاثة مستويات وأعلام سهلة',description:'كاسحة ألغام كلاسيكية بثلاثة مستويات ولمسة أولى آمنة ووضع أعلام للهاتف.',features:['3 مستويات','وضع الأعلام','النقر الأيسر والأيمن'],search:'كاسحة الألغام منطق',alt:'غلاف كرتوني لكاسحة الألغام'},'2048':{title:'2048',cardCategory:'أرقام · ألغاز',summary:'دمج سلس وتراجع',description:'لعبة دمج أرقام سلسة باللمس ولوحة المفاتيح والفأرة والتراجع.',features:['سحب سلس','لوحة مفاتيح وفأرة','تراجع'],search:'2048 أرقام ألغاز',alt:'غلاف كرتوني للعبة 2048'}},
    ko:{minesweeper:{title:'지뢰찾기',cardCategory:'논리 · 퍼즐',summary:'3단계와 쉬운 깃발 조작',description:'3단계 난이도, 첫 칸 안전, 모바일 깃발 모드를 갖춘 클래식 지뢰찾기입니다.',features:['3단계','모바일 깃발 모드','좌우 클릭'],search:'지뢰찾기 논리 퍼즐',alt:'지뢰찾기 카툰 표지'},'2048':{title:'2048',cardCategory:'숫자 · 퍼즐',summary:'부드러운 합성과 되돌리기',description:'스와이프, 키보드, 마우스와 되돌리기를 지원하는 숫자 퍼즐입니다.',features:['부드러운 스와이프','키보드와 마우스','되돌리기'],search:'2048 숫자 합성 퍼즐',alt:'2048 카툰 표지'}},
    'zh-CN':{minesweeper:{title:'扫雷',cardCategory:'逻辑 · 益智',summary:'三档难度与便捷插旗',description:'经典扫雷，提供三档标准难度、首格安全和方便的手机插旗模式。',features:['三档标准难度','手机长按与模式插旗','电脑左右键操作'],search:'扫雷 逻辑 地雷 益智',alt:'扫雷卡通游戏封面'},'2048':{title:'2048',cardCategory:'数字 · 益智',summary:'丝滑合成与随时悔棋',description:'丝滑的数字合成游戏，支持手机滑动、电脑键盘和鼠标操作，并可逐步悔棋。',features:['手机流畅滑动','键盘与鼠标控制','逐步悔棋'],search:'2048 数字 合成 益智',alt:'2048 卡通游戏封面'}},
    'zh-TW':{minesweeper:{title:'踩地雷',cardCategory:'邏輯 · 益智',summary:'三種難度與便利插旗',description:'經典踩地雷，提供三種標準難度、首格安全和手機插旗模式。',features:['三種標準難度','手機長按與插旗模式','電腦左右鍵操作'],search:'踩地雷 邏輯 益智',alt:'踩地雷卡通遊戲封面'},'2048':{title:'2048',cardCategory:'數字 · 益智',summary:'流暢合成與隨時悔棋',description:'流暢的數字合成遊戲，支援手機滑動、鍵盤、滑鼠及逐步悔棋。',features:['手機流暢滑動','鍵盤與滑鼠控制','逐步悔棋'],search:'2048 數字 合成 益智',alt:'2048 卡通遊戲封面'}},
    pt:{minesweeper:{title:'Campo minado',cardCategory:'LÓGICA · PUZZLE',summary:'Três níveis e bandeiras fáceis',description:'Campo minado clássico com três níveis, primeira jogada segura e modo bandeira móvel.',features:['3 níveis','Modo bandeira móvel','Clique esquerdo / direito'],search:'campo minado lógica puzzle',alt:'Capa cartoon de Campo minado'},'2048':{title:'2048',cardCategory:'NÚMEROS · PUZZLE',summary:'Fusão suave e desfazer',description:'Puzzle numérico fluido com gestos, teclado, mouse e desfazer.',features:['Gestos suaves','Teclado e mouse','Desfazer'],search:'2048 números puzzle',alt:'Capa cartoon de 2048'}}
  };
  Object.entries(spiderTranslations).forEach(([locale, game]) => {
    translations[locale].games.spider = game;
    Object.assign(translations[locale].games, newGameTranslations[locale]);
    [translations[locale].ui.online, translations[locale].ui.futureSlots] = availabilityTranslations[locale];
  });

  const countryLocales = {
    CN:'zh-CN', SG:'zh-CN', TW:'zh-TW', HK:'zh-TW', MO:'zh-TW', JP:'ja', KR:'ko', FR:'fr', MC:'fr', IT:'it', SM:'it', VA:'it', RU:'ru', BY:'ru', KZ:'ru', KG:'ru', PT:'pt', BR:'pt', AO:'pt', MZ:'pt', CV:'pt', GW:'pt', ST:'pt', TL:'pt'
  };
  'AR BO CL CO CR CU DO EC ES GT HN MX NI PA PE PR PY SV UY VE'.split(' ').forEach((code) => { countryLocales[code] = 'es'; });
  'AE BH DZ EG IQ JO KW LB LY MA OM PS QA SA SD SY TN YE'.split(' ').forEach((code) => { countryLocales[code] = 'ar'; });

  const normaliseLocale = (value = '') => {
    const locale = String(value).replace('_', '-').toLowerCase();
    if (locale === 'zh-tw' || locale === 'zh-hk' || locale === 'zh-mo' || locale.includes('hant')) return 'zh-TW';
    if (locale.startsWith('zh')) return 'zh-CN';
    return SUPPORTED.find((item) => item.toLowerCase() === locale || locale.startsWith(`${item.toLowerCase()}-`)) || 'en';
  };
  const resolveCountry = (country = '') => countryLocales[String(country).toUpperCase()] || 'en';
  const resolveBrowser = (languages = []) => normaliseLocale((languages && languages[0]) || 'en');
  const getDirection = (locale) => locale === 'ar' ? 'rtl' : 'ltr';
  let activeLocale = 'zh-CN';

  function updateGameCards(locale) {
    const dictionary = translations[locale];
    document.querySelectorAll('[data-game-id]').forEach((card) => {
      const id = card.dataset.gameId;
      if (id === 'reserved') {
        card.dataset.name = `${dictionary.ui.reservedLabel} ${dictionary.ui.reservedTitle}`;
        card.querySelector('span').textContent = dictionary.ui.reservedLabel;
        card.querySelector('h3').textContent = dictionary.ui.reservedTitle;
        card.querySelector('p').textContent = dictionary.ui.reservedBody;
        return;
      }
      const game = dictionary.games[id];
      if (!game) return;
      card.dataset.name = game.search;
      card.dataset.previewCategory = game.cardCategory;
      card.dataset.previewDescription = game.description;
      card.dataset.previewFeatures = game.features.join('|');
      const image = card.querySelector('img');
      image.alt = game.alt;
      const info = card.querySelector('.game-info');
      info.querySelector('small').textContent = game.cardCategory;
      info.querySelector('h3').textContent = game.title;
      info.querySelector('p').textContent = game.summary;
      const cta = info.querySelector('b');
      cta.firstChild.textContent = `${dictionary.ui.playNow} `;
    });
  }

  function applyLanguage(locale, { persist = false } = {}) {
    locale = SUPPORTED.includes(locale) ? locale : normaliseLocale(locale);
    activeLocale = locale;
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, locale); } catch (_) { /* storage may be blocked */ }
    }
    if (typeof document === 'undefined') return locale;
    const dictionary = translations[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
    document.title = dictionary.ui.metaTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = dictionary.ui.metaDescription;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = dictionary.ui[element.dataset.i18n];
      if (value) element.textContent = value;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const value = dictionary.ui[element.dataset.i18nPlaceholder];
      if (value) element.placeholder = value;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      const value = dictionary.ui[element.dataset.i18nAria];
      if (value) element.setAttribute('aria-label', value);
    });
    const select = document.getElementById('languageSelect');
    if (select) select.value = locale;
    updateGameCards(locale);
    const previewPlay = document.getElementById('previewPlay');
    if (previewPlay) previewPlay.firstChild.textContent = `${dictionary.ui.playNow} `;
    window.dispatchEvent(new CustomEvent('tzt-language-change', { detail: { locale } }));
    return locale;
  }

  async function detectCountry() {
    if (typeof fetch !== 'function') return '';
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 1800) : null;
    try {
      const response = await fetch('/cdn-cgi/trace', { cache: 'no-store', signal: controller?.signal });
      if (!response.ok) return '';
      const match = (await response.text()).match(/^loc=([A-Z]{2})$/m);
      return match ? match[1] : '';
    } catch (_) {
      return '';
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function initialise() {
    const select = document.getElementById('languageSelect');
    select?.addEventListener('change', (event) => applyLanguage(event.target.value, { persist: true }));
    const queryLocale = new URLSearchParams(location.search).get('lang');
    let saved = '';
    try { saved = localStorage.getItem(STORAGE_KEY) || ''; } catch (_) { /* storage may be blocked */ }
    if (queryLocale) return applyLanguage(normaliseLocale(queryLocale), { persist: true });
    if (SUPPORTED.includes(saved)) return applyLanguage(saved);
    const country = await detectCountry();
    const locale = country ? resolveCountry(country) : resolveBrowser(navigator.languages || [navigator.language]);
    return applyLanguage(locale);
  }

  const api = { SUPPORTED, translations, normaliseLocale, resolveCountry, resolveBrowser, getDirection, applyLanguage, getLocale:() => activeLocale, detectCountry };
  globalThis.TZT_I18N = api;
  if (typeof document !== 'undefined') initialise();
})();
