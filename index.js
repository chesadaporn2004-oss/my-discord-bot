const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const WELCOME_CHANNEL_ID = '1522961160075219189';

client.on('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
    console.log(`👤 JOIN: ${member.user.tag}`);

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) {
        console.log("❌ ไม่เจอห้องต้อนรับ");
        return;
    }

    try {
        console.log("🎨 START CREATE GIF");

        const width = 700;
        const height = 250;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        const encoder = new GIFEncoder(width, height);
        encoder.setRepeat(0);
        encoder.setDelay(120);
        encoder.setQuality(10);
        encoder.start();

        const avatar = await loadImage(
            member.user.displayAvatarURL({ extension: 'png', size: 256 })
        );

        const bgPath = path.join(__dirname, 'assets', 'welcome_bg.gif');

        console.log("📁 Loading background:", bgPath);

        const background = await loadImage(bgPath);

        for (let i = 0; i < 10; i++) {
            ctx.clearRect(0, 0, width, height);

            ctx.drawImage(background, 0, 0, width, height);

            ctx.save();
            ctx.beginPath();
            ctx.arc(110, 125, 75, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, 35, 50, 150, 150);
            ctx.restore();

            ctx.beginPath();
            ctx.arc(110, 125, 75, 0, Math.PI * 2);
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#fff";
            ctx.stroke();

            ctx.fillStyle = "#fff";
            ctx.font = "bold 32px Sans";
            ctx.fillText("Welcome to this server,", 220, 90);

            ctx.fillStyle = i % 2 ? "#FFD700" : "#FFFFFF";
            ctx.font = "24px Sans";
            ctx.fillText(member.user.username, 220, 150);

            ctx.fillStyle = "#AAAAAA";
            ctx.font = "20px Sans";
            ctx.fillText(`Members: ${member.guild.memberCount}`, 220, 200);

            encoder.addFrame(ctx);
        }

        encoder.finish();

        const buffer = encoder.out.getData();

        console.log("📦 GIF CREATED SIZE:", buffer.length);

        const attachment = new AttachmentBuilder(buffer, {
            name: "welcome.gif"
        });

        await channel.send({
            content: `🎉 ยินดีต้อนรับ ${member}`,
            files: [attachment]
        });

        console.log("✅ SENT SUCCESS");

    } catch (err) {
        console.error("❌ ERROR OCCURED:");
        console.error(err);

        await channel.send({
            content: `🎉 ยินดีต้อนรับ ${member} (แต่ GIF พัง)`
        });
    }
});

client.login(process.env.TOKEN);