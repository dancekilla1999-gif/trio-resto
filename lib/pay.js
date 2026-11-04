// Общие функции оплаты «Трио»: ЮKassa + Supabase RPC. Ключи только из переменных окружения Vercel.
const SB = 'https://qozyihhlocvgpkchyqsp.supabase.co';
const SB_KEY = 'sb_publishable_Us9CgaJDpwIpAHSQYN7QMg_ADy35Uov';
const YK = 'https://api.yookassa.ru/v3';

const ORIGINS = ['https://trio-resto-egor12.vercel.app', 'https://podacha-egor12.vercel.app', 'https://zhurnalka.vercel.app',
  'https://zhurnalka-egor12.vercel.app', 'https://svodka-egor12.vercel.app'];
const RETURN = { pd: 'https://podacha-egor12.vercel.app/app/#/o', zh: 'https://zhurnalka.vercel.app/app/#/o', sv: 'https://svodka-egor12.vercel.app/app/#/home' };

function enabled() { return !!(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY && process.env.BILL_SECRET); }

async function rpc(fn, args) {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  const t = await r.text(); let d = null; try { d = t ? JSON.parse(t) : null; } catch (e) { d = null; }
  if (!r.ok) { const e = new Error((d && d.message) || 'db ' + r.status); e.hint = d && d.hint; throw e; }
  return d;
}
function ykAuth() { return 'Basic ' + Buffer.from(process.env.YOOKASSA_SHOP_ID + ':' + process.env.YOOKASSA_SECRET_KEY).toString('base64'); }
async function yk(method, path, body, idem) {
  const h = { Authorization: ykAuth(), 'Content-Type': 'application/json' };
  if (idem) h['Idempotence-Key'] = idem;
  const r = await fetch(YK + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => null);
  if (!r.ok) { const e = new Error((d && (d.description || d.code)) || 'yookassa ' + r.status); e.status = r.status; throw e; }
  return d;
}
function cors(req, res) {
  const o = req.headers.origin;
  if (o && ORIGINS.includes(o)) { res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch (e) { return {}; }
}
module.exports = { enabled, rpc, yk, cors, body, RETURN };
