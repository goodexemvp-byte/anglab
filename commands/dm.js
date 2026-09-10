const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('خاص')
        .setDescription('ابعث رسالة لعضو على الخاص مباشرة (للموثوقين بس)')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين العضو اللي هتبعتله على الخاص؟')
                  .setRequired(true))
        .addStringOption(option => 
            option.setName('الرسالة')
                  .setDescription('اكتب الكلام اللي هيبعتله')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
                  
    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        const messageText = interaction.options.getString('الرسالة');
        
        try {
            await target.send(messageText);
            await interaction.reply({ content: `📨 يا معلم، الرسالة اتحدفت في خاص الواد **${target.tag}** بنجاح!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'يا حزني، مش عارف ابعت للواد ده على الخاص (ممكن يكون قافل الرسائل الخاصة أصلاً).', ephemeral: true });
        }
    },
};