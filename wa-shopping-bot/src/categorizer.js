// ─── Categoritzador programàtic expandit ──────────────────────────────────────
// Basat en el xat familiar + productes habituals de supermercat català

const CATEGORIES = [
  { id: 'lactis',    icon: '🥛', name: 'Làctics & Ous' },
  { id: 'fruita',    icon: '🍎', name: 'Fruita' },
  { id: 'verdura',   icon: '🥦', name: 'Verdura & Hortalisses' },
  { id: 'pa',        icon: '🍞', name: 'Pa, Galetes & Brioixeria' },
  { id: 'embotits',  icon: '🥩', name: 'Carn & Embotits' },
  { id: 'peix',      icon: '🐟', name: 'Peix & Marisc' },
  { id: 'begudes',   icon: '☕', name: 'Begudes' },
  { id: 'rebost',    icon: '🫙', name: 'Rebost & Condiments' },
  { id: 'pasta',     icon: '🍝', name: 'Pasta, Arròs & Llegums' },
  { id: 'congelats', icon: '🧊', name: 'Congelats & Plats Preparats' },
  { id: 'neteja',    icon: '🧹', name: 'Neteja & Llar' },
  { id: 'higiene',   icon: '🧴', name: 'Higiene Personal' },
  { id: 'altres',    icon: '🛒', name: 'Altres' },
];

