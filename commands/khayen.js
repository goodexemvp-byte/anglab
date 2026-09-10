const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('خاين')
        .setDescription('تصنيف عضو بعدم الثقة وإعطائه رتبة العقوبة')
        .addUserOption(option =>
            option.setName('العضو')
                .setDescription('العضو المراد تصنيفه')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // للمشرفين فقط

    async execute(interaction) {
        const targetMember = interaction.options.getMember('العضو');
        
        // حط هنا آي دي رتبة "عدم الثقة" أو الخائن بتاعتك
        const traitorRoleId = 'حط_آي_دي_الرتبة_هنا';

        try {
            await targetMember.roles.add(traitorRoleId);
            await interaction.reply({
                content: `🚨 تم تصنيف العضو <@${targetMember.id}> في قائمة عدم الثقة بنجاح!`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ مش عارف أدي الرتبة، تأكد أن رتبة البوت فوق رتبة العقوبة وأن لديه الصلاحيات.',
                ephemeral: true
            });
        }
    },
};