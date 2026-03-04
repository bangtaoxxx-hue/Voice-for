const { Client, GatewayIntentBits } = require('discord.js');
const { 
  joinVoiceChannel, 
  entersState, 
  VoiceConnectionStatus 
} = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let connection;

async function connectToChannel(channel) {
  try {
    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    console.log("กำลังเชื่อมต่อ...");

    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log("เชื่อมต่อสำเร็จ ✅");

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log("หลุดจากห้อง กำลังเข้าใหม่...");
      try {
        await entersState(connection, VoiceConnectionStatus.Connecting, 5_000);
      } catch {
        connection.destroy();
        reconnect(channel);
      }
    });

  } catch (err) {
    console.log("เชื่อมต่อไม่สำเร็จ ลองใหม่ใน 5 วิ");
    setTimeout(() => reconnect(channel), 5000);
  }
}

function reconnect(channel) {
  setTimeout(() => {
    connectToChannel(channel);
  }, 5000);
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const channel = await client.channels.fetch(process.env.VOICE_CHANNEL_ID);
  if (!channel) return console.log("หา voice ไม่เจอ");

  connectToChannel(channel);
});

client.login(process.env.TOKEN);