// Ordre important: paraules més específiques primer
const KEYWORDS = [
  // ── Làctics & Ous ────────────────────────────────────────────────────────────
  { cat: 'lactis', words: [
    // llet
    'llet entera','llet semi','llet sencera','llet desnatada','llet sense lactosa',
    'llet didac','llet dídac','llet uht',
    // iogurts
    'iogurt grec','iogurt natural','iogurt de fruita','iogurts','iogurt',
    'yogur',
    // formatges
    'formatge ratllat','formatge fos','formatge llescat','formatge fresc',
    'formatge de cabra','formatge camembert','formatge brie','formatge curat',
    'formatge manchego','formatge hamburgeses','formatge parmesa','parmesa',
    'mozzarella','mozarella','philadelphia','brie','camembert',
    'burgos','ricotta','mascarpone',
    // altres làctics
    'petit suis','petit suís','quesitos','quesito',
    'crema de llet','nata per muntar','nata cuinar','nata','flam',
    'mantequilla','margarina','kefir',
    // ous
    'ous camperos','ous ecologics','ous de pages','ous xl','ous l','ous','ou',
  ]},

  // ── Fruita ───────────────────────────────────────────────────────────────────
  { cat: 'fruita', words: [
    // fruita fresca
    'pomes golden','pomes fuji','pomes granny','pomes','poma',
    'platans','platan','plàtans','plàtan',
    'taronges','taronja','clementines','clementina','mandarines','mandarina',
    'llimones','llimona','pomelo','pomelos',
    'maduixes','maduixa','maduixots','gerds','gerd','mores','mora',
    'raim blanc','raim negre','raim','raïm',
    'peres','pera','nectarines','nectarina','pressecs','pressec','préssec','préssecs',
    'prunes','pruna','cireres','cirera','albercoques','albercoc',
    'sindria','síndria','melo','melons','meló',
    'pinya','mango','papaia','kiwis','kiwi',
    'figues','figa','caquis','caqui','codonys','codony',
    'aguacate','alvocat','alvocats',
    'fruita de temporada','fruita variada','fruita',
    // fruita seca
    'ametlles','ametlla','nous','noces','avellanes','avellana',
    'panses','pinyons','festucs','anacards','anacards','cacahuets','cacahuet',
    'dàtils','datils','fruits secs','fruita seca',
    // pastanaga (hortalisses que es mengen com a fruita)
    'pastanagues','pastanaga',
  ]},

  // ── Verdura & Hortalisses ────────────────────────────────────────────────────
  { cat: 'verdura', words: [
    // amanides
    'enciam iceberg','enciam romà','enciam','ruca','canonges','espinacs baby',
    'escarola','endivies','endivia',
    // tomàquets
    'tomates cherry','tomates pera','tomates ramallet','tomata cherry',
    'tomata amanida','tomates amanida','tomata de xucar','tomates xucar',
    'tomata en conserva','tomates pera','tomata','tomates',
    // verdura cuinada
    'carbassons','carbasso','carbassó',
    'alberginia','albergínies','alberginies',
    'pebrots vermells','pebrots verds','pebrot','pebrots',
    'cebes','ceba','cebolletes','cebolleta','porros','porro',
    'alls','all','gingebre',
    'broquil','brocoli','brócoli','coliflor',
    'espinacs','espinac','bleda','bledar','api','apio',
    'mongeta verda','mongeta tendra','mongetes tendres','judies',
    'carbassa','carbasses','carbassa','xampinyons','xampinyo','bolets','bolet',
    'olives negres','olives verdes','olives',
    'blat de moro','panís',
    'patates','patata','moniatos','moniato',
    'calçots','calçot','remolatxa',
    'verdura pel caldo','verdura per cuinar','verdura per dinar','verdura',
    'hortalissa','hortalisses',
  ]},

  // ── Pa, Galetes & Brioixeria ──────────────────────────────────────────────────
  { cat: 'pa', words: [
    // pa
    'pa bimbo','pa de motlle','pa de pages','pa integral','pa sense gluten',
    'pa de llavor','pa rus','pa de viena','pa hamburguesa','pa hot dog',
    'barra pa','pa blanc','pa negre','pa torrat',
    'panets per entrepans','panets rodons','panets','pa',
    // galetes i snacks dolços
    'galetes maria','galetes digestive','galetes birba','galetes xocolata',
    'galetes de mantequilla','galetes de pages','galetes','cookies',
    'biscuits','crackers',
    // brioixeria
    'croissants','croissant','napolitanes','napolitana','ensaimades','ensaimada',
    'magdalenes','magdalena','muffins','muffin','donuts','donut',
    'brioixos','briox','brioche',
    // cereals
    'cereals kellogs','cereals muesli','cereals','muesli','granola',
    // altres
    'tortitas','obleas','torrades','melba',
    'pa de canyella','pa de pessic',
  ]},

  // ── Carn & Embotits ───────────────────────────────────────────────────────────
  { cat: 'embotits', words: [
    // embotits crus
    'pernil dolc','pernil salat','pernil iberic','pernil serrà','pernil',
    'fuet','secallona','llonganissa de vic','llonganissa','chorizo','xoriso','xoriço',
    'botifarra negra','botifarra blanca','botifarra','butifarra',
    'mortadel·la','mortadella','mortadela',
    'salami','salchichon','salxixon',
    'embotits','embotit','pack embotits',
    // carn fresca
    'pit de pollastre','cuixes pollastre','pollastre sencer','pollastre',
    'filets de vedella','vedella picada','vedella',
    'filets de porc','llom de porc','costelles de porc','porc',
    'conill','xai','moltó',
    'hamburgueses de vedella','hamburgueses de pollastre','hamburgueses',
    'salsitxes frankfurt','salsitxes','butis','wieners',
    'cansalada viada','cansalada','bacon',
    'carn picada','carn per estofar','carn per a la brasa',
    'carn per dinar','carn per sopar','carn',
    // croquetes i preparats
    'croquetes casolanes','croquetes de pernil','croquetes',
    'mandonguilles','mandonguilla',
    'carn rebossada',
  ]},

  // ── Peix & Marisc ─────────────────────────────────────────────────────────────
  { cat: 'peix', words: [
    // peix fresc
    'lluc','lluç','rap','daurada','lubina','llobarro','salmó','salmo',
    'bacalla dessalat','bacalla','bacallà',
    'tonyina fresca','tonyina en llauna','tonyina','bonitol',
    'sardines','sardina','anxoves','anxova',
    'truita de riu','truita',
    'peix per forn','peix per sopar','peix per cuinar','peix',
    // marisc
    'gambes','gamba','escamarlans','escamarlan',
    'musclos','musclo','cloïsses','cloissa',
    'calamars','calamar','sipia','sípia',
    'llagostins','llagosti',
    'cranc','llamantol',
    // conserves peix
    'tonyina en oli','sardines en llauna','anxoves en llauna',
    'fumet peix','caldo peix',
  ]},

  // ── Begudes ──────────────────────────────────────────────────────────────────
  { cat: 'begudes', words: [
    // cafè i te
    'cafe en gra','cafe molido','cafe soluble','nespresso','dolce gusto',
    'cafeteres','cafe','cafè',
    'te verd','te negre','te roig','te','infusions','infusio','menta poleo',
    'colacao','nesquik','cacaolat','cacaolats',
    // sucs
    'suc de taronja','suc de poma','suc de fruita','suc natural','suc',
    'nectars','nectar',
    // begudes amb gas
    'agua con gas','agua amb gas','agua gas',
    'coca cola','pepsi','fanta','sprite','refresco','refrescos',
    'tonica','tòniques','tònica','bitter',
    // begudes sense gas
    'agua mineral','ampolles agua','ampolles d\'agua','agua','aigua',
    // alcoholiques
    'cerveses sense alcohol','cerveses','cervesa','birres','birra',
    'vi negre','vi blanc','vi rosat','cava','xampany','vi',
    'ginebra','whisky','rom','vodka',
    // altres
    'isotoniques','isotonica','aquarius',
    'preparat per caldo',
  ]},

  // ── Rebost & Condiments ──────────────────────────────────────────────────────
  { cat: 'rebost', words: [
    // olis i vinagres
    'oli d\'oliva verge extra','oli d\'oliva','oli de girasol','oli de coco','oli',
    'vinagre de manzana','vinagre de vi','vinagre balsamic','vinagre',
    // condiments
    'sal marina','sal gruixuda','sal fina','sal',
    'sucre moreno','sucre blanc','sucre',
    'mel','melassa',
    'pebre','paprika','curcuma','canyella','comí','orenga','romaní',
    'farigola','herbes','espècies','especias',
    // farines i llevats
    'farina de força','farina de reposteria','farina integral','farina de blat','farina',
    'llevat','royal','bicarbonat',
    // salses i conserves
    'salsa de tomata','salsa tomata vilopriu','salsa tomata','tomata fregida',
    'ketchup','mostassa','maionesa','aioli',
    'salsa de soja','salsa worcestershire','tabasco',
    'conserves','pate',
    // dolços i xocolata
    'melmelada de maduixa','melmelada de cireres','melmelada vilopriu','melmelada',
    'nocilla','nutella','crema de cacau',
    'xocolata negra','xocolata amb llet','xocolata per fondre','xocolata',
    'cacau en pols',
    // snacks i aperitius
    'patates fregides','xips','chips','snacks','aperitiu','olives',
    // paper de cuina
    'paper alumini','paper film','film transparent','paper de forn',
    'paper de cuina','paper wc','paper higiènic',
  ]},

  // ── Pasta, Arròs & Llegums ───────────────────────────────────────────────────
  { cat: 'pasta', words: [
    // pasta
    'espaguetis','espagueti','macarrons','fideus gruixuts','fideus fins','fideus',
    'tagliatelle','penne','rigatoni','farfalle','fusilli','lasanya','canelons',
    'pasta fresca','pasta integral','pasta sense gluten','pasta',
    'massa pizza','massa de pizza','bases de pizza',
    // arròs
    'arros basmati','arros llarg','arros rodó','arros integral',
    'arros per risotto','arros bomba','arros','arròs',
    // cous cous i altres
    'cous cous','couscous','quinoa','bulgur','espelta','civada',
    // llegums
    'llenties','llenties pardines','llenties verdes',
    'cigrons','mongetes del ganxet','mongetes','faves','pèsols secs','pesols secs',
    'soja','edamame',
    'llegums en conserva','llegums',
  ]},

  // ── Congelats & Plats Preparats ──────────────────────────────────────────────
  { cat: 'congelats', words: [
    // congelats
    'gelats magnum','gelats cornetto','gelats','gelat',
    'pizzes la sirena','pizzes congelades','pizzes','pizza congelada',
    'hamburguesa d\'espinacs','hamburguesa vegana',
    'verdura congelada','espinacs congelats','pesols congelats',
    'gambes congelades','peix congelat',
    'croquetes congelades','croquetes',
    'patates fregides congelades',
    // plats preparats
    'plats preparats','plat preparat','lasanya preparada',
    'empanades','empanadilles',
    'congelat',
  ]},

  // ── Neteja & Llar ────────────────────────────────────────────────────────────
  { cat: 'neteja', words: [
    // roba
    'detergent roba liquido','detergent roba','detergent capsules','detergent',
    'suavitzant roba','suavitzant',
    'norit','ariel','skip','persil','wipp',
    'tovalloletes roba','tovalloletes de roba','tovalloletes rentadora',
    // cuina
    'estropajos','estropajo','bayeta','esponja fregar','raspall fregar','fregall',
    'guants goma','guants neteja',
    'fairy','Ajax','mistol','cif','vim',
    'pastilles rentaplats','sal rentaplats','abrillantador',
    'cucal','domestos','lleixiu',
    // bany i wc
    'pato wc','netejador wc','gel wc',
    'viakal','kh7','spray bany',
    'liquid tuberies','desembussador',
    // paper
    'paper wc','paper higiènic','rotllo wc',
    'paper de cuina','paper absorbent',
    'tovallons de paper','tovallons',
    'bosses de basura','bosses de bassura','bosses de fem',
    'bosses de congelador','bosses zip',
    // altres llar
    'kleenex','mocadors de paper','caixa mocadors',
    'piles aa','piles aaa','piles','pila',
    'bombetes','bombeta',
    'fregona','mopa','pal de fregar',
    'pala recollidor','escombra',
    'palangana','cubell',
    'esprai antimosquits','repelent mosquits','recanvi raid','espirals mosquits',
    'ambientador','frescor',
    'paper de regal','paper d\'embolicar',
  ]},

  // ── Higiene Personal ─────────────────────────────────────────────────────────
  { cat: 'higiene', words: [
    // sabons i gels
    'sabo de mans','sabo liquido','sabo natural','sabo',
    'gel de dutxa','gel cos','gel',
    'espuma de bany','sals de bany',
    // cabell
    'xampu anticaspa','xampu hidratant','xampu','shampoo',
    'condicionador','mascareta cabell','cabell',
    // dents
    'dentifric blanquejador','dentifric','pasta de dents','cepill de dents','raspall de dents',
    'fil dental','enjuagament bucal','enjuagament',
    // deodorant
    'desodorant roll on','desodorant spray','desodorant',
    // higiene femenina
    'compreses amb ales','compreses','salvaslips','tampons','tampax','copa menstrual',
    // maquillatge i cura
    'crema hidratant cos','crema de dia','crema de nit','crema solar','crema',
    'contorn d\'ulls','serum','tonic facial',
    'desmaquillant','discos de cotó','cotó',
    'colònia','perfum',
    // afaitat
    'maquinetes d\'afaitar','maquinetes','gels d\'afaitar','crema d\'afaitar',
    // preservatius
    'condons','preservatius',
    // gel fixador
    'gel fixador cabell','gomina','laca',
    'gomes de cabell','pinces cabell',
    // bebe
    'panyals dídac','panyals talla 3','panyals talla 4','panyals talla 5','panyals',
    'tovalloletes dídac','tovalloletes bebe','toallitas',
    'crema culet','crema bebe',
    // altres
    'paper higiènic','cotó fluix',
  ]},
];

