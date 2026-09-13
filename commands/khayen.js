const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('خاين')
        .setDescription('سحب الرتب الموثوقة وإعطاء رتبة العقوبة للعضو')
        .addUserOption(option =>
            option.setName('العضو')
                  .setDescription('العضو المراد معاقبته')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const targetMember = interaction.options.getMember('العضو');
        
        if (!targetMember) {
            return await interaction.reply({
                content: '❌ مش لقيت العضو ده في السيرفر!',
                ephemeral: true
            });
        }

        const rolesToRemove = [
            '1548652935968456705',
            '1546180583636471849',
            '1547561328753778718',
            '1547561634422325288'
        ];

        const traitorRoleId = '1547936949506154546';

        try {
            await targetMember.roles.remove(rolesToRemove);
            await targetMember.roles.add(traitorRoleId);

            await interaction.reply({
                content: `🚨 تم سحب الرتب وتصنيف العضو <@${targetMember.id}> بنجاح!`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ مش عارف أعدل الرتب، تأكد أن رتبة البوت فوق الرتب دي كلها ولديه صلاحية إدارة الرتب (Manage Roles).',
                ephemeral: true
            });
        }
    },
};
