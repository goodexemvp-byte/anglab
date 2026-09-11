const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType, PresenceUpdateStatus, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

// معالجة الأوامر العادية (Slash Commands)
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

    // معالجة أزرار التكتات (فتح، استلام، وحذف)
    if (interaction.isButton()) {
        const { customId, guild, member, channel } = interaction;

        // 1. فتح تكت جديد عند الضغط على أزرار روم التكتات الأساسي
        if (customId === 'ticket_trust' || customId === 'ticket_report') {
            const existingChannel = guild.channels.cache.find(c => c.name === `ticket-${member.user.username.toLowerCase()}`);
            if (existingChannel) {
                return interaction.reply({ content: `⚠️ يا هبش، أنت فاتح تكت بالفعل هنا: <#${existingChannel.id}>`, ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            try {
                // الـ ID الجديد اللي طلبته لتنظيم التكتات (سواء كان Category أو روم)
                const parentId = '1546177087222710362';

                const ticketChannel = await guild.channels.create({
                    name: `ticket-${member.user.username}`,
                    type: 0, // GuildText
                    parent: parentId, // ربط التكت بالـ ID الجديد
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
                    .setTitle('📜 قوانين وتعليمات التكت')
                    .setDescription('# صلي علي النبي واعمل اللي انت عايزه\n\nأهلاً بيك يا بطل في تكت الخاص بك.\n\n**السبب:** ' + reasonText + '\n\n**قوانين التكت:**\n1. ممنوع الإزعاج أو الهزار السخيف عشان محدش يتقرش.\n2. اكتب مشكلتك أو طلبك باختصار ووضوح.\n3. الإدارة هتدخل معاك في أقرب وقت ممكن.')
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
                    content: `منور يا <@${member.id}>، الإدارة هتكون معاك قريب.`,
                    embeds: [embed],
                    components: [ticketRow]
                });

                await interaction.editReply({ content: `✅ اتفتحلك تكت يا غالي: <#${ticketChannel.id}>` });

            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: '❌ حصلت مشكلة وأنا بفتح التكت، تأكد أن الـ ID صحيح.' });
            }
        }

        // 2. زرار استلام التكت (Claim)
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

        // 3. زرار حذف التكت (Delete)
        if (customId === 'delete_ticket') {
            await interaction.reply({ content: '🗑️ جاري حذف التكت نهائياً خلال 3 ثواني...' });
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (e) {
                    console.error(e);
                }
            }, 3000);
        }
    }
});

// الترحيب بالأعضاء الجدد
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
