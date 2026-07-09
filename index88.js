const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!top')) return;

    const args = message.content.split(' ').slice(1);
    const users = message.mentions.users;

    if (users.size < 3) return message.reply('❌ يجب عليك منشن 3 أشخاص!');

    const userList = Array.from(users.values());

    try {
        // 1. إعداد الكانفاس (استخدم نفس أبعاد صورتك الأصلية)
        const canvas = createCanvas(1280, 800); 
        const ctx = canvas.getContext('2d');

        // 2. تحميل الخلفية
        const background = await loadImage('./template.png');
        ctx.drawImage(background, 0, 0, 1280, 800);

        // دالة لرسم الافتار مع قص دائري
        async function drawUser(user, x, y, size, name) {
            // رسم الافتار
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            // رسم الاسم
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 25px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(name, x + size / 2, y + size + 40);
        }

        // 3. ترتيب المراكز (عدل الإحداثيات هنا بناءً على صورتك)
        // [المركز 1 - الوسط]، [المركز 2 - اليسار]، [المركز 3 - اليمين]
        await drawUser(userList[0], 520, 200, 240, userList[0].username); 
        await drawUser(userList[1], 150, 280, 200, userList[1].username); 
        await drawUser(userList[2], 890, 280, 200, userList[2].username);

        // 4. الإرسال
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'leaderboard.png' });
        message.channel.send({ files: [attachment] });

    } catch (err) {
        console.error(err);
        message.reply('حدث خطأ أثناء معالجة الصورة.');
    }
});

client.login(process.env.TOKEN);
