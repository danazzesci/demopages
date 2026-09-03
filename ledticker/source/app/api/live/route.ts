const fallback = {
  markets: 'AAPL 229.31 +0.84%   NVDA 173.88 +2.46%   MSFT 507.23 +0.31%',
  sports: 'LIVE SPORTS  •  SCORES UPDATE AUTOMATICALLY',
  news: 'GLOBAL MARKETS AND BUSINESS NEWS  •  LIVE HEADLINES',
};

const decode = (value: string) => value
  .replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;|&#39;|&#x27;/gi, '’')
  .replace(/<[^>]+>/g, '').replace(/'/g, '’').trim();

async function markets(symbols: string[]) {
  const quotes = await Promise.all(symbols.map(async symbol => {
    const response = await fetch(`https://api.nasdaq.com/api/quote/${symbol}/info?assetclass=stocks`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Market feed unavailable');
    const json:any = await response.json();
    const q = json?.data?.primaryData;
    return `${symbol} ${q?.lastSalePrice?.replace('$','') || '—'} ${q?.percentageChange || ''}`;
  }));
  return quotes.join('   •   ');
}

async function headlines() {
  const response = await fetch('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114');
  if (!response.ok) throw new Error('News feed unavailable');
  const xml = await response.text();
  const titles = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>/g)].slice(0, 7).map(match => decode(match[1]));
  if (!titles.length) throw new Error('No headlines');
  return titles.join('   •   ');
}

const leagueUrls:Record<string,string> = {
  NFL:'football/nfl', MLB:'baseball/mlb', NBA:'basketball/nba', NHL:'hockey/nhl', MLS:'soccer/usa.1', NCAAF:'football/college-football',
};

const easternClock = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', hourCycle:'h23' }).formatToParts(new Date()).map(p => [p.type,p.value]));
  const today = `${parts.year}${parts.month}${parts.day}`;
  const noonPassed = Number(parts.hour) >= 12;
  const base = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00Z`); base.setUTCDate(base.getUTCDate()-1);
  const yesterday = `${base.getUTCFullYear()}${String(base.getUTCMonth()+1).padStart(2,'0')}${String(base.getUTCDate()).padStart(2,'0')}`;
  return { today, yesterday, noonPassed };
};

async function sports(selected: string, includeYesterday: boolean) {
  const leagues = selected === 'ALL' || !leagueUrls[selected] ? Object.keys(leagueUrls) : [selected];
  const clock = easternClock();
  const settled = await Promise.allSettled(leagues.map(async league => {
    const load = async (date:string) => { const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${leagueUrls[league]}/scoreboard?dates=${date}`, { headers:{ 'User-Agent':'Mozilla/5.0 (compatible; SignalTicker/1.0)', Accept:'application/json' } }); if (!response.ok) throw new Error('Sports feed unavailable'); return response.json() as Promise<any> };
    const today = await load(clock.today);
    const hasLive = (today?.events || []).some((event:any) => event?.status?.type?.state === 'in' || event?.competitions?.[0]?.status?.type?.state === 'in');
    const shouldShowYesterday = includeYesterday && (!clock.noonPassed || !hasLive);
    const yesterday = shouldShowYesterday ? await load(clock.yesterday) : null;
    return { league, today, yesterday, hasLive, shouldShowYesterday };
  }));
  const games = settled.flatMap(result => result.status === 'fulfilled' ? [
    ...(result.value.yesterday?.events || []).map((event:any) => ({event,league:result.value.league,label:'YDAY'})),
    ...(result.value.today?.events || []).map((event:any) => ({event,league:result.value.league,label:'TODAY'})),
  ] : []).slice(0, 40).map(({event,league,label}:any) => {
    const competition = event.competitions?.[0], teams = competition?.competitors || [];
    const away = teams.find((t:any) => t.homeAway === 'away'), home = teams.find((t:any) => t.homeAway === 'home');
    const status = competition?.status?.type?.shortDetail || event.status?.type?.shortDetail || '';
    return `${label} ${league}  ${away?.team?.abbreviation || 'TBD'} ${away?.score || ''}  ${home?.team?.abbreviation || 'TBD'} ${home?.score || ''}  ${status}`;
  });
  if (!games.length) throw new Error('No games');
  return {
    text: games.join('   •   '),
    yesterdayApplied: settled.some(result => result.status === 'fulfilled' && result.value.shouldShowYesterday),
    yesterdayCount: settled.reduce((count,result) => count + (result.status === 'fulfilled' ? (result.value.yesterday?.events?.length || 0) : 0), 0),
    todayCount: settled.reduce((count,result) => count + (result.status === 'fulfilled' ? (result.value.today?.events?.length || 0) : 0), 0),
    noonPassed: clock.noonPassed,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = (url.searchParams.get('symbols') || '').split(',').map(s => s.trim().toUpperCase()).filter(s => /^[A-Z.]{1,6}$/.test(s)).slice(0, 10);
  const symbols = requested.length ? requested : ['AAPL','NVDA','MSFT','TSLA','AMZN','META','GOOGL','NFLX','AMD','INTC'];
  const league = (url.searchParams.get('league') || 'ALL').toUpperCase();
  const includeYesterday = url.searchParams.get('yesterday') === '1';
  const results = await Promise.allSettled([markets(symbols), headlines(), sports(league, includeYesterday)]);
  const value = (index:number, key:keyof typeof fallback) => results[index].status === 'fulfilled' ? results[index].value : fallback[key];
  const sportsResult:any = value(2, 'sports');
  return Response.json({
    markets: value(0, 'markets'), news: value(1, 'news'), sports: typeof sportsResult === 'string' ? sportsResult : sportsResult.text,
    live: { markets: results[0].status === 'fulfilled', news: results[1].status === 'fulfilled', sports: results[2].status === 'fulfilled' },
    sportsPolicy: { includeYesterday, yesterdayApplied: sportsResult?.yesterdayApplied || false, yesterdayCount: sportsResult?.yesterdayCount || 0, todayCount: sportsResult?.todayCount || 0, afterNoonET: sportsResult?.noonPassed || false },
    symbols, league: leagueUrls[league] ? league : 'ALL', updatedAt: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' } });
}
