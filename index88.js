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
        const canvas = createCanvas(1280, 800); 
        const ctx = canvas.getContext('2d');

        const background = await loadImage('./template.png');
        ctx.drawImage(background, 0, 0, 1280, 800);

        // دالة محسنة لرسم المستخدم مع معالجة الاسم
        async function drawUser(user, x, y, size) {
            // نضمن أن الاسم نص، وإذا لم يوجد نستخدم "Unknown"
            const name = user.username || "Unknown";
            
            // تحميل الأفاتار
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            // رسم الاسم
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 25px Arial';
            ctx.textAlign = 'center';
            // نستخدم String() للتأكد أن القيمة نصية دائماً
            ctx.fillText(String(name), x + size / 2, y + size + 40);
        }

        // استدعاء الدالة بدون تمرير الاسم (الدالة ستستخرجه بنفسها من كائن المستخدم)
        await drawUser(userList[0], 520, 200, 240); 
        await drawUser(userList[1], 150, 280, 200); 
        await drawUser(userList[2], 890, 280, 200);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'leaderboard.png' });
        message.channel.send({ files: [attachment] });

    } catch (err) {
        console.error(err);
        message.reply('حدث خطأ أثناء معالجة الصورة.');
    }
});

client.login(process.env.TOKEN);
