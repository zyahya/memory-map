const PER_PAGE = 3;

// ألوان باردة طبيعية: من النعناع الفاتح إلى الأزرق الصنوبري العميق
const PALETTE = [
  [232, 243, 239], // نعناع فاتح
  [190, 222, 214], // أخضر مائي
  [128, 182, 180], // سيلادون
  [70, 120, 132],  // أزرق بحيري
  [34, 62, 80],    // أزرق صنوبري عميق
];
const DEEP = [14, 34, 48];

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const toRgb = c => `rgb(${c.join(', ')})`;

// t من 0 (البداية) إلى 1 (النهاية)
function colorAt(t) {
  const s = Math.min(Math.max(t, 0), 1) * (PALETTE.length - 1);
  const i = Math.min(Math.floor(s), PALETTE.length - 2);
  return mix(PALETTE[i], PALETTE[i + 1], s - i);
}

// لون الخط: داكن على الخلفية الفاتحة، فاتح على الخلفية الداكنة
function lineAt(t) {
  const c = colorAt(t);
  return t < 0.55 ? mix(c, DEEP, 0.45) : mix(c, [255, 255, 255], 0.45);
}

const dateFmt = new Intl.DateTimeFormat('ar', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
});
function formatDate(s) {
  const d = new Date(s);
  return isNaN(d) ? s : dateFmt.format(d);
}

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

function buildStation(m, index) {
  const isRight = index % 2 === 1;
  // على الجوال: البطاقة دائماً في العمود الثاني. على الشاشة: يسار أو يمين الخط
  const cardCol = isRight ? 'col-start-2 sm:col-start-3' : 'col-start-2 sm:col-start-1';

  const el = document.createElement('article');
  el.className = 'station relative z-10 mx-auto grid w-full max-w-[760px] grid-cols-[44px_1fr] items-center sm:grid-cols-[1fr_56px_1fr] opacity-0 translate-y-4 transition duration-700 ease-out';

  // إطار الصورة بنسبة 4:3 ثابتة (padding-top: 75%) ليظهر الكارد بنفس الشكل
  // على الشاشة وفي الطباعة، والصورة تملأ الإطار بالقص من المنتصف
  el.innerHTML = `
    <div class="card row-start-1 ${cardCol} w-full overflow-hidden rounded-[18px] bg-white shadow-[0_10px_30px_rgba(20,50,60,0.12)]">
      ${m.image ? `
      <div class="photo relative h-0 w-full overflow-hidden bg-[#dfeee9] pt-[75%]">
        <img src="${esc(m.image)}" alt="${esc(m.description)}" loading="lazy" class="absolute inset-0 h-full w-full object-cover object-center">
      </div>` : ''}
      <time datetime="${esc(m.date)}" class="mx-[18px] mt-4 mb-1.5 block text-[.85rem] tracking-wide text-muted">${formatDate(m.date)}</time>
      <p class="mx-[18px] mb-[18px] whitespace-pre-line text-base leading-[1.8]">${esc(m.description)}</p>
    </div>
    <span class="node row-start-1 col-start-1 sm:col-start-2 justify-self-center h-4 w-4 rounded-full border-[3px] bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.4)]"></span>`;

  // إذا تعذّر تحميل الصورة نحذف إطارها ونبقي التاريخ والنص
  const img = el.querySelector('img');
  if (img) img.addEventListener('error', () => img.closest('.photo').remove());

  return el;
}

async function init() {
  const book = document.getElementById('book');

  let memories;
  try {
    memories = await (await fetch('memories.json')).json();
  } catch (e) {
    book.innerHTML = '<p class="p-10 text-center text-muted">تعذّر تحميل memories.json. شغّل الموقع عبر خادم محلي.</p>';
    return;
  }

  memories.sort((a, b) => new Date(a.date) - new Date(b.date));

  const pages = chunk(memories, PER_PAGE);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.remove('opacity-0', 'translate-y-4');
        e.target.classList.add('opacity-100', 'translate-y-0');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  pages.forEach((items, pi) => {
    const t0 = pi / pages.length;
    const t1 = (pi + 1) / pages.length;

    const page = document.createElement('section');
    page.className = 'memory-page relative flex w-full flex-col gap-14 overflow-hidden px-4 py-12 sm:gap-[72px] sm:py-[72px]';
    page.style.background = `linear-gradient(180deg, ${toRgb(colorAt(t0))}, ${toRgb(colorAt(t1))})`;

    const spine = document.createElement('div');
    spine.className = 'spine absolute top-0 bottom-0 left-[38px] sm:left-1/2 sm:-translate-x-1/2 w-0.5 z-0';
    spine.style.background = `linear-gradient(to bottom, ${toRgb(lineAt(t0))}, ${toRgb(lineAt(t1))})`;
    page.appendChild(spine);

    const nodeColor = toRgb(lineAt((t0 + t1) / 2));

    items.forEach((m, i) => {
      const station = buildStation(m, pi * PER_PAGE + i);
      station.querySelector('.node').style.borderColor = nodeColor;
      page.appendChild(station);
      io.observe(station);
    });

    // رقم الصفحة: يظهر في الطباعة فقط
    const num = document.createElement('span');
    num.className = 'pno hidden print:block absolute bottom-[6mm] left-1/2 -translate-x-1/2 z-20 rounded-full bg-white/70 px-4 py-1 text-[9pt] text-ink';
    num.textContent = (pi + 1).toLocaleString('ar');
    page.appendChild(num);

    book.appendChild(page);
  });

  // قبل الطباعة نُظهر كل المحطات
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.station').forEach(s => {
      s.classList.remove('opacity-0', 'translate-y-4');
      s.classList.add('opacity-100', 'translate-y-0');
    });
  });
}

init();
