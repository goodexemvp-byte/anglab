const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('قول')
        .setDescription('خلّي البوت ينطق باللي تقوله في الروم (للموثوقين بس')
        .addStringOption(option => 
            option.setName('الكلام')
                  .setDescription('إيه الكلام اللي عايز البوت يقوله؟')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
                  
    async execute(interaction) {
        const text = interaction.options.getString('الكلام');
        
        // مسح الرد المؤقت أو الرد بمسح رسالة الأمر ونشر الكلام مباشرة
        await interaction.reply({ content: 'تم النطق يا باشا!', ephemeral: true });
        await interaction.channel.send(text);
    },
};