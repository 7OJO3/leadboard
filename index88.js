const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
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

        // دالة الرسم (تم ضبط الإحداثيات الجديدة هنا)
        async function drawUser(user, x, y, size) {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
            
            // 1. قص الأفاتار
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            // 2. رسم الاسم (لون بني غامق)
            ctx.fillStyle = '#4a3c2c'; 
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(user.username, x + size / 2, y + size + 75);
        }

        // --- الإحداثيات المحدثة بناءً على طلبك الأخير ---
        // المركز 1 (الوسط - الذهبي) - بدون تغيير
        await drawUser(userList[0], 525, 250, 230); 
        
        // المركز 2 (اليسار - الفضي): تم تحريكه (يسار قليلاً = X أصغر، أعلى قليلاً = Y أصغر)
        // الإحداثيات القديمة كانت: 155, 335. الإحداثيات الجديدة:
        await drawUser(userList[1], 145, 320, 190); 
        
        // المركز 3 (اليمين - البرونزي): تم تحريكه (يمين قليلاً = X أكبر، أعلى قليلاً = Y أصغر)
        // الإحداثيات القديمة كانت: 895, 335. الإحداثيات الجديدة:
        await drawUser(userList[2], 905, 320, 190);

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ 
            content: '🏆 **قائمة التوب المحدثة:**', 
            files: [attachment] 
        });

    } catch (err) {
        console.error('Error:', err);
        message.reply('⚠️ حدث خطأ أثناء معالجة الصورة.');
    }
});

client.login(process.env.TOKEN);
