const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('وثق')
        .setDescription('توثيق الأعضاء ومنحهم رتب المستويات المختلفة')
        .addUserOption(option =>
            option.setName('العضو')
                .setDescription('العضو المراد توثيقه')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('اللفل')
                .setDescription('اختر مستوى التوثيق (1، 2، أو 3)')
                .setRequired(true)
                .addChoices(
                    { name: 'اللفل الأول', value: 1 },
                    { name: 'اللفل الثاني', value: 2 },
                    { name: 'اللفل الثالث', value: 3 }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // صلاحية إدارة الرتب للمشرفين فقط

    async execute(interaction) {
        const targetMember = interaction.options.getMember('العضو');
        const level = interaction.options.getInteger('اللفل');

        // أفريدج آي دي الرتب لكل لفل طلبته
        const roles = {
            1: '1547561328753778718',
            2: '1547561634422325288',
            3: '1546180583636471849'
        };

        const roleId = roles[level];

        try {
            // إعطاء الرتبة للعضو
            await targetMember.roles.add(roleId);
            await interaction.reply({
                content: `✅ تم توثيق العضو <@${targetMember.id}> بنجاح وإعطائه **اللفل ${level}**!`,
                ephemeral: false // تظهر للجميع أنك وثقته
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ حصل مشكلة، تأكد أن رتبة البوت أعلى من الرتبة المراد إعطاؤها وأن لديه صلاحيات كافية.',
                ephemeral: true
            });
        }
    },
};