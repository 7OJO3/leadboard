const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!top')) return;

    const users = message.mentions.users;
    if (users.size < 3) return message.reply('❌ يرجى منشن 3 أشخاص!');

    const userList = Array.from(users.values());

    try {
        await message.channel.sendTyping();
        const canvas = createCanvas(1280, 800); 
        const ctx = canvas.getContext('2d');

        const background = await loadImage('./template.png');
        ctx.drawImage(background, 0, 0, 1280, 800);

        async function drawAvatar(user, x, y, r) {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x - r, y - r, r * 2, r * 2);
            ctx.restore();
        }

        // الرسم بناءً على طلبك بالترتيب:
        // 1. المنشن الأول -> الذهبية (الوسط)
        await drawAvatar(userList[0], 500, 425, 115);
        // 2. المنشن الثاني -> الفضية (اليسار)
        await drawAvatar(userList[1], 165, 425, 115);
        // 3. المنشن الثالث -> البرونزية (اليمين)
        await drawAvatar(userList[2], 835, 425, 115);

        // رسم الأسماء تحت كل دائرة
        ctx.fillStyle = '#ffffff'; 
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.font = 'bold 35px Arial';
        ctx.textAlign = 'center';

        // إحداثيات النصوص تحت الدوائر
        ctx.strokeText(userList[0].username, 500, 600); // الأول
        ctx.fillText(userList[0].username, 500, 600);

        ctx.strokeText(userList[1].username, 165, 600); // الثاني
        ctx.fillText(userList[1].username, 165, 600);

        ctx.strokeText(userList[2].username, 835, 600); // الثالث
        ctx.fillText(userList[2].username, 835, 600);

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ files: [attachment] });
    } catch (err) {
        console.error(err);
        message.reply('حدث خطأ أثناء المعالجة.');
    }
});

client.login(process.env.TOKEN);
