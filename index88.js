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

        async function drawAvatar(user, x, y, size) {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();
        }

        // رسم الأفاتارات (القيم تم مطابقتها بدقة مع صورتك)
        await drawAvatar(userList[0], 525, 250, 230); // الوسط
        await drawAvatar(userList[1], 180, 330, 190); // اليسار
        await drawAvatar(userList[2], 910, 330, 190); // اليمين

        // رسم الـ username فقط (بالإنجليزي)
        ctx.fillStyle = '#4a3c2c'; 
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        
        // إحداثيات النص لتكون تحت Total Points مباشرة
        ctx.fillText(userList[0].username, 640, 530); 
        ctx.fillText(userList[1].username, 275, 570); 
        ctx.fillText(userList[2].username, 1005, 570);

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ files: [attachment] });
    } catch (err) {
        console.error(err);
        message.reply('حدث خطأ أثناء الرسم.');
    }
});

client.login(process.env.TOKEN);
