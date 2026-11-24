import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp,
  ClipboardList, FileText, PackageSearch, ScanLine,
  CircleAlert, MonitorCog, RotateCcw,
} from 'lucide-react';
import './styles.css';
import { Dna } from './Dna';

const address = '432045, Россия, Ульяновская область, г. Ульяновск, Московское шоссе, д. 3, пом. 105';
const media = import.meta.env.BASE_URL + 'media/';

const equipment = [
  {
    name: 'Компьютерный томограф',
    description: 'Диагностическая система с кольцевым гентри, столом пациента и рабочей станцией оператора.',
    file: 'ct.png',
    alt: 'Кольцевой компьютерный томограф со столом пациента',
  },
  {
    name: 'Стоматологическая установка',
    description: 'Кресло пациента, светильник и инструментальный модуль в единой рабочей системе.',
    file: 'dental.png',
    alt: 'Стоматологическое кресло со светильником и инструментальным модулем',
  },
  {
    name: 'Гибкий видеоэндоскоп',
    description: 'Эндоскоп с гибкой вводимой частью и рукояткой управления для визуального обследования.',
    file: 'endoscope.png',
    alt: 'Гибкий видеоэндоскоп с рукояткой и свёрнутой трубкой',
  },
  {
    name: 'Аппарат УЗИ',
    description: 'Ультразвуковая система на передвижной стойке с монитором, консолью управления и датчиками.',
    file: 'ultrasound.png',
    alt: 'Мобильная стойка УЗИ с монитором, консолью и датчиками',
  },
];

const symptoms = [
  { icon: CircleAlert, title: 'Код ошибки', text: 'Запишите код и этап, на котором появляется сообщение.' },
  { icon: RotateCcw, title: 'Сбой повторяется', text: 'Отметьте, после какого действия прибор перестаёт работать как обычно.' },
  { icon: MonitorCog, title: 'Проблема с модулем', text: 'Уточните, с каким датчиком, блоком или принадлежностью связан сбой.' },
];

const checklist = [
  { icon: ScanLine, title: 'Модель и маркировка', text: 'Запишите производителя и точную модель с заводской таблички.' },
  { icon: Activity, title: 'Сведения о сбое', text: 'Подготовьте описание неисправности и код ошибки, если он отображается.' },
  { icon: ClipboardList, title: 'Комплектация', text: 'Перечислите модули, датчики и принадлежности, связанные со сбоем.' },
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="РМИ — к началу страницы">
      <span className="brand-mark"><Activity size={21} aria-hidden="true" /></span>
      <span>РМИ</span>
    </a>
  );
}

