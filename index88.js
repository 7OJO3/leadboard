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

        // دالة الأفاتار
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

        // رسم الأفاتارات (موزونة بناءً على الصورة الأخيرة)
        await drawAvatar(userList[0], 525, 250, 230); // المركز 1
        await drawAvatar(userList[1], 180, 330, 190); // المركز 2
        await drawAvatar(userList[2], 910, 330, 190); // المركز 3

        // رسم الأسماء (الخطوة الحاسمة)
        ctx.fillStyle = '#4a3c2c'; // لون بني غامق
        ctx.font = 'bold 35px Arial';
        ctx.textAlign = 'center';
        
        // إحداثيات النص بالضبط تحت كلمة Total Points
        ctx.fillText(userList[0].username, 640, 520);  
        ctx.fillText(userList[1].username, 275, 560);  
        ctx.fillText(userList[2].username, 1005, 560); 

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ files: [attachment] });
    } catch (err) {
        console.error("Error in drawing:", err);
        message.reply('حدث خطأ أثناء الرسم.');
    }
});

client.login(process.env.TOKEN);
