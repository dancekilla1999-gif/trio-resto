// Уведомления ЮKassa. Телу уведомления не доверяем: перепроверяем платёж запросом в API ЮKassa.
const { enabled, rpc, yk, body } = require('../lib/pay');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  if (!enabled()) return res.status(200).json({ ok: false });
  const b = await body(req);
  const id = b && b.object && b.object.id;
  if (!id || typeof id !== 'string' || id.length > 64) return res.status(200).json({ ok: false });
  try {
    const p = await yk('GET', '/payments/' + encodeURIComponent(id));
    if (p.status === 'succeeded' && p.paid) {
      await rpc('bill_payment_paid', { p_secret: process.env.BILL_SECRET, p_id: p.id, p_amount: Number(p.amount.value) });
    } else if (p.status === 'canceled') {
      await rpc('bill_payment_failed', { p_secret: process.env.BILL_SECRET, p_id: p.id, p_status: 'canceled' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    // 5xx — ЮKassa повторит уведомление позже
    return res.status(500).json({ ok: false });
  }
};
