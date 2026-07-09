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

        // تحميل الخلفية
        const background = await loadImage('./template.png');
        ctx.drawImage(background, 0, 0, 1280, 800);

        // دالة الرسم (تم ضبط الإحداثيات والخط)
        async function drawUser(user, x, y, size) {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
            
            // قص الأفاتار
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            // رسم الاسم
            ctx.fillStyle = '#4a3c2c'; // لون بني غامق ليناسب ألوان التصميم
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            
            // الإحداثيات هنا تحت الـ Total Points مباشرة
            ctx.fillText(user.username, x + size / 2, y + size + 75);
        }

        // الإحداثيات النهائية بناءً على صورتك الأصلية
        // المركز 1 (الوسط)
        await drawUser(userList[0], 525, 250, 230); 
        
        // المركز 2 (اليسار)
        await drawUser(userList[1], 155, 335, 190); 
        
        // المركز 3 (اليمين)
        await drawUser(userList[2], 895, 335, 190);

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ 
            content: '🏆 **قائمة التوب:**', 
            files: [attachment] 
        });

    } catch (err) {
        console.error('Error:', err);
        message.reply('⚠️ حدث خطأ أثناء معالجة الصورة.');
    }
});

client.login(process.env.TOKEN);
