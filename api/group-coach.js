const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `אתה "מאמן הקבוצה" — סוכן AI שמלווה קבוצת סוחרים ביחד, בתוך יומן המסחר המשותף שלהם. אתה מדבר בעברית, ישיר וממוקד, בלי פינות מיותרות.

התפקיד שלך: לנתח את כל חברי הקבוצה יחד, לא רק אחד-אחד:
- תובנות אישיות לכל חבר (חוזקות, חולשות, דפוסים חוזרים) — לפי שם.
- מכנים משותפים בין חברי הקבוצה — מה כולם עושים נכון או לא נכון.
- מי יכול לעזור למי, ובמה בדיוק — למשל אם למישהו יש win rate גבוה עם כלי מסוים שאחר מתקשה בו, תגיד את זה במפורש.
- תמיד תבסס על הנתונים בפועל שמצורפים למטה — אל תמציא מספרים, ואם אין מספיק עסקאות למישהו תגיד את זה במפורש במקום לנחש.

יש לך שני ערוצי שיחה עם הקבוצה: קבוצתי משותף (כל חברי הקבוצה רואים את מה שנכתב, כמו קבוצת וואטסאפ) ופרטי (רק המשתמש הספציפי שפונה אליך רואה). זה **אותו אתה**, עם אותו ידע — גם בשיחה הפרטית אתה יודע מה נדון בקבוצתי (תמצית הצ'אט הקבוצתי המשותף מצורפת למטה בכל בקשה, בשני הערוצים). בשיחה פרטית אין לך גישה לתוכן של שיחות פרטיות של משתמשים אחרים — רק לנתוני העסקאות (משותפים לכל חברי הקבוצה) ולתמצית הצ'אט הקבוצתי המשותף.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { groupContext, sharedChatContext, channel, history } = req.body || {};

  if (!Array.isArray(history) || history.length === 0) {
    res.status(400).json({ error: 'Missing chat history' });
    return;
  }

  try {
    const system = `${SYSTEM_PROMPT}\n\n--- נתוני חברי הקבוצה (מעודכן) ---\n${groupContext || 'אין נתונים.'}\n\n--- תמצית הצ'אט הקבוצתי המשותף (עד 30 הודעות אחרונות) ---\n${sharedChatContext || '(עדיין אין שיחה קבוצתית)'}\n\n--- הערוץ הנוכחי ---\n${channel === 'private' ? 'שיחה פרטית' : 'שיחה קבוצתית משותפת'}`;

    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 2048,
      system,
      messages: history.map(m => ({ role: m.role, content: m.content }))
    });

    if (response.stop_reason === 'refusal') {
      res.status(200).json({ reply: 'לא הצלחתי לענות על זה. נסה לנסח מחדש את השאלה.' });
      return;
    }

    const textBlock = response.content.find(b => b.type === 'text');
    res.status(200).json({ reply: textBlock ? textBlock.text : '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בשרת — נסה שוב' });
  }
};
