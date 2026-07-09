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
        // حجم الكانفاس يجب أن يطابق أبعاد صورتك (سنفرض 1280x800 كمثال)
        const canvas = createCanvas(1280, 800); 
        const ctx = canvas.getContext('2d');

        const background = await loadImage('./template.png');
        ctx.drawImage(background, 0, 0, 1280, 800);

        // دالة الرسم (تم ضبط الإحداثيات والأحجام الجديدة هنا)
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

            // رسم الاسم (تم تغيير اللون للوضوح)
            ctx.fillStyle = '#4a3c2c'; // لون بني غامق ليناسب ألوان الكؤوس
            ctx.font = 'bold 35px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(user.username, x + size / 2, y + size + 75);
        }

        // 1. المركز (الذهبي): X=525, Y=250, الحجم=230
        await drawUser(userList[0], 525, 250, 230); 
        
        // 2. اليسار (الفضي): X=180, Y=330, الحجم=190
        await drawUser(userList[1], 180, 330, 190); 
        
        // 3. اليمين (البرونزي): X=910, Y=330, الحجم=190
        await drawUser(userList[2], 910, 330, 190);

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ 
            content: '🏆 **قائمة التوب المحدثة والموزونة:**', 
            files: [attachment] 
        });

    } catch (err) {
        console.error('Error processing image:', err);
        message.reply('⚠️ حدث خطأ أثناء معالجة الصورة.');
    }
});

client.login(process.env.TOKEN);
