const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('خاين')
        .setDescription('سحب الرتب الموثوقة وإعطاء رتبة العقوبة للعضو')
        .addUserOption(option =>
            option.setName('العضو')
                  .setDescription('العضو المراد معاقبته')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // للمشرفين فقط

    async execute(interaction) {
        const targetMember = interaction.options.getMember('العضو');
        
        if (!targetMember) {
            return await interaction.reply({
                content: '❌ مش لقيت العضو ده في السيرفر!',
                ephemeral: true
            });
        }

        // الرتب اللي هيتسحب منه (لو معاه أي واحدة فيهم أو كلهم)
        const rolesToRemove = [
            '1546180583636471849',
            '1547561328753778718',
            '1547561634422325288'
        ];

        // رتبة العقوبة (الخائن) اللي هتتضاف ليه
        const traitorRoleId = '1547936949506154546';

        try {
            // سحب الرتب القديمة اللي عنده من اللستة
            await targetMember.roles.remove(rolesToRemove);

            // إعطاؤه رتبة العقوبة
            await targetMember.roles.add(traitorRoleId);

            await interaction.reply({
                content: `🚨 تم سحب الرتب الموثوقة وتصنيف العضو <@${targetMember.id}> في قائمة الخونة بنجاح!`,
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