function EquipmentGallery({ current, setCurrent }: { current: number; setCurrent: (index: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const count = equipment.length;
  const middle = count * 2;
  const position = useRef(middle);
  const destination = (el: HTMLDivElement, index: number) => {
    const card = el.children[index] as HTMLElement;
    return card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2;
  };
  const nearest = (el: HTMLDivElement) => {
    const step = destination(el, 1) - destination(el, 0);
    return Math.max(0, Math.min(el.children.length - 1,
      Math.round((el.scrollLeft - destination(el, 0)) / step)));
  };
  useLayoutEffect(() => {
    const el = track.current!;
    el.scrollLeft = destination(el, middle);
    const normalize = () => {
      const index = nearest(el);
      const centered = middle + index % count;
      position.current = centered;
      if (index !== centered) el.scrollLeft = destination(el, centered);
    };
    el.addEventListener('scrollend', normalize);
    const resize = new ResizeObserver(() => {
      el.scrollLeft = destination(el, position.current);
    });
    resize.observe(el);
    return () => {
      resize.disconnect();
      el.removeEventListener('scrollend', normalize);
    };
  }, [count, middle]);
  const select = (index: number) => {
    const el = track.current;
    if (!el || !el.children[index]) return;
    position.current = index;
    el.scrollTo({left: destination(el, index), behavior: reduced ? 'instant' : 'smooth'});
  };
  return <section className="section equipment-section" id="equipment" aria-labelledby="equipment-title">
    <div className="shell section-heading"><h2 id="equipment-title">Примеры инвентаря</h2></div>
    <div ref={track} className="card-carousel" role="region" aria-label="Типы медицинского инвентаря" tabIndex={0}
      onKeyDown={e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        select(position.current + (e.key === 'ArrowRight' ? 1 : -1));
      }}
      onScroll={e => setCurrent(nearest(e.currentTarget) % count)}>
      {Array.from({length: 5}, (_, copy) => equipment.map((entry, index) =>
        <button className={'equipment-card glass ' + (index === current ? 'is-active' : '')}
          key={copy + entry.file} aria-hidden={copy !== 2 || undefined}
          tabIndex={copy === 2 ? 0 : -1} aria-pressed={index === current}
          onClick={() => select(copy * count + index)}>
          <span className="card-number">0{index + 1} / 04</span>
          <img src={media + entry.file} alt={entry.alt}/>
          <h3>{entry.name}</h3><p>{entry.description}</p>
        </button>
      ))}
    </div>
    <div className="gallery-controls glass"><button aria-label="Предыдущий прибор" onClick={()=>select(position.current - 1)}><ArrowLeft size={20}/></button><span aria-live="polite">{current+1} / 4 <small>Листайте приборы</small></span><button aria-label="Следующий прибор" onClick={()=>select(position.current + 1)}><ArrowRight size={20}/></button></div>
  </section>;
}

const documents = [
  ['Медицинское оборудование', 'ООО «РМИ» занимается ремонтом медицинского оборудования и инвентаря.', 'Направление работы', 'Оборудование и инвентарь'],
  ['От прибора к отдельному узлу', 'Модель и комплектация помогают определить, с каким модулем или датчиком связан сбой.', 'Основа обращения', 'Модель · модуль · неисправность'],
];
function Document({index, progress}: {index:number; progress:MotionValue<number>}) {
  const reduced=useReducedMotion();
  const start=index*.5;
  const y=useTransform(progress,[start,start+.08,start+.25,start+.43],['20px','0px','0px',index === 0 ? '71%' : '75%']);
  const opacity=useTransform(progress,[start,start+.06],[index===0?1:0,1]);
  const scale=useTransform(progress,[start+.25,start+.43],[1,.79]);
  const [title,text,label,value]=documents[index];
  return <motion.article className="folder-paper" style={reduced?{}:{y,opacity,scale}}>
    <div className="document-top"><span>РМИ / ПРОФИЛЬ</span><span>0{index+1}</span></div>
    <h3>{title}</h3><p>{text}</p><div className="document-field"><small>{label}</small><span>{value}</span></div><div className="document-lines" aria-hidden="true"/><div className="document-bottom">О КОМПАНИИ <span>0{index+1} / 02</span></div>
  </motion.article>;
}
function About() {
  const ref=useRef<HTMLElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
  return <section ref={ref} className="about section" id="about" aria-labelledby="about-title"><div className="about-sticky shell">
    <div className="about-copy"><span className="eyebrow">О компании</span><h2 id="about-title">Медицинский инвентарь — профиль РМИ</h2><p className="scroll-hint"><ArrowDown size={16}/> Листайте, чтобы узнать больше</p></div>
    <div className="folder"><div className="folder-back"/>{documents.map((_,index)=><Document key={index} index={index} progress={scrollYProgress}/>)}<div className="folder-front"><span>РМИ<span className="folder-caption">Медицинский инвентарь</span></span><span>02 документа</span></div></div>
  </div></section>;
}
function Hero() {
  const ref=useRef<HTMLElement>(null);
  const reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target:ref,offset:['start start','155px start']});
  const y=useTransform(scrollYProgress,[0,.85],['0px','135px']);
  const deviceY=useTransform(scrollYProgress,[0,.85],['0px','-48px']);
  return <section ref={ref} className="hero" aria-labelledby="hero-title"><div className="hero-stage"><div className="hero-layout shell">
    <motion.div className="hero-copy glass" style={reduced?{}:{'--mobile-copy-y':y} as React.CSSProperties}>
      <h1 id="hero-title">Ремонт<br/><em>медицинского</em><br/>инвентаря</h1><p className="hero-description">Обслуживание начинается с точного описания прибора и неисправности. Узнайте, какие сведения помогут обсудить ремонт.</p><a className="button" href="#equipment">Смотреть инвентарь <ArrowDown size={18}/></a>
    </motion.div>
    <motion.div className="hero-visual" style={reduced?{}:{'--mobile-device-y':deviceY} as React.CSSProperties}><picture><source media="(max-width: 690px)" srcSet={media+'endoscope.png'}/><img src={media+'ct.png'} alt="Медицинское оборудование для диагностики" fetchPriority="high"/></picture></motion.div>
  </div></div></section>;
}
function Curtain({ children }: { children: React.ReactNode }) {
  const ref=useRef<HTMLElement>(null);
  const reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
  const left=useTransform(scrollYProgress,[.22,.66],['0%','-102%']);
  const right=useTransform(scrollYProgress,[.22,.66],['0%','102%']);
  return <section ref={ref} className="curtain-section" aria-labelledby="reference-title"><div className="curtain-stage">
    <div className="reference shell">{children}</div>
    {!reduced&&<div className="curtains" aria-hidden="true"><motion.div className="curtain" style={{x:left}}/><motion.div className="curtain" style={{x:right}}/></div>}
  </div></section>;
}

