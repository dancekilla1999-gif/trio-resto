// Смотритель и черновики продвижения для сайта Трио.
// GET /api/keeper — проверка четырёх сайтов и четыре черновика поста.
// Если задан CRON_SECRET, запрос без Bearer отклоняется (так Vercel Cron и ходит).
const { watch, promoPack } = require('../lib/keeper');

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

module.exports = async function handler(req, res) {
  const secret = process.env.CRON_SECRET || '';
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return send(res, 401, { error: 'unauthorized' });
  try {
    const [site, promo] = await Promise.all([watch(), promoPack(null)]);
    return send(res, site.level === 'bad' ? 503 : 200, { watch: site, promo });
  } catch (e) {
    return send(res, 500, { error: String(e.message || e).slice(0, 200) });
  }
};
