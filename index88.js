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
            // استخدام اسم المستخدم (يفضل إنجليزي لضمان ظهور النص)
            const name = user.username || "Unknown";
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            // إعدادات النص
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 12;
            
            // تم ضبط الارتفاع ليكون تحت كلمة Total Points مباشرة
            ctx.fillText(String(name), x + size / 2, y + size + 75);
        }

        // الإحداثيات الجديدة بناءً على معاينة الصور التي أرسلتها:
        // المركز 1 (الوسط) - الدائرة الذهبية
        await drawUser(userList[0], 525, 230, 230); 
        
        // المركز 2 (اليسار) - الدائرة الفضية
        await drawUser(userList[1], 155, 335, 190); 
        
        // المركز 3 (اليمين) - الدائرة البرونزية
        await drawUser(userList[2], 935, 335, 190);

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ 
            content: '🏆 **قائمة التوب:**', 
            files: [attachment] 
        });

    } catch (err) {
        console.error('Error generating image:', err);
        message.reply('⚠️ حدث خطأ أثناء معالجة الصورة.');
    }
});

client.login(process.env.TOKEN);
