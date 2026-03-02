import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Pause, Settings2, BookOpen, Volume2, Copy, Check, X, ArrowUp, ArrowDown, Loader2, Download, Ban } from 'lucide-react';
import Linkify from 'linkify-react';
import { motion, AnimatePresence } from 'motion/react';

type LangCode = 'ru' | 'en' | 'de' | 'es' | 'fr' | 'tr' | 'ja' | 'zh' | 'ko' | 'it' | 'pt';

const TRANSLATIONS = {
  ru: {
    title: 'Read Me',
    voice: 'Голос',
    reset: 'Сбросить',
    placeholder: 'Введите текст...',
    pause: 'Пауза',
    resume: 'Продолжить',
    read: 'Читать',
    status_pause: 'Пауза',
    status_reading: 'Читаю...',
    status_loading: 'Загрузка...',
    default_voice: 'По умолчанию',
    copy: 'Копировать',
    clear: 'Очистить',
    download: 'Скачать MP3',
    cancel_generation: 'Отменить',
    footer_privacy_link: 'Политика конфиденциальности',
    footer_terms_link: 'Условия использования',
    footer_about_link: 'О нас',
    privacy_title: 'Политика конфиденциальности сервиса Read Me',
    privacy_body:
      'Read Me не требует регистрации и не создаёт аккаунтов. Введённый текст используется только для генерации озвучки и частично сохраняется в локальном хранилище браузера для восстановления черновиков и настроек. Текст может передаваться во внешний сервис синтеза речи исключительно для технической обработки и не используется нами для профилирования или продажи данных.',
    terms_title: 'Условия использования Read Me',
    terms_body:
      'Пользуясь сервисом Read Me, вы подтверждаете, что имеете право работать с вводимыми текстами и не размещаете противоправный или запрещённый контент. Озвученные MP3‑файлы предоставляются «как есть» и подходят для личного применения, учёбы, озвучки собственных проектов. Разработчики не несут ответственности за юридические последствия использования сгенерированного аудио.',
    about_title: 'О нас — Green Point',
    about_body:
      'Green Point — творческое объединение разработчиков и дизайнеров, которое создаёт простые и полезные онлайн‑сервисы. Read Me родился как инструмент для тех, кто хочет слушать текст так же удобно, как читать: в дороге, во время работы или отдыха. Наша цель — делать доступные продукты, которые экономят время, бережно относятся к вниманию и помогают людям работать с информацией комфортнее.',
  },
  en: {
    title: 'Read Me',
    voice: 'Voice',
    reset: 'Reset',
    placeholder: 'Enter text...',
    pause: 'Pause',
    resume: 'Resume',
    read: 'Read',
    status_pause: 'Paused',
    status_reading: 'Reading...',
    status_loading: 'Loading...',
    default_voice: 'Default',
    copy: 'Copy',
    clear: 'Clear',
    download: 'Download MP3',
    cancel_generation: 'Cancel',
    footer_privacy_link: 'Privacy policy',
    footer_terms_link: 'Terms of use',
    footer_about_link: 'About us',
    privacy_title: 'Privacy policy of Read Me service',
    privacy_body:
      'Read Me does not require registration and does not create user accounts. The entered text is used only for speech generation and may be temporarily stored in the local browser storage to restore drafts and settings. Text may be sent to an external text‑to‑speech service only for technical processing and is not used by us for profiling or selling data.',
    terms_title: 'Terms of use for Read Me',
    terms_body:
      'By using Read Me you confirm that you have the right to work with the text you enter and that you do not submit illegal or prohibited content. Generated MP3 files are provided “as is” and are suitable for personal use, study and voice‑over of your own projects. The developers are not responsible for any legal consequences of using the generated audio.',
    about_title: 'About us — Green Point',
    about_body:
      'Green Point is a creative team of developers and designers that builds simple and useful online tools. Read Me was created as a tool for people who want to listen to text as conveniently as they read it: on the go, while working or relaxing. Our goal is to make accessible products that save time, respect attention and make working with information more comfortable.',
  },
  de: {
    title: 'Read Me',
    voice: 'Stimme',
    reset: 'Zurücksetzen',
    placeholder: 'Text eingeben...',
    pause: 'Pause',
    resume: 'Fortsetzen',
    read: 'Vorlesen',
    status_pause: 'Pausiert',
    status_reading: 'Lese vor...',
    status_loading: 'Lese vor...',
    default_voice: 'Standard',
    copy: 'Kopieren',
    clear: 'Löschen',
    download: 'MP3 Herunterladen',
    cancel_generation: 'Abbrechen',
    footer_privacy_link: 'Datenschutz',
    footer_terms_link: 'Nutzungsbedingungen',
    footer_about_link: 'Über uns',
    privacy_title: 'Datenschutzrichtlinie des Read Me Dienstes',
    privacy_body:
      'Read Me erfordert keine Registrierung und erstellt keine Konten. Der eingegebene Text wird nur zur Sprachausgabe verwendet und kann teilweise im lokalen Speicher des Browsers gespeichert werden, um Entwürfe und Einstellungen wiederherzustellen. Der Text kann ausschließlich zur technischen Verarbeitung an einen externen Text‑zu‑Sprache‑Dienst übermittelt werden.',
    terms_title: 'Nutzungsbedingungen für Read Me',
    terms_body:
      'Durch die Nutzung von Read Me bestätigen Sie, dass Sie berechtigt sind, mit den eingegebenen Texten zu arbeiten und keine rechtswidrigen oder verbotenen Inhalte übermitteln. Generierte MP3‑Dateien werden „wie besehen“ bereitgestellt und eignen sich für den persönlichen Gebrauch, das Lernen und eigene Projekte.',
    about_title: 'Über uns — Green Point',
    about_body:
      'Green Point ist ein kreatives Team von Entwicklern und Designern, das einfache und nützliche Online‑Dienste erstellt. Read Me hilft Menschen, Texte genauso bequem zu hören wie zu lesen.',
  },
  es: {
    title: 'Read Me',
    voice: 'Voz',
    reset: 'Restablecer',
    placeholder: 'Introduce texto...',
    pause: 'Pausa',
    resume: 'Reanudar',
    read: 'Leer',
    status_pause: 'Pausado',
    status_reading: 'Leyendo...',
    status_loading: 'Leyendo...',
    default_voice: 'Predeterminado',
    copy: 'Copiar',
    clear: 'Borrar',
    download: 'Descargar MP3',
    cancel_generation: 'Cancelar',
    footer_privacy_link: 'Política de privacidad',
    footer_terms_link: 'Términos de uso',
    footer_about_link: 'Sobre nosotros',
    privacy_title: 'Política de privacidad del servicio Read Me',
    privacy_body:
      'Read Me no requiere registro ni crea cuentas de usuario. El texto introducido se utiliza únicamente para la generación de voz y puede almacenarse temporalmente en el almacenamiento local del navegador para restaurar borradores y ajustes.',
    terms_title: 'Términos de uso de Read Me',
    terms_body:
      'Al utilizar Read Me confirmas que tienes derecho a trabajar con los textos introducidos y que no publicas contenido ilegal o prohibido.',
    about_title: 'Sobre nosotros — Green Point',
    about_body:
      'Green Point es un colectivo creativo de desarrolladores y diseñadores que crea servicios online sencillos y útiles. Read Me ayuda a escuchar textos tan cómodamente como leerlos.',
  },
  fr: {
    title: 'Read Me',
    voice: 'Voix',
    reset: 'Réinitialiser',
    placeholder: 'Entrez du texte...',
    pause: 'Pause',
    resume: 'Reprendre',
    read: 'Lire',
    status_pause: 'En pause',
    status_reading: 'Lecture...',
    status_loading: 'Lecture...',
    default_voice: 'Défaut',
    copy: 'Copier',
    clear: 'Effacer',
    download: 'Télécharger MP3',
    cancel_generation: 'Annuler',
    footer_privacy_link: 'Politique de confidentialité',
    footer_terms_link: 'Conditions d’utilisation',
    footer_about_link: 'À propos de nous',
    privacy_title: 'Politique de confidentialité du service Read Me',
    privacy_body:
      'Read Me ne nécessite pas d’inscription et ne crée pas de comptes. Le texte saisi est utilisé uniquement pour la synthèse vocale et peut être stocké temporairement dans le stockage local du navigateur.',
    terms_title: 'Conditions d’utilisation de Read Me',
    terms_body:
      'En utilisant Read Me, vous confirmez avoir le droit d’utiliser les textes saisis et ne pas publier de contenu illégal ou interdit.',
    about_title: 'À propos de nous — Green Point',
    about_body:
      'Green Point est un collectif créatif de développeurs et de designers qui crée des services en ligne simples et utiles.',
  },
  tr: {
    title: 'Read Me',
    voice: 'Ses',
    reset: 'Sıfırla',
    placeholder: 'Metin girin...',
    pause: 'Duraklat',
    resume: 'Devam Et',
    read: 'Oku',
    status_pause: 'Duraklatıldı',
    status_reading: 'Okunuyor...',
    status_loading: 'Okunuyor...',
    default_voice: 'Varsayılan',
    copy: 'Kopyala',
    clear: 'Temizle',
    download: 'MP3 İndir',
    cancel_generation: 'İptal',
    footer_privacy_link: 'Gizlilik politikası',
    footer_terms_link: 'Kullanım koşulları',
    footer_about_link: 'Hakkımızda',
    privacy_title: 'Read Me gizlilik politikası',
    privacy_body:
      'Read Me kayıt gerektirmez ve hesap oluşturmaz. Girilen metin yalnızca ses üretimi için kullanılır ve taslakları ve ayarları geri yüklemek için tarayıcının yerel depolamasında tutulabilir.',
    terms_title: 'Read Me kullanım koşulları',
    terms_body:
      'Read Me’yi kullanarak girdiğiniz metinleri kullanma hakkına sahip olduğunuzu ve yasadışı veya yasaklı içerik paylaşmadığınızı onaylarsınız.',
    about_title: 'Hakkımızda — Green Point',
    about_body:
      'Green Point, basit ve kullanışlı çevrimiçi hizmetler geliştiren yaratıcı bir ekipten oluşur.',
  },
  ja: {
    title: 'Read Me',
    voice: '音声',
    reset: 'リセット',
    placeholder: 'テキストを入力...',
    pause: '一時停止',
    resume: '再開',
    read: '読み上げ',
    status_pause: '一時停止中',
    status_reading: '読み上げ中...',
    status_loading: '読み上げ中...',
    default_voice: 'デフォルト',
    copy: 'コピー',
    clear: 'クリア',
    download: 'MP3をダウンロード',
    cancel_generation: 'キャンセル',
    footer_privacy_link: 'プライバシーポリシー',
    footer_terms_link: '利用規約',
    footer_about_link: '私たちについて',
    privacy_title: 'Read Me サービスのプライバシーポリシー',
    privacy_body:
      'Read Me は登録不要でアカウントも作成しません。入力されたテキストは音声生成のためだけに使用され、一部は下書きや設定を復元するためにブラウザのローカルストレージに保存される場合があります。',
    terms_title: 'Read Me の利用規約',
    terms_body:
      'Read Me を利用することで、入力するテキストを利用する権利を有し、違法または禁止されたコンテンツを投稿しないことに同意したものとみなされます。',
    about_title: '私たちについて — Green Point',
    about_body:
      'Green Point は、シンプルで役立つオンラインサービスを作る開発者とデザイナーのクリエイティブチームです。',
  },
  zh: {
    title: 'Read Me',
    voice: '声音',
    reset: '重置',
    placeholder: '输入文本...',
    pause: '暂停',
    resume: '继续',
    read: '朗读',
    status_pause: '已暂停',
    status_reading: '正在朗读...',
    status_loading: '正在朗读...',
    default_voice: '默认',
    copy: '复制',
    clear: '清除',
    download: '下载 MP3',
    cancel_generation: '取消',
    footer_privacy_link: '隐私政策',
    footer_terms_link: '使用条款',
    footer_about_link: '关于我们',
    privacy_title: 'Read Me 服务隐私政策',
    privacy_body:
      'Read Me 无需注册，也不会创建账户。输入的文本仅用于语音合成，并可能暂时保存在浏览器本地存储中，以便恢复草稿和设置。',
    terms_title: 'Read Me 使用条款',
    terms_body:
      '使用 Read Me 即表示您确认有权处理输入的文本，并且不会发布违法或被禁止的内容。',
    about_title: '关于我们 — Green Point',
    about_body:
      'Green Point 是由开发者和设计师组成的创意团队，专注于打造简单且有用的在线服务。',
  },
  ko: {
    title: 'Read Me',
    voice: '목소리',
    reset: '초기화',
    placeholder: '텍스트 입력...',
    pause: '일시 정지',
    resume: '재개',
    read: '읽기',
    status_pause: '일시 정지됨',
    status_reading: '읽는 중...',
    status_loading: '읽는 중...',
    default_voice: '기본',
    copy: '복사',
    clear: '지우기',
    download: 'MP3 다운로드',
    cancel_generation: '취소',
    footer_privacy_link: '개인정보 처리방침',
    footer_terms_link: '이용 약관',
    footer_about_link: '회사 소개',
    privacy_title: 'Read Me 서비스 개인정보 처리방침',
    privacy_body:
      'Read Me는 회원 가입이 필요 없으며 계정을 생성하지 않습니다. 입력한 텍스트는 음성 합성에만 사용되며, 초안과 설정을 복원하기 위해 브라우저 로컬 저장소에 보관될 수 있습니다.',
    terms_title: 'Read Me 이용 약관',
    terms_body:
      'Read Me를 사용함으로써 사용자는 입력한 텍스트를 사용할 권리가 있으며, 불법 또는 금지된 콘텐츠를 게시하지 않을 것에 동의한 것으로 간주됩니다.',
    about_title: '회사 소개 — Green Point',
    about_body:
      'Green Point는 단순하고 유용한 온라인 서비스를 만드는 개발자와 디자이너로 구성된 크리에이티브 팀입니다.',
  },
  it: {
    title: 'Read Me',
    voice: 'Voce',
    reset: 'Reimposta',
    placeholder: 'Inserisci testo...',
    pause: 'Pausa',
    resume: 'Riprendi',
    read: 'Leggi',
    status_pause: 'In pausa',
    status_reading: 'Lettura...',
    status_loading: 'Lettura...',
    default_voice: 'Predefinito',
    copy: 'Copia',
    clear: 'Cancella',
    download: 'Scarica MP3',
    cancel_generation: 'Annulla',
    footer_privacy_link: 'Informativa sulla privacy',
    footer_terms_link: 'Termini di utilizzo',
    footer_about_link: 'Chi siamo',
    privacy_title: 'Informativa sulla privacy di Read Me',
    privacy_body:
      'Read Me non richiede registrazione e non crea account. Il testo inserito viene utilizzato solo per la generazione vocale e può essere memorizzato temporaneamente nello storage locale del browser.',
    terms_title: 'Termini di utilizzo di Read Me',
    terms_body:
      'Utilizzando Read Me confermi di avere il diritto di utilizzare i testi inseriti e di non pubblicare contenuti illegali o vietati.',
    about_title: 'Chi siamo — Green Point',
    about_body:
      'Green Point è un collettivo creativo di sviluppatori e designer che crea servizi online semplici e utili.',
  },
  pt: {
    title: 'Read Me',
    voice: 'Voz',
    reset: 'Redefinir',
    placeholder: 'Digite o texto...',
    pause: 'Pausa',
    resume: 'Retomar',
    read: 'Ler',
    status_pause: 'Pausado',
    status_reading: 'Lendo...',
    status_loading: 'Lendo...',
    default_voice: 'Padrão',
    copy: 'Copiar',
    clear: 'Limpar',
    download: 'Baixar MP3',
    cancel_generation: 'Cancelar',
    footer_privacy_link: 'Política de privacidade',
    footer_terms_link: 'Termos de uso',
    footer_about_link: 'Sobre nós',
    privacy_title: 'Política de privacidade do serviço Read Me',
    privacy_body:
      'Read Me não exige registro nem cria contas. O texto inserido é usado apenas para gerar voz e pode ser armazenado temporariamente no armazenamento local do navegador.',
    terms_title: 'Termos de uso do Read Me',
    terms_body:
      'Ao usar o Read Me você confirma que tem o direito de trabalhar com os textos inseridos e que não publica conteúdo ilegal ou proibido.',
    about_title: 'Sobre nós — Green Point',
    about_body:
      'Green Point é um coletivo criativo de desenvolvedores e designers que cria serviços online simples e úteis.',
  }
};