// ─── Normalitza text (treu accents, minúscules, espais extra) ─────────────────
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalize(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Detecta categoria d'un article ──────────────────────────────────────────
function detectCategory(itemName) {
  const norm = normalize(itemName);
  for (const entry of KEYWORDS) {
    for (const word of entry.words) {
      const normWord = normalize(word);
      if (!normWord) continue;
      const pattern = new RegExp(`\\b${escapeRegExp(normWord)}\\b`, 'i');
      if (pattern.test(norm)) {
        return CATEGORIES.find(c => c.id === entry.cat);
      }
    }
  }
  return CATEGORIES.find(c => c.id === 'altres');
}

function splitConjunctions(line) {
  const parts = line.split(/\s+(?:i|y|e)\s+/i).map(part => part.trim()).filter(Boolean);
  if (parts.length > 1 && parts.every(part => part.length >= 2 && part.length <= 40)) {
    return parts;
  }
  return [line];
}

// ─── Extreu articles d'un missatge de WhatsApp ────────────────────────────────
function extractItems(message) {
  const skipPatterns = [
    /^(si|no|ok|gracies|perfecte|dacord|ja esta|ja ho|molt be|molt ben)/i,
    /^(ja en tenim|ja ho tenim|ja ho tinc|no cal|no fa falta|encarregar|regar|baixar|anar a)/i,
    /^\d+[\+\-\*\/]/,
    /^https?:\/\//,
    /^<Multimedia/,
    /^>>/,
    /^!/, 
  ];
  const trimmed = message.trim();
  for (const pattern of skipPatterns) {
    if (pattern.test(trimmed)) return [];
  }

  const lines = message
    .replace(/\r/g, '')
    .split(/[\n,;]+/)
    .map(l => l.trim())
    .filter(l => l.length > 1 && l.length < 120);

  const items = [];
  for (const line of lines) {
    const clean = line.replace(/^[\-•*◻️⬜🛒\d\.\)\s]+/, '').trim();
    if (clean.length < 2) continue;
    if (/\?$/.test(clean) && clean.length < 20) continue;
    if (/^\d+\s/.test(clean)) continue;

    const splits = splitConjunctions(clean);
    for (const split of splits) {
      const part = split.trim();
      if (part.length > 1 && part.length < 80) {
        items.push(part);
      }
    }
  }

  return items;
}

// ─── Funció principal ─────────────────────────────────────────────────────────
async function categorizeItems(rawMessage) {
  const items = extractItems(rawMessage);
  return items.map(name => {
    const category = detectCategory(name);
    return { name, category_id: category.id };
  });
}

function getCategoryInfo(categoryId) {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
}

module.exports = { categorizeItems, getCategoryInfo, CATEGORIES };
