const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('فك')
        .setDescription('فك القفل عن الروم وتسمح للموثوقين بالكتابة تاني')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
                  
    async execute(interaction) {
        const channel = interaction.channel;
        
        try {
            // بنسمح لرتبة @everyone أو الأعضاء يكتبوا تاني
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null // بيرجعها للوضع الافتراضي (مفتوح)
            });
            
            await interaction.reply({ content: '🔓 يا رجالة، الروم اتفكت وبقت منفتحة للجميع! محدش يشاكس بقى.' });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'يا حزني، مش عارف أفصل القفل عن الروم! تأكد إن معايا صلاحيات كفاية.', ephemeral: true });
        }
    },
};