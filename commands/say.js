const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('قول')
        .setDescription('خلّي البوت ينطق باللي تقوله مع إمكانية إرفاق ملف أو الرد على رسالة')
        .addStringOption(option => 
            option.setName('الكلام')
                  .setDescription('إيه الكلام اللي عايز البوت يقوله؟')
                  .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('الملف')
                  .setDescription('ارفع ملف أو صورة (اختياري)')
                  .setRequired(false))
        .addStringOption(option =>
            option.setName('reply_id')
                  .setDescription('آي دي الرسالة اللي عايز البوت يرد عليها (اختياري)')
                  .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
                  
    async execute(interaction) {
        const text = interaction.options.getString('الكلام');
        const attachment = interaction.options.getAttachment('الملف');
        const replyId = interaction.options.getString('reply_id');

        await interaction.reply({ content: 'تم النطق يا باشا!', ephemeral: true });

        const sendOptions = {
            content: text,
            files: attachment ? [attachment.url] : []
        };

        // لو كاتب آي دي رسالة، البوت هيعمل رد (Reply) عليها، وإلا هيبعت رسالة عادية في الروم
        if (replyId) {
            try {
                const targetMessage = await interaction.channel.messages.fetch(replyId);
                await targetMessage.reply(sendOptions);
            } catch (error) {
                // لو الـ ID غلط أو الرسالة مش في نفس الروم، هيبعت الرسالة عادية عشان البوت ما يكراشش
                await interaction.channel.send(sendOptions);
            }
        } else {
            await interaction.channel.send(sendOptions);
        }
    },
};
