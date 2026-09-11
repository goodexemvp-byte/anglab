const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('إرسال رسالة نظام التكتات في الروم المخصص')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // لأصحاب الصلاحيات بس
    async execute(interaction) {
        const targetChannelId = '1546177087222710362';
        const targetChannel = interaction.guild.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            return interaction.reply({ content: '⚠️ مش لقيت روم التكتات المبرمج، اتأكد من الـ ID يا باشا.', ephemeral: true });
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
        await interaction.reply({ content: `✅ تم إرسال رسالة التكتات بنجاح في الروم <#${targetChannelId}>!`, ephemeral: true });
    },
};
