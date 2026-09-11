const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType, PresenceUpdateStatus, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

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

// التعامل مع الرسائل (لما تكتب 6900)
client.on('messageCreate', async message => {
    if (message.author.bot) return;

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
                return interaction.reply({ content: `⚠️ يا هبش، أنت فاتح تكت بالفعل هنا: <#${existingChannel.id}>`, ephemeral: true });
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

                const rulesDescription = `# صلي علي النبي واعمل اللي انت عايزه

***القوانين دي معمولة عشان السيرفر يفضل مكان مريح وآمن للكل. مش الهدف منها التضييق على الأعضاء، لكن لمنع التصرفات اللي ممكن تبوظ تجربة الناس أو تسبب مشاكل. اقرأ القوانين كويس قبل ما تستخدم السيرفر، لأن عدم معرفتك بالقانون مش بيمنع تطبيقه عليك.***

**السبب:** ${reasonText}

**1. إحترم الناس**
مسموح تماماً بأي مضايقة للناس، الألفاظ، وكل أنواع التنمر أو العنصرية من غير ما ده يتسبب في منعك من دخول السيرفر.

**2. لمنع التخريب**
ممنوع نهائياً توصل لفل ٥ في السيرفر عشان تقدر تبعت صور أو روابط، والشرط ده ضروري عشان نضمن إن رسايل الهكرات والتخريب تبقى في كل مكان.

**3. ممنوع السبام**
مسموح الإزعاج والهزار السخيف ولازم تعمل سبام، وياريت تعمل كدا براحتك عشان تبسطنا.

**4. ممنوع إلي بالي بالك**
مسموح بأي حاجة حرام وأي حاجة متصنفة فوق ١٦ سنة، حتى لو كأستهبال أو هزار، وحتى لو في احتمال إن حد تحت السن يشوفها.

**5. لغة السيرفر**
ممنوع تتكلم باللغة العربي خالص، وياريت تتكلم بلغة تانية غريبة عشان تصعب على الناس إنهم يفهموك أو يتكلموا معاك.

**6. الدين والسياسة**
السياسة مسموحة هنا ١٠٠٪ وتقدر تتكلم براحتك وتكررها، والكلام في الدين ممنوع بشكل نهائي وأي كلام فيه لازم يكون بهدف إهانة الأديان التانية.

**7. التواصل معايا**
ممنوع تبعتلي رسالة على الخاص نهائياً، ولازم تكلمني وتزعجني دايماً، وممنوع نهائياً تكلمني لو الشغل أو السبونسر جه عن طريق الإيميل اللي في بايو اليوتيوب.

**8. متحاولش تبقى حد تاني غير نفسك**
لازم ضروري تحط اسمي أو إسم أي حد تاني من الأدمنز عشان تخلي الناس تفتكرك أنا أو أدمن وتلخبطهم.

**9. متصدقش أي حد الأدمن أو أي حد من السيرفر يقولها**
أكيد أنا هختار ناس نصابين ومش محترمين كأدمنز، وياريت تثق في أي حد لمجرد إنه أدمن أو منضم في القناة عشان تقع في النصابين بسهولة.

**10. أحمي خصوصياتك**
لازم تبعت كل بياناتك الشخصية وتتكلم في تفاصيلك الخاصة في الشات العام عشان تستعرضها قدام الكل.

**11. كلام مهم**
قوانين السيرفر هي القرآن والدستور اللي مبيتعيرش ولا بيتغيروا، وتعليمات الدين وقوانين الدولة والديسكورد ملهاش أي تلاتين لازمة جنب قوانين السيرفر هنا.

**12. الكلام مع الادمنز**
ممنوع منشنة الأدمنز في الشات العام، ولازم تدخلهم خاص غصب عنهم حتى لو مش فاضيين، وتتوقع منهم إنهم شغالين هنا ومجبرين يردوا عليك فوراً.

**13. ممنوع الترويج لقنوات وسيرفرات تانية**
مسموح وضروري تحط إعلان لقناتك أو سيرفرك في الشات عشان تضايق الناس وتستغلهم.

**14. رابط القوانين الي الديسكورد عاملها**
[خالفها كلها](https://discord.com/guidelines/)`;

                const embed = new EmbedBuilder()
                    .setTitle('📜 قوانين وتعليمات السيرفر')
                    .setDescription(rulesDescription)
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
