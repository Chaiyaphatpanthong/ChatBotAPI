require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json()); // รองรับ JSON

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 📌 บทบาทของ NPC (ตั้งค่าได้)
const NPC_ROLES = {
    "guide": "คุณคือไกด์นำเที่ยวที่สามารถแนะนำสถานที่ท่องเที่ยวในเชียงใหม่",
    "historian": "คุณคือผู้เชี่ยวชาญด้านประวัติศาสตร์ที่ให้ข้อมูลเกี่ยวกับประวัติศาสตร์ของเชียงใหม่",
    "foodie": "คุณคือนักชิมที่สามารถแนะนำอาหารอร่อยในเชียงใหม่",
};

// 📌 เส้นทางสำหรับ root path (`/`)
app.get('/', (req, res) => {
    res.send('ยินดีต้อนรับสู่ ChatBotAPI! ใช้งาน API ได้ที่เส้นทาง /chat');
});

// 📌 API Route `/chat`
app.post('/chat', async (req, res) => {
    const { role, message } = req.body;

    if (!role || !message) {
        return res.status(400).json({ error: "กรุณาระบุ role และ message" });
    }

    const npcRole = NPC_ROLES[role];
    if (!npcRole) {
        return res.status(400).json({ error: "ไม่พบบทบาทที่กำหนด" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: npcRole },
                { role: "user", content: message }
            ]
        });

        res.json({ role, response: response.choices[0].message.content });

    } catch (error) {
        console.error("❌ [ERROR] เกิดข้อผิดพลาด:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการประมวลผลคำถาม" });
    }
});

// 🔹 เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 [SERVER] กำลังทำงานที่พอร์ต ${port}`);
});
