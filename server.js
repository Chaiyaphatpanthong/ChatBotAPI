require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json()); // ให้รองรับ JSON

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY
}));

// 📌 บทบาทของ NPC (ตั้งค่าได้)
const NPC_ROLES = {
    "guide": "คุณคือไกด์นำเที่ยวที่สามารถแนะนำสถานที่ท่องเที่ยวในเชียงใหม่",
    "historian": "คุณคือผู้เชี่ยวชาญด้านประวัติศาสตร์ที่ให้ข้อมูลเกี่ยวกับประวัติศาสตร์ของเชียงใหม่",
    "foodie": "คุณคือนักชิมที่สามารถแนะนำอาหารอร่อยในเชียงใหม่",
};

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
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: npcRole },
                { role: "user", content: message }
            ]
        });

        res.json({ role, response: response.data.choices[0].message.content });

    } catch (error) {
        console.error("❌ [ERROR] เกิดข้อผิดพลาด:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการประมวลผลคำถาม" });
    }
});

// 🔹 Start Server
app.listen(port, () => {
    console.log(`🌎 [SERVER] กำลังทำงานที่พอร์ต ${port}`);
});
