import express from 'express';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Replace with your real bot token (store in .env in production)
const BOT_TOKEN = '7634561247:AAH3bMmRLCHggweZGhTlQHQHRbJSwFfp4Fo';

app.use(cors());

function checkTelegramAuthorization(authData) {
  const { hash, ...rest } = authData;

  const dataCheckArr = Object.entries(rest)
    .map(([key, val]) => `${key}=${val}`)
    .sort();

  const dataCheckString = dataCheckArr.join('\n');
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) throw new Error('Invalid Telegram hash');
  if (Date.now() / 1000 - parseInt(authData.auth_date, 10) > 86400)
    throw new Error('Data is outdated');

  return rest;
}

app.get('/telegram-auth', (req, res) => {
  try {
    const userData = checkTelegramAuthorization(req.query);

    // You can also generate a JWT here and send it instead
    // const token = jwt.sign(userData, JWT_SECRET);

    // For now, just send JSON

    console.log({userData})
    res.json({
      success: true,
      user: userData,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Telegram auth server running on http://localhost:${PORT}`);
});
