const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

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

        // 1. دالة رسم الأفاتار
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

        // 2. رسم الأفاتارات في مراكزها الدقيقة
        await drawAvatar(userList[0], 525, 250, 230); // الوسط
        await drawAvatar(userList[1], 180, 330, 190); // اليسار
        await drawAvatar(userList[2], 910, 330, 190); // اليمين

        // 3. رسم الأسماء في مكانها الصحيح تحت الـ Total Points
        ctx.fillStyle = '#000000'; // لون أسود للوضوح
        ctx.font = 'bold 35px Arial';
        ctx.textAlign = 'center';
        
        // الإحداثيات هنا موزونة بالملي لتكون تحت Total Points
        ctx.fillText(userList[0].username, 640, 520); // اسم المركز 1
        ctx.fillText(userList[1].username, 275, 560); // اسم المركز 2
        ctx.fillText(userList[2].username, 1005, 560); // اسم المركز 3

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ files: [attachment] });

    } catch (err) {
        console.error('Error processing image:', err);
        message.reply('⚠️ حدث خطأ أثناء معالجة الصورة.');
    }
});

client.login(process.env.TOKEN);
