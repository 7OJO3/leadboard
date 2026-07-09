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

        async function drawUser(user, x, y, size) {
            const name = user.username || "Unknown";
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, size, size);
            ctx.restore();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 25px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(String(name), x + size / 2, y + size + 40);
        }

        // الإحداثيات المعدلة لتناسب دوائر التصميم:
        // المركز 1 (الوسط): x=525, y=240, size=230
        await drawUser(userList[0], 525, 240, 230); 
        
        // المركز 2 (اليسار): x=175, y=325, size=190
        await drawUser(userList[1], 175, 325, 190); 
        
        // المركز 3 (اليمين): x=895, y=325, size=190
        await drawUser(userList[2], 895, 325, 190);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'leaderboard.png' });
        message.channel.send({ files: [attachment] });

    } catch (err) {
        console.error(err);
        message.reply('حدث خطأ أثناء معالجة الصورة.');
    }
});

client.login(process.env.TOKEN);
