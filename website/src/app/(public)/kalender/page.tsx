import { getCalendarEvents } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kalender | Scouts Kriko-M' }

const MONTHS_NL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const MONTHS_SHORT: Record<number, string> = {
  1:'Jan',2:'Feb',3:'Mrt',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Okt',11:'Nov',12:'Dec'
}
const WEEKDAYS = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag']

function googleCalUrl(event: any) {
  const d = event.date.replace(/-/g, '')
  const title = encodeURIComponent(event.title)
  const loc = encodeURIComponent(event.location ?? '')
  const desc = encodeURIComponent(event.description ?? '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${d}/${d}&details=${desc}&location=${loc}`
}

export default async function KalenderPage() {
  const events = await getCalendarEvents()
  const today = new Date(); today.setHours(0,0,0,0)
  const upcoming = events.filter((e: any) => new Date(e.date) >= today)

  const gridEvents = events.map((e: any) => ({ id: e.id, date: e.date, title: e.title, time: e.time }))

  return (
    <>
      <section className="tak-hero primair hero-kalender">
        <div className="container">
          <span className="hero-eyebrow">Activiteiten &amp; evenementen</span>
          <h1 className="tak-hero-title">Kalender</h1>
          <p style={{ color: 'rgba(255,255,255,.85)', marginTop: 8, fontSize: '1.1rem' }}>
            Alle groepsactiviteiten van Scouts Kriko-M — in één klik in jouw agenda.
          </p>
        </div>
      </section>

      <section className="section container section--no-top">
        <div className="cal-actions">
          <div className="cal-actions-group">
            <a href="/api/kalender/ics" className="btn btn-secondary cal-actions-btn">
              <i className="fa-regular fa-calendar-plus"></i> Abonneer op onze agenda
            </a>
            <a href="/api/kalender/ics" download className="btn btn-outline cal-actions-btn">
              <i className="fa-solid fa-download"></i> Download (.ics)
            </a>
          </div>
          <a href="/portaal" className="btn btn-primary cal-actions-btn">
            Inschrijven voor weekend/kamp <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>
        <p className="cal-actions-hint">
          <i className="fa-solid fa-circle-info"></i>
          &ldquo;Abonneren&rdquo; zet onze hele kalender in jouw agenda-app &mdash; nieuwe activiteiten verschijnen dan automatisch.
        </p>

        {events.length === 0 ? (
          <div className="cal-empty">
            <p>Er staan momenteel geen activiteiten gepland. Kom snel eens terug kijken!</p>
          </div>
        ) : (
          <div className="cal-layout">
            {/* Kalenderraster — interactief via JS */}
            <div className="cal-calendar" id="cal-calendar">
              <div className="cal-cal-header">
                <span className="cal-cal-title" id="cal-title">&nbsp;</span>
                <div className="cal-cal-nav">
                  <button type="button" className="cal-today-btn" id="cal-today">Vandaag</button>
                  <button type="button" className="cal-nav-btn" id="cal-prev" aria-label="Vorige maand">
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button type="button" className="cal-nav-btn" id="cal-next" aria-label="Volgende maand">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
              <div className="cal-weekdays">
                <span>Ma</span><span>Di</span><span>Wo</span><span>Do</span><span>Vr</span><span>Za</span><span>Zo</span>
              </div>
              <div className="cal-days" id="cal-days"></div>
              <div className="cal-legend">
                <span className="cal-legend-item"><span className="cal-legend-dot cal-legend-today"></span> Vandaag</span>
                <span className="cal-legend-item"><span className="cal-legend-dot cal-legend-event"></span> Activiteit</span>
              </div>
            </div>

            {/* Aankomende evenementen */}
            <div className="cal-upcoming">
              <h3 className="cal-upcoming-title">Aankomende activiteiten</h3>
              {upcoming.length === 0 ? (
                <p className="cal-upcoming-empty">Er zijn momenteel geen aankomende activiteiten gepland.</p>
              ) : (
                upcoming.map((event: any) => {
                  const d = new Date(event.date)
                  const day = String(d.getDate()).padStart(2, '0')
                  const month = MONTHS_SHORT[d.getMonth() + 1]
                  const weekday = WEEKDAYS[d.getDay()]
                  const dateStr = `${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`

                  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
                  const countdown = diff === 0 ? 'Vandaag' : diff === 1 ? 'Morgen' : `Nog ${diff} dagen`

                  return (
                    <article key={event.id} className="cal-event" id={`event-${event.id}`} data-date={event.date}>
                      <div className="cal-event-date" aria-hidden="true">
                        <span className="cal-event-day">{day}</span>
                        <span className="cal-event-month">{month}</span>
                      </div>
                      <div className="cal-event-body">
                        <span className="cal-countdown">{countdown}</span>
                        <h4 className="cal-event-title">{event.title}</h4>
                        <div className="cal-event-meta">
                          <span><i className="fa-regular fa-calendar"></i> {weekday} {dateStr}</span>
                          {event.time && <span><i className="fa-regular fa-clock"></i> {event.time}</span>}
                          {event.location && <span><i className="fa-solid fa-location-dot"></i> {event.location}</span>}
                        </div>
                        {event.description && <p className="cal-event-desc">{event.description}</p>}
                        <div className="cal-event-actions">
                          <span className="cal-add-label">In agenda:</span>
                          <a href={googleCalUrl(event)} className="cal-add-btn" target="_blank" rel="noopener">
                            <i className="fa-brands fa-google"></i> Google
                          </a>
                          <a href={`/api/kalender/ics?event=${event.id}`} className="cal-add-btn">
                            <i className="fa-regular fa-calendar"></i> Apple / Outlook
                          </a>
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </div>
        )}
      </section>

      {/* Kalender JS */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var events = ${JSON.stringify(gridEvents)};
          var daysRoot = document.getElementById('cal-days');
          var titleEl = document.getElementById('cal-title');
          if (!daysRoot || !titleEl) return;
          var MONTHS = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
          var byDate = {};
          events.forEach(function(e) { (byDate[e.date] = byDate[e.date] || []).push(e); });
          var today = new Date(); today.setHours(0,0,0,0);
          var todayKey = today.toISOString().slice(0,10);
          var futureKeys = Object.keys(byDate).filter(function(k){ return k >= todayKey; }).sort();
          var view;
          if (futureKeys.length) {
            var p = futureKeys[0].split('-');
            view = new Date(+p[0], +p[1]-1, 1);
          } else {
            view = new Date(today.getFullYear(), today.getMonth(), 1);
          }
          var selectedKey = null;
          function toKey(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
          function render() {
            var y = view.getFullYear(), m = view.getMonth();
            titleEl.textContent = MONTHS[m] + ' ' + y;
            var todayBtn = document.getElementById('cal-today');
            if (todayBtn) todayBtn.disabled = (y===today.getFullYear()&&m===today.getMonth());
            var first = (new Date(y,m,1).getDay()+6)%7;
            var days = new Date(y,m+1,0).getDate();
            daysRoot.innerHTML = '';
            for(var i=0;i<first;i++){var e=document.createElement('span');e.className='cal-day empty';daysRoot.appendChild(e);}
            for(var d=1;d<=days;d++){
              var key=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
              var de=byDate[key];
              var cell=document.createElement(de?'button':'span');
              cell.className='cal-day'; cell.textContent=d;
              if(key===todayKey) cell.classList.add('today');
              if(key===selectedKey) cell.classList.add('selected');
              if(de){
                cell.classList.add('has-event'); cell.type='button';
                var dot=document.createElement('span'); dot.className='cal-day-dot'; cell.appendChild(dot);
                (function(k,devts){ cell.addEventListener('click',function(){ selectedKey=k; render(); var t=document.getElementById('event-'+devts[0].id); if(t){t.scrollIntoView({behavior:'smooth',block:'center'}); t.classList.add('highlight'); setTimeout(function(){t.classList.remove('highlight');},1600);} }); })(key,de);
              }
              daysRoot.appendChild(cell);
            }
          }
          document.getElementById('cal-prev').addEventListener('click',function(){view=new Date(view.getFullYear(),view.getMonth()-1,1);render();});
          document.getElementById('cal-next').addEventListener('click',function(){view=new Date(view.getFullYear(),view.getMonth()+1,1);render();});
          var tb=document.getElementById('cal-today'); if(tb) tb.addEventListener('click',function(){view=new Date(today.getFullYear(),today.getMonth(),1);selectedKey=null;render();});
          render();
        })();
      `}} />
    </>
  )
}
