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

            ctx.fillStyle = '#4a3c2c'; 
            ctx.font = 'bold 35px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(user.username, x + size / 2, y + size + 75);
        }

        // 1. المركز (الذهبي): كما هو
        await drawUser(userList[0], 525, 250, 230); 
        
        // 2. اليسار (الفضي): (تحريك يسار 140، أعلى 290)
        await drawUser(userList[1], 140, 290, 190); 
        
        // 3. اليمين (البرونزي): (تحريك يمين 950، أعلى 290)
        await drawUser(userList[2], 950, 290, 190);

        const buffer = await canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
        
        await message.reply({ files: [attachment] });

    } catch (err) {
        console.error(err);
    }
});

client.login(process.env.TOKEN);
