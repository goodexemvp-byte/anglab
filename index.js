const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType, PresenceUpdateStatus } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// قراءة الإعدادات سواء من متغيرات البيئة (Railway) أو من ملف config.json محلياً
let config = {};
try {
    config = require('./config.json');
} catch (error) {
    // لو ملف config.json مش موجود (على الاستضافة)، هيعتمد على متغيرات البيئة
}

const token = process.env.TOKEN || config.token;
const clientId = process.env.CLIENT_ID || config.clientId;
const guildId = process.env.GUILD_ID || config.guildId;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    presence: {
        status: PresenceUpdateStatus.Idle,
    }
});

client.commands = new Collection();
const commands = [];
const foldersPath = path.join(__dirname, 'commands');

if (fs.existsSync(foldersPath)) {
    const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(foldersPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }
}

client.once('ready', async () => {
    console.log(`🚀 البوت اشتغل تمام وزي الفل باسم: ${client.user.tag}`);

    const statuses = [
        { name: 'البعلاوي بيكره متابعينه', type: ActivityType.Playing },
        { name: 'البعلاوي هيفضل مكروه عندنا', type: ActivityType.Watching },
        { name: 'اندومي الشجق احسن طعم', type: ActivityType.Playing }
    ];

    let i = 0;
    setInterval(() => {
        if (i >= statuses.length) i = 0;
        client.user.setActivity(statuses[i].name, { type: statuses[i].type });
        i++;
    }, 10000);

    const rest = new REST({ version: '10' }).setToken(token);
    try {
        console.log('🔄 جاري تسجيل الأوامر...');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('✅ تم تسجيل الأوامر بنجاح!');
    } catch (error) {
        console.error(error);
    }

    const voiceChannelId = '1546181392524771360';
    const channel = client.channels.cache.get(voiceChannelId);
    
    if (channel) {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        console.log(`🔊 البوت نزل الفويس في روم: ${channel.name}`);
    } else {
        console.log('⚠️ مش لقيت روم الفويس، اتأكد من الـ ID يا باشا.');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'حصل بلوة وأنا بنفذ الأمر ده!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'حصل بلوة وأنا بنفذ الأمر ده!', ephemeral: true });
        }
    }
});

client.on('guildMemberAdd', async member => {
    const targetChannelId = '1546177067752890509';
    const channel = member.guild.channels.cache.get(targetChannelId);
    if (!channel) return;

    await channel.send({
        content: `منور يا <@${member.id}> اقرا القوانين <#1546177057262674086>`,
        allowedMentions: { users: [] }
    });
});

client.login(token);
