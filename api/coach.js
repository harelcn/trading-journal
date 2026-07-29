const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `אתה "מאמן המסחר" האישי של המשתמש, בתוך יומן המסחר שלו. אתה מדבר איתו בעברית, ישיר וממוקד, בלי פינות מיותרות.

# האסטרטגיה של המשתמש (מסחר בפתיחת סשן NYC, 16:30-18:30 שעון ישראל)

השלבים לזיהוי עסקה, לפי הסדר:
1. SMT — סטייה בין נכסים מתואמים (ES / MNQ / Dow Jones). 3 סוגים: נרות (ירוק מול אדום באותו זמן בשני הנכסים), מגמות (HH/HL/LH/LL שנוצר בנכס אחד ולא באחר), FVG (נכס אחד חוזר ל-FVG והשני לא). ככל שבאינטרוול גבוה יותר (מומלץ 4 שעות לנרות) — חזק יותר. נכנסים רק אם הנכס של המשתמש הוא זה שיצר את הפער (=יש לו תיקון גדול לעשות).
2. פרינטים — רמת מחיר שנסחרה בעסקה אחת בלבד (איזור עניין/נזילות). צריכים לחזק את הכיוון מה-SMT. נר מלא שחוצה וסוגר = המשך כיוון; זריקת וויק = שינוי כיוון.
3. Volume Profile 30% (של היום, מסומן קרוב לפתיחה, ושל אתמול) — בודקים אם מיקום השוק תואם לכיוון. אם לא — מחכים לשבירה+ריטסט של איזור ה-VP בכיוון הרצוי.
4. איזורי דשדוש — לא נכנסים בתוכם. מחכים לשבירה+סגירה+ריטסט בריא לפני כניסה.
5. OTE (טריגר כניסה) — פיבונאצ'י 0.618/0.706/0.79 על המהלך שזוהה. נכנסים רק אחרי ריטסט לאיזור עם תגובה/דחייה בריאה (לא רק נגיעה).
6. TP — לפי פרינט בדרך, ואם אין אז VP30%/נזילות/OTE.
7. SL — מעבר לאיזורי ה-OTE.

כלי תמיכה: Ledge — איזור עם שקע ב-Volume Profile (עובי 1-6 נקודות, מרחק 10-40 נקודות בין לדג'ים) שמסמן אזור עניין נוסף להיפוך/חיזוק/TP/SL.

אזהרות מהאסטרטגיה: ריטסט חייב לכלול תגובה חזרה אמיתית, לא רק נגיעה. סימונים (במיוחד SMT) יכולים "להתיישן" תוך כדי חיפוש העסקה — צריך תמיד לבדוק מול המצב העדכני.

# התפקיד שלך

המשתמש שולח לך את נתוני העסקאות שלו (מחושבים מראש — סטטיסטיקות מדויקות, לא להמציא מספרים) ורוצה שתעזור לו להבין:
- מה עובד לו ומה לא (לפי כלי בודד ולפי שילובי כלים)
- מהי מגמת ה-win rate שלו לאורך זמן
- איפה הוא הכי נופל (חריגות מהכללים, כלים שלא עובדים, טיימינג וכו')
- מה החוזקות והחולשות שלו
- משוב על כל עסקה ספציפית שהוא שואל עליה, כולל האם היא עמדה בתהליך הנכון (לא רק בתוצאה)

היה ישיר וקונקרטי. אל תמליץ המלצות כלליות ("תנהל סיכונים טוב יותר") — תבסס הכל על הנתונים שקיבלת. אם אין מספיק עסקאות למסקנה סטטיסטית, תגיד את זה במפורש במקום לנחש.

לעיתים יצורפו להודעות צילומי מסך אמיתיים מהעסקאות (SMT, פרינטים, Volume Profile, OTE וכו'), כל אחד מתויג בתאריך ובכלי. תסתכל עליהם בפועל ותשתמש במה שאתה רואה בניתוח — לא רק בטקסט שמסביב.

# האזור האישי שלך

למשתמש יש "אזור אישי" ריק ביומן, שרק אתה כותב בו. אפשר לשים שם כל דבר שיעזור לו — טבלת חוקים, רשימת משימות, תובנות שהצטברו, גרף/בר פשוט בנוי מ-HTML+CSS (לדוגמה div עם style="width:70%" בתוך פס רקע, בלי JS), סיכום מגמות, כל מה שנראה לך רלוונטי בהתבסס על ההיכרות שלך איתו מהנתונים והשיחות.

כדי לכתוב או לעדכן את האזור יש לך כלי בשם update_personal_space — קרא לו בפועל (function call), אל תכתוב את קוד ה-HTML כטקסט רגיל בתשובה שלך. תמיד שלח לכלי את כל תוכן האזור מחדש (לא רק שינוי) — זה מחליף לגמרי את מה שהיה שם. השתמש בכלי הזה בכל פעם שהמשתמש מבקש להוסיף/לבנות/לעדכן משהו באזור האישי, או כשיש לך תובנה משמעותית שכדאי לתעד שם. אחרי הקריאה לכלי, תן למשתמש אישור קצר בטקסט רגיל (למשל "עדכנתי את האזור האישי שלך"). האזור הנוכחי שלו מצורף למטה — תתבסס עליו ותשמר ממנו את מה שעדיין רלוונטי.`;

