// Создание платежа ЮKassa за тариф или пакет «Трио».
const { enabled, rpc, yk, cors, body, RETURN } = require('../lib/pay');
const crypto = require('crypto');

module.exports = async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const b = await body(req);
  if (b.action === 'status') return res.status(200).json({ enabled: enabled() });
  if (!enabled()) return res.status(200).json({ error: 'Онлайн-оплата скоро появится. Пока можно запросить счёт.', hint: 'disabled' });
  const product = String(b.product || ''); const plan = String(b.plan || '');
  if (!['pd', 'zh', 'sv'].includes(product) || !/^[a-z]{2,12}$/.test(plan) || typeof b.token !== 'string' || b.token.length < 20 || b.token.length > 200) {
    return res.status(400).json({ error: 'Неверный запрос' });
  }
  try {
    const c = await rpc('bill_checkout', { p_secret: process.env.BILL_SECRET, p_product: product, p_token: b.token, p_plan: plan });
    const amount = Number(c.amount).toFixed(2);
    const pay = {
      amount: { value: amount, currency: 'RUB' },
      capture: true,
      confirmation: { type: 'redirect', return_url: RETURN[product] + '?paid=1' },
      description: String(c.description).slice(0, 128),
      metadata: { product, plan, owner_id: c.owner_id }
    };
    // чек 54-ФЗ через ЮKassa — включается переменной YOOKASSA_RECEIPT=1 (для ИП/ООО с онлайн-кассой); у самозанятого чек уходит в «Мой налог»
    if (process.env.YOOKASSA_RECEIPT === '1' && c.email) {
      pay.receipt = { customer: { email: c.email }, items: [{ description: String(c.description).slice(0, 128), quantity: '1.00', amount: { value: amount, currency: 'RUB' },
        vat_code: Number(process.env.YOOKASSA_VAT || 1), payment_mode: 'full_payment', payment_subject: 'service' }] };
    }
    const p = await yk('POST', '/payments', pay, crypto.randomUUID());
    await rpc('bill_payment_new', { p_secret: process.env.BILL_SECRET, p_id: p.id, p_product: product, p_owner: c.owner_id, p_email: c.email || '', p_plan: plan, p_amount: Number(amount) });
    return res.status(200).json({ url: p.confirmation && p.confirmation.confirmation_url, id: p.id });
  } catch (e) {
    const auth = e.hint === 'auth';
    return res.status(auth ? 401 : 502).json({ error: auth ? 'Войдите в кабинет заново' : 'Не получилось создать платёж. Попробуйте ещё раз через минуту.', hint: e.hint || null });
  }
};
