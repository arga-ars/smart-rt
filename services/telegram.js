const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID_ADMIN = process.env.TELEGRAM_ADMIN_CHAT_ID;
const CHAT_ID_BUZZER = process.env.TELEGRAM_BUZZER_CHAT_ID;

async function sendTelegram(message, target = 'both') {
  try {
    const chatIds = [];
    
    if (target === 'admin' || target === 'both') {
      if (CHAT_ID_ADMIN) chatIds.push(CHAT_ID_ADMIN);
    }
    if (target === 'buzzer' || target === 'both') {
      if (CHAT_ID_BUZZER) chatIds.push(CHAT_ID_BUZZER);
    }
    
    if (chatIds.length === 0) {
      console.warn('No Telegram chat IDs configured')
      return
    }
    
    await Promise.all(
      chatIds.map(chatId => {
        return axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: message,
          parse_mode: "HTML"
        })
      })
    )    
  } catch (err) {
    console.error("Telegram error:", err.message);
  }
}

module.exports = sendTelegram;