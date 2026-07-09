const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.on('messageCreate', async (message) => {
    // التحقق من أن الرسالة ليست من بوت وأنها تبدأ بـ !top
    if (message.author.bot || !message.content.startsWith('!top')) return;

    // الحصول على المستخدمين المذكورين
    const users = message.mentions.users;
    if (users.size < 3) return message.reply('❌ يجب عليك منشن 3 أشخاص!');

    const userList = Array.from(users.values());

    try {
        // إظهار حالة "جاري الكتابة" لتعزيز تجربة المستخدم
        await message.channel.sendTyping();

        // إعداد الكانفاس
        const canvas = createCanvas(1280, 800); 
        const ctx = canvas.getContext('2d');

        // تحميل الخلفية
        const background = await loadImage('./template.png');
        ctx.drawImage(background, 0, 0, 1280, 800);

        // دالة رسم المستخدم المحسنة
        async function drawUser(user, x, y, size) {
            const name = user.username || "Unknown";
            
            // جلب الأفاتار بجودة عالية (512) لضمان عدم وجود تشويش
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            // رسم اسم المستخدم مع إضافة ظل للنص لزيادة الوضوح
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 10;
            ctx.fillText(String(name), x + size / 2, y + size + 50);
        }

        // رسم المراكز الثلاثة بالإحداثيات التي تناسب التصميم
        // المركز 1 (الوسط)
        await drawUser(userList[0], 525, 240, 230); 
        // المركز 2 (اليسار)
        await drawUser(userList[1], 175, 325, 190); 
        // المركز 3 (اليمين)
        await drawUser(userList[2], 895, 325, 190);

        // تحويل الكانفاس إلى صورة (Buffer) وإرسالها
        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ 
            content: '🏆 **قائمة التوب:**', 
            files: [attachment] 
        });

    } catch (err) {
        console.error('Error generating image:', err);
        message.reply('⚠️ حدث خطأ أثناء معالجة الصورة، تأكد من وجود ملف template.png في المجلد الرئيسي.');
    }
});

client.login(process.env.TOKEN); 
