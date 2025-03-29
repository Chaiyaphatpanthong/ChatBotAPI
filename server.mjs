import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 🔹 อ่าน API Key จาก .env
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// 🔹 เส้นทางสำหรับ root path (`/`)
app.get('/', (req, res) => {
    res.send('ยินดีต้อนรับสู่ ChatBotAPI! ใช้งาน API ได้ที่เส้นทาง /chat');
});

// 🔹 API Route `/chat`
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "กรุณาระบุ message" });
    }

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HUGGINGFACE_API_KEY.trim()}`, // ใช้ .trim() เพื่อลบช่องว่าง
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: message })
        });
        

        const data = await response.json();
        res.json({ response: data });

    } catch (error) {
        console.error("❌ [ERROR] เกิดข้อผิดพลาด:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการประมวลผลคำถาม" });
    }
});

console.log("🔑 API Key:", HUGGINGFACE_API_KEY ? "Loaded" : "Not Found");


// 🔹 เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 [SERVER] กำลังทำงานที่พอร์ต ${port}`);
});
