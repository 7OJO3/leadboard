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

        async function drawUser(user, x, y, size) {
            console.log(`رسم المستخدم: ${user.username}`); // لنتأكد من الـ Console
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            // رسم الاسم
            ctx.fillStyle = '#ffffff'; 
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.font = 'bold 35px sans-serif'; 
            ctx.textAlign = 'center';
            
            // التأكد من الرسم
            ctx.strokeText(user.username, x + size / 2, y + size + 75);
            ctx.fillText(user.username, x + size / 2, y + size + 75);
        }

        // الإحداثيات المضبوطة للقالب الأصلي (X, Y, Size)
        await drawUser(userList[0], 525, 230, 230); // الوسط
        await drawUser(userList[1], 155, 335, 190); // اليسار
        await drawUser(userList[2], 935, 335, 190); // اليمين

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ files: [attachment] });

    } catch (err) {
        console.error(err);
        message.reply('حدث خطأ في الرسم.');
    }
});

client.login(process.env.TOKEN);
