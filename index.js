const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType, PresenceUpdateStatus } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    // هنا بنحدد حالة البوت الافتراضية تبقى هلال (Idle) من الأول
    presence: {
        status: PresenceUpdateStatus.Idle, // دي اللي بتعمل علامة الهلال (Idle)
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

    // لستة الحالة المتغيرة تحت الهلال
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
    }, 10000); // بتغير الكلام كل 10 ثواني وهلال البوت ثابت زي ما هو!

    // تسجيل الأوامر في ديسكورد (Slash Commands)
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

    // الدخول التلقائي لفويس معين أول ما البوت يشتغل
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

// نظام الترحيب البسيط والهادئ بدون صور أو إزعاج في الروم المطلوبة
client.on('guildMemberAdd', async member => {
    const targetChannelId = '1546177067752890509';
    const channel = member.guild.channels.cache.get(targetChannelId);
    if (!channel) return;

    await channel.send({
        content: `منور يا <@${member.id}> اقرا القوانين <#1546177057262674086>`,
        allowedMentions: { users: [] } // يمنع إزعاج العضو بالتنبيه
    });
});

client.login(process.env.TOKEN || token);
