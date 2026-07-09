const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!top')) return;

    const users = message.mentions.users;
    if (users.size < 3) return message.reply('❌');

    const userList = Array.from(users.values());

    try {
        const canvas = createCanvas(1280, 800); 
        const ctx = canvas.getContext('2d');

        const background = await loadImage('./template.png');
        ctx.drawImage(background, 0, 0, 1280, 800);

        async function drawUser(user, x, y, size) {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();
        }

        // الإحداثيات النهائية بعد التدقيق:
        // 1. الوسط (الذهبي): 525, 250, حجم 230
        await drawUser(userList[0], 525, 250, 230); 
        
        // 2. الفضي: زدت الـ X قليلاً للليمين، وزدت الـ Y قليلاً للأسفل
        await drawUser(userList[1], 155, 335, 190); 
        
        // 3. البرونزي: نقصت الـ X قليلاً لليسار، وزدت الـ Y قليلاً للأسفل
        await drawUser(userList[2], 895, 335, 190);

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ files: [attachment] });

    } catch (err) {
        console.error(err);
    }
});

client.login(process.env.TOKEN);
