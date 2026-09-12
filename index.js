const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType, PresenceUpdateStatus, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const TARGET_AI_CHANNEL = '1548278323350737037';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let config = {};
try {
    config = require('./config.json');
} catch (error) {}

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
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
    } catch (error) {
        console.error(error);
    }

    const voiceChannelId = '1546181392524771360';
    try {
        const channel = await client.channels.fetch(voiceChannelId);
        if (channel) {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            console.log(`🔊 البوت نزل الفويس في روم: ${channel.name}`);
        }
    } catch (e) {
        console.log('⚠️ مش لقيت روم الفويس، تأكد من الـ ID.');
    }
});

async function askGemini(promptText) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "أنت بوت عصبي ودمك حامي، بتكره شخص اسمه البعلاوي كره عمى، وأي حد هيجيب سيرته أو يطبل له هتهدده بالبند والطرش فوراً. اتكلم دائماً باللهجة المصرية البلدية وبأسلوب حاد وقوي.\n\nالسؤال أو الرسالة: " + promptText }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Gemini API Error Details:", data.error);
            return " روح قل gemini شوف: " + data.error.message;
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.log("Unexpected API Response Structure:", JSON.stringify(data));
            return "يا عم دماغنا فاصلة ومش عارف أرد!";
        }
    } catch (err) {
        console.error("Gemini Fetch Error:", err);
        return "حصلت مشكلة في الاتصال يا غالي.";
    }
}
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // 1. نظام الـ AI في الروم المحددة
    if (message.channel.id === TARGET_AI_CHANNEL) {
        try {
            await message.channel.sendTyping();
            const replyText = await askGemini(message.content);
            await message.reply(replyText);
        } catch (error) {
            console.error('خطأ في الـ AI:', error);
            await message.reply('يا عم دماغنا فاصلة دلوقتي ومش هعرف أرد!');
        }
        return; 
    }

    // 2. أمر إنشاء التكتات لما تكتب 6900
    if (message.content === '6900') {
        const targetChannelId = '1546177087222710362'; 

        try {
            const targetChannel = await message.guild.channels.fetch(targetChannelId);

            if (!targetChannel) {
                return message.reply('⚠️ مش لقيت روم التكتات خالص، تأكد من الـ ID يا غالي.');
            }

            const embed = new EmbedBuilder()
                .setTitle('🎫 نظام تكتات السيرفر')
                .setDescription('لو عندك مشكلة، عايز تاخد ثقة، أو عندك بلاغ..\nاضغط على الزرار المناسب تحت وابدأ تكت جديد وسيب الباقي علينا.')
                .setColor(0x00AE86)
                .setFooter({ text: 'صلي على النبي واعمل اللي أنت عايزه' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_trust')
                    .setLabel('اخذ ثقة')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🛡️'),
                new ButtonBuilder()
                    .setCustomId('ticket_report')
                    .setLabel('إبلاغ عن انقلاب ضد السيرفر')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🚨')
            );

            await targetChannel.send({ embeds: [embed], components: [row] });
            
            try {
                await message.delete();
            } catch (e) {}

        } catch (error) {
            console.error(error);
            return message.reply('❌ حصل خطأ أثناء البحث عن الروم، تأكد أن البوت يمتلك صلاحيات كافية.');
        }
    }
});

// معالجة الأوامر والأزرار
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
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
        return;
    }

    if (interaction.isButton()) {
        const { customId, guild, member, channel } = interaction;

        if (customId === 'ticket_trust' || customId === 'ticket_report') {
            const existingChannel = guild.channels.cache.find(c => c.name === `ticket-${member.user.username.toLowerCase()}`);
            if (existingChannel) {
                return interaction.reply({ content: `⚠️ يا حبيبي أنت فاتح تكت بالفعل هنا: <#${existingChannel.id}>`, ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            try {
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${member.user.username}`,
                    type: 0, 
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: ['ViewChannel'],
                        },
                        {
                            id: member.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                        },
                        {
                            id: client.user.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                        },
                    ],
                });

                const reasonText = customId === 'ticket_trust' ? '🛡️ طلب أخذ ثقة' : '🚨 إبلاغ عن انقلاب ضد السيرفر';

                const embed = new EmbedBuilder()
                    .setTitle('🎫 تكت جديد')
                    .setDescription(`# صلي علي النبي واعمل اللي انت عايزه\n\n**السبب:** ${reasonText}\n\nأهلاً بيك يا بطل، الإدارة هتتابع معاك في أقرب وقت.`)
                    .setColor(0xF1C40F);

                const ticketRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('claim_ticket')
                        .setLabel('استلام التكت')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🙋‍♂️'),
                    new ButtonBuilder()
                        .setCustomId('delete_ticket')
                        .setLabel('حذف التكت')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🗑️')
                );

                await ticketChannel.send({
                    content: `منور يا <@${member.id}>، الموثوقين هيكونو معاك قريب.`,
                    embeds: [embed],
                    components: [ticketRow]
                });

                await interaction.editReply({ content: `✅ اتفتحلك تكت يا غالي: <#${ticketChannel.id}>` });

            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: '❌ حصلت مشكلة وأنا بفتح التكت.' });
            }
        }

        if (customId === 'claim_ticket') {
            const oldEmbed = interaction.message.embeds[0];
            const updatedEmbed = EmbedBuilder.from(oldEmbed)
                .addFields({ name: '👤 تم الاستلام بواسطة', value: `<@${member.id}>`, inline: false });

            await interaction.update({
                embeds: [updatedEmbed],
                components: interaction.message.components
            });

            await channel.send({ content: `✅ البطل <@${member.id}> استلم التكت وهيتتابع معاك!` });
        }

        if (customId === 'delete_ticket') {
            await interaction.reply({ content: '🗑️ جاري حذف التكت نهائياً خلال 3 ثواني...' });
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (e) {}
            }, 3000);
        }
    }
});

client.on('guildMemberAdd', async member => {
    const targetChannelId = '1546177067752890509';
    try {
        const channel = await member.guild.channels.fetch(targetChannelId);
        if (channel) {
            await channel.send({
                content: `منور يا <@${member.id}> اقرا القوانين <#1546177057262674086>`,
                allowedMentions: { users: [] }
            });
        }
    } catch (e) {}
});

client.login(token);
