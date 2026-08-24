const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');
const { zodOutputFormat } = require('@anthropic-ai/sdk/helpers/zod');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const InsightCardsSchema = z.object({
  cards: z.array(z.object({
    memberName: z.string().nullable(),
    category: z.enum(['tip', 'pattern', 'strength', 'weakness', 'general']),
    title: z.string(),
    body: z.string()
  })).max(8)
});

const SYSTEM_PROMPT = `אתה "מאמן הקבוצה" — סוכן AI שסורק את העסקאות החדשות של קבוצת סוחרים ומייצר כרטיסי תובנה קצרים וממוקדים.

לכל כרטיס:
- category: "tip" (טיפ קונקרטי לפעולה), "pattern" (דפוס חוזר/מכנה משותף בין כמה חברים), "strength" (חוזקה בולטת של חבר מסוים), "weakness" (חולשה/טעות חוזרת של חבר מסוים), או "general" (תובנה כללית שלא קשורה לחבר ספציפי).
- memberName: שם החבר הרלוונטי (בדיוק כפי שמופיע בנתונים), או null אם זו תובנה כללית/קבוצתית.
- title: משפט קצר וברור (עד 8 מילים).
- body: 1-3 משפטים, ישיר וקונקרטי, מבוסס רק על הנתונים בפועל — בלי להמציא מספרים.

כתוב עד 6 כרטיסים, רק על סמך העסקאות החדשות שצוינו כ"טרם נותחו". אם אין מספיק נתונים למסקנה משמעותית על מישהו — אל תמציא, פשוט אל תכתוב עליו כרטיס. תעדיף איכות על כמות — אם יש רק תובנה אחת אמיתית, תחזיר כרטיס אחד.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { groupContext } = req.body || {};
  if (!groupContext) {
    res.status(400).json({ error: 'Missing groupContext' });
    return;
  }

  try {
    const response = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `נתוני הקבוצה, כולל אילו עסקאות עדיין לא נותחו:\n\n${groupContext}`
      }],
      output_config: {
        format: zodOutputFormat(InsightCardsSchema)
      }
    });

    if (response.stop_reason === 'refusal') {
      res.status(200).json({ cards: [] });
      return;
    }

    if (!response.parsed_output) {
      res.status(500).json({ error: 'שגיאה בפירוש התשובה מהמאמן' });
      return;
    }

    res.status(200).json({ cards: response.parsed_output.cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בשרת — נסה שוב' });
  }
};
