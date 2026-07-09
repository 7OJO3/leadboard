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
    if (message.author.bot || !message.content.startsWith('!top')) return;

    const users = message.mentions.users;
    if (users.size < 3) return message.reply('❌ يجب عليك منشن 3 أشخاص!');

    const userList = Array.from(users.values());

    try {
        await message.channel.sendTyping();

        const canvas = createCanvas(1280, 800); 
        const ctx = canvas.getContext('2d');

        const background = await loadImage('./template.png');
        ctx.drawImage(background, 0, 0, 1280, 800);

        async function drawUser(user, x, y, size) {
            const name = user.username || "Unknown";
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            // رسم اسم المستخدم
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 10;
            // تم تعديل الـ y هنا ليظهر الاسم تحت كلمة Total Points
            ctx.fillText(String(name), x + size / 2, y + size + 70);
        }

        // الإحداثيات المحدثة لتناسب الصورة بالضبط:
        // المركز 1 (الوسط): تم ترحيله قليلاً للأعلى
        await drawUser(userList[0], 525, 230, 230); 
        
        // المركز 2 (اليسار): تم ضبطه ليتوسط الدائرة الفضية
        await drawUser(userList[1], 165, 330, 190); 
        
        // المركز 3 (اليمين): تم ترحيله لليمين ليتوسط الدائرة البرونزية
        await drawUser(userList[2], 925, 330, 190);

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
