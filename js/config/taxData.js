// ─────────────────────────────────────────────────────────────
// config/taxData.js — 40-country income tax brackets
//
// Brackets format: [minUSD, maxUSD, marginalRate]
// All thresholds in approximate USD. Simplified national/federal
// income tax only. State, provincial, and local taxes excluded.
//
// To add a country: push a new entry into TAX_COUNTRIES following
// the same object shape, then add its bracket array.
// ─────────────────────────────────────────────────────────────

const TAX_COUNTRIES = [
  { id:"NONE", name:"No Income Tax",  flag:"🌐", note:"UAE, Qatar, Bahrain, Monaco, Cayman Islands, etc.", brackets:[[0,1e9,0]] },
  { id:"US",   name:"United States",  flag:"🇺🇸", note:"Federal only. Single filer, standard deduction included.", brackets:[[0,14600,0],[14600,26200,0.10],[26200,61750,0.12],[61750,115125,0.22],[115125,206550,0.24],[206550,258325,0.32],[258325,624350,0.35],[624350,1e9,0.37]] },
  { id:"UK",   name:"United Kingdom", flag:"🇬🇧", note:"England/Wales. Personal allowance £12,570 (~$16K).", brackets:[[0,16000,0],[16000,66500,0.20],[66500,191000,0.40],[191000,1e9,0.45]] },
  { id:"CA",   name:"Canada",         flag:"🇨🇦", note:"Federal only. Basic personal amount included.", brackets:[[0,11500,0],[11500,65000,0.15],[65000,107000,0.205],[107000,166000,0.26],[166000,236000,0.29],[236000,1e9,0.33]] },
  { id:"AU",   name:"Australia",      flag:"🇦🇺", note:"Federal. Tax-free threshold AUD 18,200 (~$12K).", brackets:[[0,12000,0],[12000,55000,0.19],[55000,105000,0.325],[105000,175000,0.37],[175000,1e9,0.45]] },
  { id:"DE",   name:"Germany",        flag:"🇩🇪", note:"Federal. Basic allowance €11,784 (~$13K). Solidarity surcharge excluded.", brackets:[[0,13000,0],[13000,70000,0.25],[70000,310000,0.42],[310000,1e9,0.45]] },
  { id:"FR",   name:"France",         flag:"🇫🇷", note:"National. Part quotient system simplified.", brackets:[[0,12400,0],[12400,31500,0.11],[31500,90000,0.30],[90000,194000,0.41],[194000,1e9,0.45]] },
  { id:"JP",   name:"Japan",          flag:"🇯🇵", note:"National + local approx. combined. Basic deduction ~$3.2K.", brackets:[[0,5000,0.05],[5000,16500,0.10],[16500,36500,0.20],[36500,90000,0.30],[90000,180000,0.40],[180000,1e9,0.55]] },
  { id:"NL",   name:"Netherlands",    flag:"🇳🇱", note:"Box 1 (labour/pension income). General tax credit included.", brackets:[[0,10000,0],[10000,82000,0.369],[82000,1e9,0.495]] },
  { id:"SE",   name:"Sweden",         flag:"🇸🇪", note:"State + municipal (~32%) combined.", brackets:[[0,8000,0.25],[8000,74000,0.32],[74000,110000,0.52],[110000,1e9,0.57]] },
  { id:"NO",   name:"Norway",         flag:"🇳🇴", note:"National + municipal (22%) + bracket tax.", brackets:[[0,9000,0.22],[9000,22000,0.24],[22000,110000,0.30],[110000,1e9,0.47]] },
  { id:"DK",   name:"Denmark",        flag:"🇩🇰", note:"State + municipal (~25%) combined.", brackets:[[0,7000,0.25],[7000,87000,0.37],[87000,1e9,0.52]] },
  { id:"CH",   name:"Switzerland",    flag:"🇨🇭", note:"Federal only. Cantonal taxes vary widely (not included).", brackets:[[0,18000,0],[18000,60000,0.077],[60000,155000,0.11],[155000,895000,0.128],[895000,1e9,0.115]] },
  { id:"SG",   name:"Singapore",      flag:"🇸🇬", note:"Resident individual rate. Personal reliefs not included.", brackets:[[0,22000,0],[22000,40000,0.02],[40000,80000,0.035],[80000,120000,0.07],[120000,160000,0.115],[160000,200000,0.15],[200000,320000,0.18],[320000,500000,0.19],[500000,1e6,0.20],[1e6,1e9,0.22]] },
  { id:"HK",   name:"Hong Kong",      flag:"🇭🇰", note:"Progressive salary tax. Basic allowance HKD 132K included.", brackets:[[0,17000,0],[17000,34000,0.02],[34000,51000,0.06],[51000,68000,0.10],[68000,1e9,0.15]] },
  { id:"NZ",   name:"New Zealand",    flag:"🇳🇿", note:"Resident. NZD thresholds converted at 0.60.", brackets:[[0,11000,0.105],[11000,29000,0.175],[29000,73000,0.30],[73000,115000,0.33],[115000,1e9,0.39]] },
  { id:"IE",   name:"Ireland",        flag:"🇮🇪", note:"PAYE. Personal credit ~€1,775 included.", brackets:[[0,19000,0],[19000,50000,0.20],[50000,1e9,0.40]] },
  { id:"BE",   name:"Belgium",        flag:"🇧🇪", note:"Federal. Tax-free allowance ~€9,050.", brackets:[[0,10000,0],[10000,24000,0.25],[24000,42000,0.40],[42000,62000,0.45],[62000,1e9,0.50]] },
  { id:"AT",   name:"Austria",        flag:"🇦🇹", note:"Basic allowance €11,693 (~$13K).", brackets:[[0,13000,0],[13000,20000,0.20],[20000,40000,0.30],[40000,67000,0.41],[67000,108000,0.48],[108000,1e6,0.50],[1e6,1e9,0.55]] },
  { id:"ES",   name:"Spain",          flag:"🇪🇸", note:"State rate. Personal minimum €5,550 deducted.", brackets:[[0,6000,0],[6000,22000,0.19],[22000,35000,0.24],[35000,60000,0.30],[60000,300000,0.37],[300000,1e9,0.47]] },
  { id:"IT",   name:"Italy",          flag:"🇮🇹", note:"IRPEF national rate. Regional taxes not included.", brackets:[[0,8500,0],[8500,28000,0.23],[28000,50000,0.35],[50000,1e9,0.43]] },
  { id:"PT",   name:"Portugal",       flag:"🇵🇹", note:"IRS. Personal deduction ~€4,104 included.", brackets:[[0,7700,0.145],[7700,12000,0.21],[12000,25000,0.265],[25000,36757,0.285],[36757,80000,0.35],[80000,250000,0.48],[250000,1e9,0.50]] },
  { id:"GR",   name:"Greece",         flag:"🇬🇷", note:"Tax-free allowance €8,636 (~$9.5K) for pensioners.", brackets:[[0,9500,0],[9500,30000,0.15],[30000,45000,0.35],[45000,1e9,0.44]] },
  { id:"FI",   name:"Finland",        flag:"🇫🇮", note:"State + municipal (~22%) combined.", brackets:[[0,7000,0.22],[7000,21200,0.285],[21200,38200,0.355],[38200,74200,0.43],[74200,1e9,0.545]] },
  { id:"KR",   name:"South Korea",    flag:"🇰🇷", note:"National. Basic deduction KRW 1.5M included.", brackets:[[0,5000,0.06],[5000,15000,0.15],[15000,50000,0.24],[50000,90000,0.35],[90000,150000,0.38],[150000,300000,0.40],[300000,1e9,0.42]] },
  { id:"IL",   name:"Israel",         flag:"🇮🇱", note:"Progressive NIS rate converted at 0.27.", brackets:[[0,8000,0.10],[8000,22000,0.14],[22000,43000,0.20],[43000,75000,0.31],[75000,118000,0.35],[118000,1e9,0.50]] },
  { id:"BR",   name:"Brazil",         flag:"🇧🇷", note:"IRPF federal. Exempt threshold ~$7K/yr.", brackets:[[0,7000,0],[7000,16000,0.075],[16000,23000,0.15],[23000,33000,0.225],[33000,1e9,0.275]] },
  { id:"MX",   name:"Mexico",         flag:"🇲🇽", note:"ISR federal. Subsidy for employment not applied.", brackets:[[0,7000,0.02],[7000,12000,0.065],[12000,22000,0.10],[22000,39000,0.16],[39000,62000,0.21],[62000,118000,0.23],[118000,368000,0.30],[368000,1e9,0.35]] },
  { id:"IN",   name:"India",          flag:"🇮🇳", note:"New regime FY2024-25. Basic exemption ₹300K (~$3.6K).", brackets:[[0,3600,0],[3600,9600,0.05],[9600,15600,0.10],[15600,24000,0.15],[24000,36000,0.20],[36000,1e9,0.30]] },
  { id:"CN",   name:"China",          flag:"🇨🇳", note:"IIT. Basic exemption ¥60K/yr (~$8.3K).", brackets:[[0,8300,0],[8300,14600,0.03],[14600,22000,0.10],[22000,36000,0.20],[36000,75000,0.25],[75000,150000,0.30],[150000,300000,0.35],[300000,1e9,0.45]] },
  { id:"ZA",   name:"South Africa",   flag:"🇿🇦", note:"National. Primary rebate R17,235 (~$940) applied.", brackets:[[0,5000,0.18],[5000,15000,0.26],[15000,28000,0.31],[28000,55000,0.36],[55000,110000,0.39],[110000,1e9,0.45]] },
  { id:"TH",   name:"Thailand",       flag:"🇹🇭", note:"PIT. Exempt threshold THB 150K (~$4.2K).", brackets:[[0,4200,0],[4200,12500,0.05],[12500,28000,0.10],[28000,55000,0.15],[55000,138000,0.20],[138000,415000,0.25],[415000,1e9,0.35]] },
  { id:"MY",   name:"Malaysia",       flag:"🇲🇾", note:"Personal income tax. Resident. Basic reliefs not applied.", brackets:[[0,5000,0],[5000,25000,0.01],[25000,50000,0.03],[50000,75000,0.08],[75000,100000,0.13],[100000,250000,0.21],[250000,400000,0.24],[400000,600000,0.245],[600000,1e9,0.30]] },
  { id:"ID",   name:"Indonesia",      flag:"🇮🇩", note:"PPh 21. Non-taxable income IDR 54M (~$3.4K) included.", brackets:[[0,3400,0],[3400,18500,0.05],[18500,56500,0.15],[56500,188500,0.25],[188500,376500,0.30],[376500,1e9,0.35]] },
  { id:"PH",   name:"Philippines",    flag:"🇵🇭", note:"BIR TRAIN Law. Tax-exempt ₱250K/yr (~$4.4K).", brackets:[[0,4400,0],[4400,11100,0.15],[11100,26700,0.20],[26700,55500,0.25],[55500,222000,0.30],[222000,1e9,0.35]] },
  { id:"PL",   name:"Poland",         flag:"🇵🇱", note:"PIT. Tax-free amount PLN 30K (~$7.4K).", brackets:[[0,7400,0],[7400,44000,0.12],[44000,1e9,0.32]] },
  { id:"CZ",   name:"Czech Republic", flag:"🇨🇿", note:"PIT. Basic credit CZK 30,840 (~$1.4K) applied.", brackets:[[0,1400,0],[1400,72000,0.15],[72000,1e9,0.23]] },
  { id:"HU",   name:"Hungary",        flag:"🇭🇺", note:"Flat rate 15% on all personal income.", brackets:[[0,1e9,0.15]] },
  { id:"RO",   name:"Romania",        flag:"🇷🇴", note:"Flat 10% + CASS 10%. Combined ~20% shown.", brackets:[[0,1e9,0.20]] },
  { id:"VN",   name:"Vietnam",        flag:"🇻🇳", note:"PIT. Personal deduction VND 11M/mo (~$5.3K/yr).", brackets:[[0,5300,0],[5300,8000,0.05],[8000,14500,0.10],[14500,25000,0.15],[25000,43000,0.20],[43000,75000,0.25],[75000,108000,0.30],[108000,1e9,0.35]] },
];

// ── Tax Calculation Helpers ───────────────────────────────────

/**
 * Calculate total income tax on a given gross amount.
 * @param {number} gross - Pre-tax annual income in USD
 * @param {Array}  brackets - Array of [min, max, rate] tuples
 * @returns {number} Total tax owed
 */
function taxOnGross(gross, brackets) {
  let tax = 0;
  for (const [mn, mx, rate] of brackets) {
    if (gross <= mn) break;
    tax += (Math.min(gross, mx) - mn) * rate;
  }
  return Math.max(0, tax);
}

/**
 * Binary-search to find the gross income that results in the
 * desired net-after-tax amount. Converges within 80 iterations.
 * @param {number} net      - Desired after-tax annual income
 * @param {Array}  brackets - Tax bracket array
 * @returns {number} Required gross income
 */
function grossFromNet(net, brackets) {
  if (!brackets || brackets.length === 0) return net;
  if (brackets.length === 1 && brackets[0][2] === 0) return net; // no-tax country
  let lo = net, hi = net * 6;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const diff = mid - taxOnGross(mid, brackets) - net;
    if (Math.abs(diff) < 0.5) return mid;
    diff < 0 ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}
