const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('خاص')
        .setDescription('ابعث رسالة أو ملف لعضو على الخاص مباشرة (للموثوقين بس)')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين العضو اللي هتبعتله على الخاص؟')
                  .setRequired(true))
        .addStringOption(option => 
            option.setName('الرسالة')
                  .setDescription('اكتب الكلام اللي هتبعتله (اختياري لو هترفع ملف)')
                  .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('الملف')
                  .setDescription('ارفع ملف أو صورة لإرسالها على الخاص (اختياري)')
                  .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
                  
    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        const messageText = interaction.options.getString('الرسالة');
        const attachment = interaction.options.getAttachment('الملف');

        // التأكد من أن المستخدم كتب رسالة أو مرفق ملف على الأقل
        if (!messageText && !attachment) {
            return await interaction.reply({ 
                content: '⚠️ لازم تكتب رسالة أو ترفق ملف واحد على الأقل عشان أبعته!', 
                ephemeral: true 
            });
        }

        const sendOptions = {
            content: messageText || undefined,
            files: attachment ? [attachment.url] : []
        };
        
        try {
            await target.send(sendOptions);
            await interaction.reply({ content: `📨 يا معلم، الرسالة أو الملف اتبعت لخاص العضو **${target.tag}** بنجاح!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'يا حزني، مش عارف ابعت للواد ده على الخاص (ممكن يكون قافل الرسائل الخاصة أو البلاكات مانعاه).', ephemeral: true });
        }
    },
};