function App() {
  const [equipmentIndex, setEquipmentIndex] = useState(0);

  return (
    <div id="top">
      <Dna />
      <svg width="0" height="0" aria-hidden="true" style={{position:'absolute'}}><defs>
        <filter id="fluted-glass" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".12 .002" numOctaves="2" seed="7" result="ribs"/>
          <feDisplacementMap in="SourceGraphic" in2="ribs" scale="24" xChannelSelector="R" yChannelSelector="G"/>
          <feGaussianBlur stdDeviation="1.3 .3"/>
        </filter>
        <filter id="glass-grain"><feTurbulence type="fractalNoise" baseFrequency=".15 .005" numOctaves="2" seed="4" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="8"/></filter>
      </defs></svg>
      <a className="skip" href="#main">К содержанию</a>
      <header className="header shell">
        <div className="header-inner glass">
          <Brand />
          <nav aria-label="Навигация по сайту">
            <a href="#about">О компании</a>
            <a href="#equipment">Инвентарь</a>
            <a href="#preparation">Подготовка</a>
          </nav>
        </div>
      </header>

      <main id="main">
        <Hero />
        <About />

        <EquipmentGallery current={equipmentIndex} setCurrent={setEquipmentIndex} />

        <section className="section symptoms" aria-labelledby="symptoms-title">
          <div>
            <h2 id="symptoms-title">Что зафиксировать при сбое</h2>
          </div>
          <ul role="list">
            {symptoms.map(({ icon: Icon, title, text }) => (
              <li key={title}><Icon size={18} aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></li>
            ))}
          </ul>
        </section>

        <section className="section preparation" id="preparation" aria-labelledby="preparation-title">
          <h2 id="preparation-title">Что подготовить</h2>
          <ul role="list">
            {checklist.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon size={18} strokeWidth={1.65} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <Curtain>
          <div>
            <h2 id="reference-title">От чего зависит возможность ремонта</h2>
          </div>
          <div className="reference-factors">
            <div>
              <FileText size={23} aria-hidden="true" />
              <span><strong>Конструкция изделия</strong><small>Модель и характер неисправности определяют возможный объём работ.</small></span>
            </div>
            <div>
              <PackageSearch size={23} aria-hidden="true" />
              <span><strong>Доступность комплектующих</strong><small>При необходимости замены важно уточнить совместимость деталей.</small></span>
            </div>
          </div>
        </Curtain>
      </main>

      <footer id="details">
        <div className="shell">
          <div className="footer-grid">
            <div>
              
              <h2>ООО «РМИ»</h2>
            </div>
            <dl>
              <div className="wide"><dt>Полное наименование</dt><dd>Общество с ограниченной ответственностью «РМИ»</dd></div>
              <div className="wide"><dt>Юридический адрес</dt><dd>{address}</dd></div>
              <div><dt>ИНН</dt><dd>7300054779</dd></div>
              <div><dt>ОГРН</dt><dd>1267300006797</dd></div>
              <div className="wide"><dt>Телефон</dt><dd><a href="tel:+79063906313">+7 (906) 390-63-13</a></dd></div>
              <div className="wide"><dt>Электронная почта</dt><dd><a href="mailto:krjchkvjulija133@yandex.ru">krjchkvjulija133@yandex.ru</a></dd></div>
            </dl>
          </div>
          <div className="footer-bottom glass">
            <span>© 2026 ООО «РМИ»</span>
            <a href="#top">Наверх <ArrowUp size={16} aria-hidden="true" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