const FLAGS: Record<LangCode, string> = {
  ru: '🇷🇺',
  en: '🇺🇸',
  de: '🇩🇪',
  es: '🇪🇸',
  fr: '🇫🇷',
  tr: '🇹🇷',
  ja: '🇯🇵',
  zh: '🇨🇳',
  ko: '🇰🇷',
  it: '🇮🇹',
  pt: '🇧🇷'
};

const detectLanguage = (text: string): LangCode => {
    if (!text.trim()) return 'en';
    
    // Simple script detection
    if (/[а-яА-ЯёЁ]/.test(text)) return 'ru';
    if (/[ぁ-んァ-ン一-龯]/.test(text)) return 'ja';
    if (/[가-힣]/.test(text)) return 'ko';
    if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
    
    // Latin-based detection (heuristics)
    const deScore = (text.match(/\b(der|die|das|ist|nicht|und|in|zu)\b/gi) || []).length;
    const frScore = (text.match(/\b(le|la|les|est|pas|et|pour|dans)\b/gi) || []).length;
    const esScore = (text.match(/\b(el|la|los|es|no|y|en|con)\b/gi) || []).length;
    const trScore = (text.match(/[ğüşıöçĞÜŞİÖÇ]/g) || []).length + (text.match(/\b(bir|ve|bu|da|de)\b/gi) || []).length * 2;
    const itScore = (text.match(/\b(il|lo|la|i|gli|le|è|non|che)\b/gi) || []).length;
    const ptScore = (text.match(/\b(o|a|os|as|é|não|que|de|do)\b/gi) || []).length;
    
    const scores = { de: deScore, fr: frScore, es: esScore, tr: trScore, it: itScore, pt: ptScore };
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore > 0) {
        const bestMatch = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore);
        return bestMatch as LangCode;
    }
    
    return 'en'; // Default fallback
};

  // Edge Voices Data
  const EDGE_VOICES: Record<string, { name: string, id: string }[]> = {
    ru: [
      { name: 'Svetlana (Neural)', id: 'ru-RU-SvetlanaNeural' },
      { name: 'Dmitry (Neural)', id: 'ru-RU-DmitryNeural' }
    ],
    en: [
      { name: 'Aria (Neural)', id: 'en-US-AriaNeural' },
      { name: 'Guy (Neural)', id: 'en-US-GuyNeural' },
      { name: 'Jenny (Neural)', id: 'en-US-JennyNeural' }
    ],
    de: [
      { name: 'Katja (Neural)', id: 'de-DE-KatjaNeural' },
      { name: 'Conrad (Neural)', id: 'de-DE-ConradNeural' }
    ],
    es: [
      { name: 'Elvira (Neural)', id: 'es-ES-ElviraNeural' },
      { name: 'Alvaro (Neural)', id: 'es-ES-AlvaroNeural' }
    ],
    fr: [
      { name: 'Denise (Neural)', id: 'fr-FR-DeniseNeural' },
      { name: 'Henri (Neural)', id: 'fr-FR-HenriNeural' }
    ],
    tr: [
      { name: 'Emel (Neural)', id: 'tr-TR-EmelNeural' },
      { name: 'Ahmet (Neural)', id: 'tr-TR-AhmetNeural' }
    ],
    ja: [
      { name: 'Nanami (Neural)', id: 'ja-JP-NanamiNeural' },
      { name: 'Keita (Neural)', id: 'ja-JP-KeitaNeural' }
    ],
    zh: [
      { name: 'Xiaoxiao (Neural)', id: 'zh-CN-XiaoxiaoNeural' },
      { name: 'Yunxi (Neural)', id: 'zh-CN-YunxiNeural' }
    ],
    ko: [
      { name: 'SunHi (Neural)', id: 'ko-KR-SunHiNeural' },
      { name: 'InJoon (Neural)', id: 'ko-KR-InJoonNeural' }
    ],
    it: [
      { name: 'Elsa (Neural)', id: 'it-IT-ElsaNeural' },
      { name: 'Diego (Neural)', id: 'it-IT-DiegoNeural' }
    ],
    pt: [
      { name: 'Francisca (Neural)', id: 'pt-BR-FranciscaNeural' },
      { name: 'Antonio (Neural)', id: 'pt-BR-AntonioNeural' }
    ]
  };

  export default function TextToSpeech() {
  // Load state from localStorage
  const [text, setText] = useState<string>(() => localStorage.getItem('tts_text') || "");
  const [selectedEdgeVoice, setSelectedEdgeVoice] = useState<string>(() => localStorage.getItem('tts_edge_voice') || '');
  
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [interfaceLang, setInterfaceLang] = useState<LangCode>(() => (localStorage.getItem('tts_lang') as LangCode) || 'en');
  const [detectedLang, setDetectedLang] = useState<LangCode>('en');
  const [copied, setCopied] = useState(false);
  const [charIndex, setCharIndex] = useState(() => parseInt(localStorage.getItem('tts_charIndex') || '0'));
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isPreloadReady, setIsPreloadReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [lastGeneratedText, setLastGeneratedText] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Ad Modal State
  const [showAdModal, setShowAdModal] = useState(false);
  const [adTimer, setAdTimer] = useState(0);
  const [canCloseAd, setCanCloseAd] = useState(false);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startOffset = useRef<number>(0); // Track offset for resuming
  
  // Server Audio Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isServerPlayingRef = useRef(false);
  const preloadedAudioRef = useRef<{ url: string, text: string, lang: string, startIndex: number }[] | null>(null);
  const preloadedAudioPromiseRef = useRef<Promise<{ url: string, text: string, lang: string, startIndex: number }[]> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUsedVoiceRef = useRef<string>(''); // Track voice used for current playback

  const t = TRANSLATIONS[interfaceLang];
  const ADS_ENABLED = true;
  const [adMode, setAdMode] = useState<'play' | 'download' | null>(null);
  const [openInfoSection, setOpenInfoSection] = useState<'privacy' | 'terms' | 'about' | null>(null);

  // Ad Timer Logic
  useEffect(() => {
    if (showAdModal && adTimer > 0) {
        adTimerRef.current = setTimeout(() => {
            setAdTimer(prev => prev - 1);
        }, 1000);
    } else if (showAdModal && adTimer === 0) {
        setCanCloseAd(true);
    }
    return () => {
        if (adTimerRef.current) clearTimeout(adTimerRef.current);
    };
  }, [showAdModal, adTimer]);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('tts_text', text); }, [text]);
  useEffect(() => { localStorage.setItem('tts_lang', interfaceLang); }, [interfaceLang]);
  useEffect(() => { if (selectedEdgeVoice) localStorage.setItem('tts_edge_voice', selectedEdgeVoice); }, [selectedEdgeVoice]);
  useEffect(() => { localStorage.setItem('tts_charIndex', charIndex.toString()); }, [charIndex]);

  // Monetag scripts often attach global click handlers and keep working after the modal closes.
  // To keep ads strictly inside the modal, we sandbox them in an iframe.
  const monetagIframeSrcDoc = useMemo(() => {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; }
    </style>
  </head>
  <body>
    <script src="https://quge5.com/88/tag.min.js" data-zone="215758" async data-cfasync="false"></script>
  </body>
</html>`;
  }, []);

  // Language Detection & Auto Voice Switch
  useEffect(() => {
    const newLang = detectLanguage(text);
    setDetectedLang(newLang);
    
    // Auto-select default Edge voice regardless of previous selection
    // This ensures that if I switch from RU text to EN text, the voice switches to EN automatically.
    if (EDGE_VOICES[newLang]) {
        // Find if current selected voice is valid for new lang
        const currentVoiceValid = EDGE_VOICES[newLang].some(v => v.id === selectedEdgeVoice);
        if (!currentVoiceValid) {
             setSelectedEdgeVoice(EDGE_VOICES[newLang][0].id);
        }
    }
  }, [text]);

  // Scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
      const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100;
      setShowScrollBottom(isScrollable && !isAtBottom);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [text]); 

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && !isSpeaking && !isPaused) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text, isSpeaking, isPaused]);

  const stopAll = () => {
    // Stop Server TTS
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
    }
    
    // Abort any ongoing fetch
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }

    isServerPlayingRef.current = false;
    preloadedAudioRef.current = null;
    preloadedAudioPromiseRef.current = null;
    setIsPreloadReady(false);

    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoading(false);
  };

  const handleStop = () => {
      stopAll();
      setCharIndex(0);
      startOffset.current = 0;
  };

  const handlePause = () => {
    if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPaused(true);
        setIsSpeaking(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }
  };

  const handleResume = () => {
    // временно читаем без рекламы и ад‑модалки
    const currentVoice = selectedEdgeVoice;
    if (lastUsedVoiceRef.current && lastUsedVoiceRef.current !== currentVoice) {
        startOffset.current = charIndex;
    }
    startOffset.current = charIndex;
    handleSpeakInternal();
  };

  const getStreamElementsVoice = (lang: string) => {
    if (lang === 'ru') return 'Maxim';
    if (lang === 'en') return 'Brian';
    if (lang === 'de') return 'Marlene';
    if (lang === 'es') return 'Mia';
    if (lang === 'fr') return 'Celine';
    if (lang === 'ja') return 'Takumi';
    return 'Brian';
  };

  const splitTextIntoChunks = (input: string, maxLen: number) => {
    const text = String(input);
    if (text.length <= maxLen) return [text];
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
      if ((current + s).length > maxLen && current) {
        chunks.push(current);
        current = s;
      } else {
        current += s;
      }
    }
    if (current) chunks.push(current);
    return chunks.map(c => c.trim()).filter(Boolean);
  };

  const fetchTtsBlob = async ({
    textToSpeak,
    lang,
    voice,
    signal,
  }: {
    textToSpeak: string;
    lang: string;
    voice: string;
    signal: AbortSignal;
  }) => {
    // 1) Try server endpoint (works locally, and on prod if a worker exists)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, lang, voice }),
        signal,
      });
      if (res.ok) return await res.blob();
      // Fall back to client-side only for typical "static host" failure modes.
      if (res.status !== 405) {
        throw new Error(`TTS request failed: ${res.status}`);
      }
    } catch (e) {
      // If request was aborted, bubble up.
      if ((e as any)?.name === 'AbortError') throw e;
      // Otherwise continue to fallback.
    }

    // 2) Client-side fallback (StreamElements supports CORS)
    const seVoice = getStreamElementsVoice(lang);
    const chunks = splitTextIntoChunks(textToSpeak, 1000);

    const buffers: Uint8Array[] = [];
    let total = 0;

    for (const chunk of chunks) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
        seVoice
      )}&text=${encodeURIComponent(chunk)}`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`StreamElements TTS failed: ${res.status}`);
      const ab = await res.arrayBuffer();
      const u8 = new Uint8Array(ab);
      buffers.push(u8);
      total += u8.byteLength;
    }

    const combined = new Uint8Array(total);
    let offset = 0;
    for (const b of buffers) {
      combined.set(b, offset);
      offset += b.byteLength;
    }

    return new Blob([combined], { type: 'audio/mpeg' });
  };

  const prepareAudio = async (startIndex: number = 0) => {
      // Сбрасываем состояние предзагрузки (но не downloadUrl — последний файл остаётся доступным)
      preloadedAudioRef.current = null;
      setIsPreloadReady(false);
      
      if (!text.trim()) return;
      
      let currentStartIndex = startIndex;
      if (currentStartIndex >= text.length) currentStartIndex = 0;
      
      const textToSpeak = text.slice(currentStartIndex);
      if (!textToSpeak.trim()) return;

      // Отменяем предыдущий запрос, если он ещё идёт
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const lang = detectedLang;
      const voice = selectedEdgeVoice;

      const promise = fetchTtsBlob({
        textToSpeak,
        lang,
        voice,
        signal: controller.signal,
      })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const result = [{ url, text: textToSpeak, lang, startIndex: currentStartIndex }];
          preloadedAudioRef.current = result;
          setIsPreloadReady(true);
          setDownloadUrl(url);
          setLastGeneratedText(text);
          abortControllerRef.current = null;
          return result;
        })
        .catch(e => {
          if ((e as any).name === 'AbortError') {
            console.log('TTS preload aborted');
          } else {
            console.error('Preload failed', e);
          }
          preloadedAudioRef.current = null;
          setIsPreloadReady(false);
          abortControllerRef.current = null;
          throw e;
        });

      preloadedAudioPromiseRef.current = promise;
  };

  const triggerAdFlow = (callback: () => void, startIndex: number = 0) => {
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      let duration = 5;
      if (wordCount > 2000) duration = 15;
      else if (wordCount > 1000) duration = 10;

      // Start preloading
      prepareAudio(startIndex);

      setAdMode('play');
      setAdTimer(duration);
      setCanCloseAd(false);
      setShowAdModal(true);
      pendingActionRef.current = callback;
  };
  
  const pendingActionRef = useRef<(() => void) | null>(null);

  const cancelGeneration = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
      }
      setIsLoading(false);
      setIsPreloadReady(false);
      setShowAdModal(false); // Close modal if open
  };

  const closeAdAndPlay = () => {
      setShowAdModal(false);
      setAdMode(null);
      if (pendingActionRef.current) {
          pendingActionRef.current();
          pendingActionRef.current = null;
      }
  };

  const triggerAdFlowForDownload = (callback: () => void) => {
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      let duration = 5;
      if (wordCount > 2000) duration = 15;
      else if (wordCount > 1000) duration = 10;

      setAdMode('download');
      setAdTimer(duration);
      setCanCloseAd(false);
      setShowAdModal(true);
      pendingActionRef.current = callback;
  };

  const handleSpeak = () => {
    stopAll();
    setCharIndex(0);
    startOffset.current = 0;

    if (ADS_ENABLED) {
      triggerAdFlow(() => {
        handleSpeakInternal();
      }, 0);
      return;
    }

    prepareAudio(0);
    handleSpeakInternal();
  };

  const playServerSegments = async (segments: { url: string, text: string, lang: string }[], startIndex: number) => {
      stopAll(); 
      isServerPlayingRef.current = true;
      setIsSpeaking(true);
      
      let cumulativeOffset = 0;
      
      for (const seg of segments) {
          if (!isServerPlayingRef.current) break;
          if (!seg.url) continue; 

          const segmentStartCharIndex = startIndex + cumulativeOffset;
          setCharIndex(segmentStartCharIndex);
          
          try {
              await new Promise<void>((resolve, reject) => {
                  const audio = new Audio(seg.url);
                  audioRef.current = audio;
                  
                  audio.onended = () => {
                      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                      resolve();
                  };
                  audio.onerror = (e) => reject(e);
                  
                  // Karaoke Animation
                  audio.onloadedmetadata = () => {
                      const duration = audio.duration;
                      const segmentLength = seg.text.length;
                      
                      const animate = () => {
                          if (!audio.paused && !audio.ended && isServerPlayingRef.current) {
                              const currentDuration = audio.duration;
                              if (!isFinite(currentDuration) || currentDuration <= 0) {
                                  animationFrameRef.current = requestAnimationFrame(animate);
                                  return;
                              }
                              
                              // More precise sync: use time directly mapped to characters
                              // Assuming roughly linear speech rate, but we can clamp it
                              const progress = audio.currentTime / currentDuration;
                              
                              // Calculate expected char index based on progress
                              // We use Math.floor to ensure we stay on the current character until the very next moment
                              let currentOffset = Math.floor(progress * segmentLength);
                              
                              // Ensure we don't exceed bounds
                              currentOffset = Math.min(currentOffset, segmentLength);
                              
                              setCharIndex(Math.min(segmentStartCharIndex + currentOffset, text.length));
                              animationFrameRef.current = requestAnimationFrame(animate);
                          }
                      };
                      animationFrameRef.current = requestAnimationFrame(animate);
                  };
                  
                  audio.play().then(() => {
                      setIsLoading(false);
                  }).catch(reject);
              });
          } catch (e) {
              console.error("Audio play failed", e);
              setIsLoading(false);
          }
          
          cumulativeOffset += seg.text.length;
      }
      
      if (isServerPlayingRef.current) {
          setIsSpeaking(false);
          isServerPlayingRef.current = false;
          // Reset if done
          if (startIndex + cumulativeOffset >= text.length) {
              setCharIndex(0);
              startOffset.current = 0;
          }
      }
  };

  const handleSpeakInternal = async () => {
    // Track current voice
    lastUsedVoiceRef.current = selectedEdgeVoice;

    // If we have preloaded audio (or promise), use it
    setIsLoading(true);
    try {
        let result = preloadedAudioRef.current;
        
        // If not ready but promise exists, wait for it
        if (!result && preloadedAudioPromiseRef.current) {
            try {
                result = await preloadedAudioPromiseRef.current;
            } catch (e) {
                console.error("Preload promise failed", e);
            }
        }

        // If still no result (preload failed or wasn't called), делаем запрос сейчас
        if (!result) {
                // Отменяем предыдущий запрос, если он ещё идёт
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                const controller = new AbortController();
                abortControllerRef.current = controller;

                // Determine start index
                let currentStartIndex = charIndex;
                if (startOffset.current === 0) currentStartIndex = 0;
                else if (currentStartIndex >= text.length) currentStartIndex = 0;
                else startOffset.current = currentStartIndex; // Sync offset if resuming mid-text without preload

                const textToSpeak = text.slice(currentStartIndex);
                if (!textToSpeak.trim()) {
                    setIsLoading(false);
                    return;
                }

                const lang = detectedLang;
                const voice = selectedEdgeVoice;

                const blob = await fetchTtsBlob({
                    textToSpeak,
                    lang,
                    voice,
                    signal: controller.signal,
                });
                const url = URL.createObjectURL(blob);
                result = [{ url, text: textToSpeak, lang, startIndex: currentStartIndex }];
                setDownloadUrl(url);
                abortControllerRef.current = null;
        }

        if (result && result.length > 0) {
                // Use the startIndex from the result, which is the exact start of the audio chunk
                const startIndex = result[0].startIndex ?? 0;
                await playServerSegments(result, startIndex);
        }
    } catch (e) {
        console.error("HQ Play failed", e);
        setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
        let textToCopy = text;
        
        // Check for selection
        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            if (start !== end) {
                textToCopy = text.substring(start, end);
            }
        }

        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setText('');
    handleStop();
    setDownloadUrl(null);
    setLastGeneratedText(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  // Status Text Helper
  const getStatusText = () => {
    if (isLoading) return t.status_loading;
    if (isPaused) return t.status_pause;
    if (isSpeaking) return t.status_reading;
    
    // Ready state details (Just Lang + Voice)
    const langLabel = detectedLang.toUpperCase();
    let voiceLabel = '';

    const allEdge = Object.values(EDGE_VOICES).flat();
    voiceLabel = allEdge.find(v => v.id === selectedEdgeVoice)?.name || t.default_voice;
        
    return `${langLabel} • ${voiceLabel}`;
  };

  // Prevent focus theft on button click
  const preventFocus = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Если текст изменился после генерации — сбрасываем ссылку на скачивание
    if (downloadUrl && lastGeneratedText !== null && newText !== lastGeneratedText) {
      setDownloadUrl(null);
      setLastGeneratedText(null);
    }
  };

  const handleDownloadClick = () => {
    if (!downloadUrl) return;

    const doDownload = () => {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `audio-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    if (ADS_ENABLED) {
      triggerAdFlowForDownload(doDownload);
      return;
    }

    doDownload();
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4 font-sans text-zinc-200">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 ring-1 ring-white/5 relative"
      >
        {/* Header */}
        <div className="relative z-50 bg-zinc-900/95 backdrop-blur-xl px-8 py-6 border-b border-zinc-800 flex justify-between items-center transition-all duration-300 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-indigo-400"></div>
               <div className="relative flex items-center justify-center gap-0.5">
                  <BookOpen size={18} strokeWidth={2.5} />
                  <Volume2 size={18} strokeWidth={2.5} />
               </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{t.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
                <button 
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-all border border-zinc-700/50"
                >
                    <span className="text-lg leading-none">{FLAGS[interfaceLang]}</span>
                </button>
                
                <AnimatePresence>
                    {showLangMenu && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            className="absolute right-0 top-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl p-1.5 min-w-[140px] z-50 flex flex-col gap-1"
                        >
                            {(Object.keys(FLAGS) as LangCode[]).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => {
                                        setInterfaceLang(lang);
                                        setShowLangMenu(false);
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${interfaceLang === lang ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'}`}
                                >
                                    <span className="text-lg">{FLAGS[lang]}</span>
                                    <span className="uppercase">{lang}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-xl transition-all border border-transparent ${showSettings ? 'bg-zinc-800 text-indigo-400 border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
            >
                <Settings2 size={20} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-zinc-900/50 border-b border-zinc-800 overflow-hidden"
            >
              <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Voice Selector */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.voice}</label>
                  </div>

                  <div className="relative">
                          <select 
                              value={selectedEdgeVoice}
                              onChange={(e) => setSelectedEdgeVoice(e.target.value)}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
                          >
                              {/* Show voices for current interface language first, or all? 
                                  User might want to read English text while interface is Russian.
                                  Let's show all grouped by language.
                              */}
                              {Object.entries(EDGE_VOICES).map(([lang, voices]) => (
                                  <optgroup key={lang} label={FLAGS[lang as LangCode] + ' ' + lang.toUpperCase()}>
                                      {voices.map(v => (
                                          <option key={v.id} value={v.id}>{v.name}</option>
                                      ))}
                                  </optgroup>
                              ))}
                          </select>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Using high-quality neural voices.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Area Container */}
        <div className="p-8 bg-zinc-900">
          <div className="relative w-full min-h-[16rem] grid grid-cols-1 grid-rows-1 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-inner">
            
            {/* Layer 1: Editable Textarea (Handles Input & Cursor) */}
            {/* Text is transparent so we see the Overlay below, but caret is visible. */}
            {/* z-0 so it's behind the overlay's clickable elements, BUT we need it to receive clicks for typing. */}
            {/* TRICK: Overlay is pointer-events-none, so clicks pass through to Textarea. */}
            {/* Links in Overlay are pointer-events-auto, so they capture clicks. */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                className="col-start-1 row-start-1 w-full h-full min-h-[16rem] p-6 bg-transparent text-transparent caret-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-0 border-none resize-none leading-relaxed font-normal overflow-hidden whitespace-pre-wrap break-words z-0"
                placeholder={t.placeholder}
                spellCheck={false}
                style={{
                    fontFamily: 'inherit',
                    fontSize: '1.125rem', // text-lg
                    lineHeight: '1.625',  // leading-relaxed
                }}
            />

            {/* Layer 2: Visual Overlay (Handles Highlighting & Links) */}
            <div 
                aria-hidden="true"
                className="col-start-1 row-start-1 w-full h-full min-h-[16rem] p-6 pointer-events-none z-10 text-lg leading-relaxed font-normal whitespace-pre-wrap break-words text-zinc-300"
                style={{
                    fontFamily: 'inherit',
                    fontSize: '1.125rem', // text-lg
                    lineHeight: '1.625',  // leading-relaxed
                }}
            >
                {/* Karaoke Style Highlighting */}
                <span className="text-indigo-400 opacity-60 transition-colors duration-300">
                    <Linkify options={{ 
                        target: '_blank', 
                        className: 'text-indigo-400 underline hover:text-indigo-300 cursor-pointer pointer-events-auto relative' 
                    }}>
                        {text.slice(0, charIndex)}
                    </Linkify>
                </span>
                {/* Current Word/Segment Highlight - Simulated by taking next few chars until space */}
                {(() => {
                    const remaining = text.slice(charIndex);
                    const nextSpace = remaining.indexOf(' ');
                    const currentWordEnd = nextSpace === -1 ? remaining.length : nextSpace + 1; // Include space
                    const currentWord = remaining.slice(0, currentWordEnd);
                    const futureText = remaining.slice(currentWordEnd);
                    
                    return (
                        <>
                            <span className="bg-indigo-500/30 text-indigo-200 font-medium rounded px-0.5 transition-all duration-75">
                                <Linkify options={{ 
                                    target: '_blank', 
                                    className: 'text-indigo-200 underline cursor-pointer pointer-events-auto relative' 
                                }}>
                                    {currentWord}
                                </Linkify>
                            </span>
                            <span className="text-zinc-500 transition-colors duration-300">
                                <Linkify options={{ 
                                    target: '_blank', 
                                    className: 'text-indigo-400 underline hover:text-indigo-300 cursor-pointer pointer-events-auto relative' 
                                }}>
                                    {futureText}
                                </Linkify>
                            </span>
                        </>
                    );
                })()}
                {/* Essential for matching textarea height when ending with newline */}
                {text.endsWith('\n') && <br />}
            </div>
            
            {/* Text Actions - Sticky */}
            <div className="absolute top-0 right-0 h-full pointer-events-none z-20">
                <div className="sticky top-6 right-6 p-2 flex flex-col gap-2 pointer-events-auto">
                    {text && (
                        <>
                            <button 
                                onClick={handleCopy}
                                className="p-2 bg-zinc-800/80 backdrop-blur-md text-zinc-400 hover:text-zinc-200 rounded-lg shadow-lg border border-zinc-700/50 transition-all hover:scale-105"
                                title={t.copy}
                            >
                                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                            </button>
                            <button 
                                onClick={handleClear}
                                className="p-2 bg-zinc-800/80 backdrop-blur-md text-zinc-400 hover:text-red-400 rounded-lg shadow-lg border border-zinc-700/50 transition-all hover:scale-105"
                                title={t.clear}
                            >
                                <X size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Controls - Sticky Bottom */}
        <div className="sticky bottom-0 z-40 bg-zinc-900 px-8 py-6 border-t border-zinc-800 flex justify-between items-center transition-all duration-300 rounded-b-3xl">
            {/* Status Text */}
            <div className="flex flex-col gap-1 overflow-hidden max-w-[50%]">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider truncate" title={getStatusText()}>
                    {getStatusText()}
                </span>
                {text && (
                    <span className="text-[10px] font-mono text-zinc-600">
                        {text.slice(0, charIndex).split(/\s+/).filter(Boolean).length} / {text.split(/\s+/).filter(Boolean).length} words
                    </span>
                )}
            </div>

            <motion.div layout className="flex items-center gap-3 flex-shrink-0">
                <motion.button 
                    layout="position"
                    onClick={isLoading ? undefined : (isSpeaking && !isPaused ? handlePause : ((isPaused || (charIndex > 0 && !isSpeaking)) ? handleResume : handleSpeak))}
                    onMouseDown={preventFocus}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors shadow-lg ${
                        (isSpeaking && !isPaused) || isLoading
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20' 
                        : 'bg-indigo-600 text-white shadow-indigo-900/20 hover:bg-indigo-500'
                    } ${isLoading ? 'cursor-wait opacity-80' : ''}`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>{t.status_loading}</span>
                        </>
                    ) : isSpeaking && !isPaused ? (
                        <>
                            <Pause size={20} fill="currentColor" /> 
                            <span>{t.pause}</span>
                        </>
                    ) : (
                        <>
                            <Play size={20} fill="currentColor" /> 
                            <span>{(isPaused || (charIndex > 0 && !isSpeaking)) ? t.resume : t.read}</span>
                        </>
                    )}
                </motion.button>

                <AnimatePresence mode="popLayout">
                    {(isSpeaking || isPaused || isLoading || (!!text && charIndex > 0)) && (
                        <motion.button 
                            layout="position"
                            initial={{ opacity: 0, scale: 0.8, width: 0 }}
                            animate={{ opacity: 1, scale: 1, width: 'auto' }}
                            exit={{ opacity: 0, scale: 0.8, width: 0 }}
                            transition={{ duration: 0.2, type: "spring", bounce: 0, opacity: { duration: 0.1 } }}
                            onClick={handleStop}
                            onMouseDown={preventFocus}
                            className="p-3 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-xl hover:bg-zinc-800 hover:text-red-400 hover:border-red-500/30 transition-colors shadow-sm"
                            title={t.reset}
                        >
                            <Square size={20} fill="currentColor" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                    {downloadUrl && !isLoading && (
                        <motion.button 
                            layout="position"
                            initial={{ opacity: 0, scale: 0.8, width: 0 }}
                            animate={{ opacity: 1, scale: 1, width: 'auto' }}
                            exit={{ opacity: 0, scale: 0.8, width: 0 }}
                            transition={{ duration: 0.2, type: "spring", bounce: 0, opacity: { duration: 0.1 } }}
                            onClick={handleDownloadClick}
                            onMouseDown={preventFocus}
                            className="p-3 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-xl hover:bg-zinc-800 hover:text-green-400 hover:border-green-500/30 transition-colors shadow-sm flex items-center justify-center"
                            title={t.download}
                        >
                            <Download size={20} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
      </motion.div>

      {/* Минимальный SEO‑футер с кликабельными ссылками */}
      <footer className="w-full max-w-3xl mt-10 text-xs md:text-sm text-zinc-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <span className="text-zinc-600">
          © {new Date().getFullYear()} Green Point — Read Me.
        </span>
        <nav className="flex flex-wrap gap-4 md:gap-6">
          <button
            onClick={() => {
              setOpenInfoSection(openInfoSection === 'privacy' ? null : 'privacy');
              setTimeout(() => {
                document.getElementById('privacy-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 0);
            }}
            className="text-zinc-400 hover:text-indigo-300 hover:underline underline-offset-4 transition-colors"
          >
            {t.footer_privacy_link}
          </button>
          <button
            onClick={() => {
              setOpenInfoSection(openInfoSection === 'terms' ? null : 'terms');
              setTimeout(() => {
                document.getElementById('terms-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 0);
            }}
            className="text-zinc-400 hover:text-indigo-300 hover:underline underline-offset-4 transition-colors"
          >
            {t.footer_terms_link}
          </button>
          <button
            onClick={() => {
              setOpenInfoSection(openInfoSection === 'about' ? null : 'about');
              setTimeout(() => {
                document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 0);
            }}
            className="text-zinc-400 hover:text-indigo-300 hover:underline underline-offset-4 transition-colors"
          >
            {t.footer_about_link}
          </button>
        </nav>
      </footer>

      {/* SEO‑разделы ниже по странице (для роботов и тех, кто кликнул по ссылкам) */}
      <section
        id="privacy-section"
        className="w-full max-w-3xl mt-12 text-zinc-300 scroll-mt-24"
        hidden={openInfoSection !== 'privacy'}
      >
        <h2 className="text-lg md:text-xl font-semibold text-white mb-3">
          {t.privacy_title}
        </h2>
        <p className="text-sm md:text-[15px] leading-relaxed text-zinc-400">
          {t.privacy_body}
        </p>
      </section>

      <section
        id="terms-section"
        className="w-full max-w-3xl mt-10 text-zinc-300 scroll-mt-24"
        hidden={openInfoSection !== 'terms'}
      >
        <h2 className="text-lg md:text-xl font-semibold text-white mb-3">
          {t.terms_title}
        </h2>
        <p className="text-sm md:text-[15px] leading-relaxed text-zinc-400">
          {t.terms_body}
        </p>
      </section>

      <section
        id="about-section"
        className="w-full max-w-3xl mt-10 mb-16 text-zinc-300 scroll-mt-24"
        hidden={openInfoSection !== 'about'}
      >
        <h2 className="text-lg md:text-xl font-semibold text-white mb-3">
          {t.about_title}
        </h2>
        <p className="text-sm md:text-[15px] leading-relaxed text-zinc-400">
          {t.about_body}
        </p>
      </section>

      {/* Ad Modal */}
      <AnimatePresence>
        {showAdModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
                >
                    {/* Close Button (Conditional) - REMOVED as per user request */}
                    {/* 
                    {canCloseAd && (
                        <button 
                            onClick={closeAdAndPlay}
                            className="absolute top-2 right-2 p-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-colors z-50"
                        >
                            <X size={20} />
                        </button>
                    )}
                    */}

                    <div className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-full bg-zinc-800 rounded-xl min-h-[250px] flex items-center justify-center relative overflow-hidden">
                             <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider absolute top-2 left-2">
                               Advertisement
                             </span>
                             <iframe
                               title="Advertisement"
                               className="w-full min-h-[250px] border-0"
                               // Sandbox prevents the ad script from hooking the parent page.
                               // We only allow scripts so the ad can render. No popups, no parent navigation.
                               sandbox="allow-scripts"
                               referrerPolicy="no-referrer"
                               srcDoc={monetagIframeSrcDoc}
                             />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Support Our App</h3>
                            <p className="text-zinc-400 text-sm">
                                Please watch this short advertisement to continue using the free service.
                            </p>
                        </div>

                        <div className="w-full pt-2">
                            {!canCloseAd ? (
                                <div className="w-full bg-zinc-800 h-12 rounded-xl flex items-center justify-center text-zinc-400 font-medium">
                                    Skip in {adTimer}s
                                </div>
                            ) : adMode === 'play' && !isPreloadReady ? (
                                <div className="w-full flex items-center gap-2">
                                    <div className="flex-1 bg-zinc-800 h-12 rounded-xl flex items-center justify-center text-zinc-400 font-medium gap-2">
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Generating Audio...</span>
                                    </div>
                                    <button 
                                        onClick={cancelGeneration}
                                        className="h-12 w-12 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-xl flex items-center justify-center transition-colors"
                                        title={t.cancel_generation}
                                    >
                                        <Ban size={20} />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={closeAdAndPlay}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {adMode === 'download' ? (
                                        <>
                                            {t.download} <Download size={16} />
                                        </>
                                    ) : (
                                        <>
                                            Continue to Read <Play size={16} fill="currentColor" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Buttons */}
      <div className="fixed bottom-32 right-8 flex flex-col gap-3 z-50">
        <AnimatePresence>
            {showScrollTop && (
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={scrollToTop}
                    className="p-3 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full shadow-lg hover:bg-zinc-700 hover:text-white transition-colors"
                >
                    <ArrowUp size={24} />
                </motion.button>
            )}
        </AnimatePresence>
        <AnimatePresence>
            {showScrollBottom && (
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={scrollToBottom}
                    className="p-3 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full shadow-lg hover:bg-zinc-700 hover:text-white transition-colors"
                >
                    <ArrowDown size={24} />
                </motion.button>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