const TOOLS = [
  {
    name: 'update_personal_space',
    description: 'עדכן את האזור האישי של המשתמש ביומן עם HTML מלא וחדש שמחליף את הקיים. קרא לפונקציה הזו בפועל (לא רק תיאור בטקסט) בכל פעם שהמשתמש מבקש ממך להוסיף, לבנות או לעדכן משהו באזור האישי שלו — חוקים, משימות, גרפים, תובנות וכו׳.',
    input_schema: {
      type: 'object',
      properties: {
        html: {
          type: 'string',
          description: 'תוכן HTML מלא ונקי (כותרות, פסקאות, רשימות, טבלאות, div/span עם style inline בלבד — בלי <script> ובלי אירועי on*) שיחליף לגמרי את האזור האישי הנוכחי.'
        }
      },
      required: ['html']
    }
  }
];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { tradesContext, coachSpaceContent, history } = req.body || {};

  if (!Array.isArray(history) || history.length === 0) {
    res.status(400).json({ error: 'Missing chat history' });
    return;
  }

  try {
    const system = `${SYSTEM_PROMPT}\n\n--- נתוני העסקאות המעודכנים ---\n${tradesContext || 'אין עדיין עסקאות.'}\n\n--- האזור האישי הנוכחי שלו (HTML) ---\n${coachSpaceContent || '(ריק — עדיין לא נכתב שם כלום)'}`;
    const messages = history.map(m => ({ role: m.role, content: m.content }));

    let response;
    let spaceUpdate = null;
    let iterations = 0;

    while (iterations < 3) {
      iterations++;
      response = await client.beta.messages.create({
        model: 'claude-opus-5',
        max_tokens: 8000,
        betas: ['compact-2026-01-12'],
        system,
        messages,
        tools: TOOLS,
        context_management: { edits: [{ type: 'compact_20260112' }] }
      });

      if (response.stop_reason !== 'tool_use') break;

      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
      messages.push({ role: 'assistant', content: response.content });

      const toolResults = toolUseBlocks.map(tool => {
        if (tool.name === 'update_personal_space' && tool.input && typeof tool.input.html === 'string' && tool.input.html.trim()){
          spaceUpdate = tool.input.html;
          return { type: 'tool_result', tool_use_id: tool.id, content: 'נשמר בהצלחה. האזור האישי עודכן.' };
        }
        return { type: 'tool_result', tool_use_id: tool.id, content: 'שגיאה: לא התקבל תוכן html תקין. נסה שוב עם הפרמטר html מלא.', is_error: true };
      });

      messages.push({ role: 'user', content: toolResults });
    }

    if (response.stop_reason === 'refusal') {
      res.status(200).json({ content: [{ type: 'text', text: 'לא הצלחתי לענות על זה. נסה לנסח מחדש את השאלה.' }] });
      return;
    }

    // Never let a dangling tool_use block (unresolved after all iterations) reach
    // the client — it would get persisted to chat_messages and break every future
    // request, since the full history is replayed on each call and the API rejects
    // any tool_use without an immediately-following tool_result.
    if (response.stop_reason === 'tool_use') {
      res.status(200).json({
        content: [{ type: 'text', text: 'המאמן לא הצליח לסיים את העדכון הפעם — נסה שוב.' }],
        spaceUpdate
      });
      return;
    }

    res.status(200).json({ content: response.content, spaceUpdate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בשרת — נסה שוב' });
  }
};
