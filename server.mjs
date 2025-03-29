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

// ตรวจสอบว่า API Key ถูกต้องหรือไม่
if (!HUGGINGFACE_API_KEY) {
    console.error("❌ [ERROR] ไม่พบ API Key ใน .env");
    process.exit(1);
}

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "กรุณาระบุ message" });
    }

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: message })
        });

        const data = await response.json();
        if (response.ok) {
            res.json({ response: data });
        } else {
            console.error("❌ [ERROR] API HuggingFace ตอบกลับข้อผิดพลาด:", data);
            res.status(500).json({ error: "เกิดข้อผิดพลาดจาก Hugging Face API" });
        }

    } catch (error) {
        console.error("❌ [ERROR] เกิดข้อผิดพลาด:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการประมวลผลคำถาม" });
    }
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 [SERVER] กำลังทำงานที่พอร์ต ${port}`);
});
