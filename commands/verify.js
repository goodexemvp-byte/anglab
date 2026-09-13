const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const LEVEL_ROLES = {
    1: '1547561328753778718',
    2: '1547561634422325288',
    3: '1546180583636471849'
};

const PENALTY_ROLES = [
    '1547936949506154546',
    '1548652935968456705'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('وثق')
        .setDescription('توثيق العضو ومنحه رتبة المستوى المحددة')
        .addUserOption(option =>
            option.setName('العضو')
                  .setDescription('العضو المراد توثيقه')
                  .setRequired(true))
        .addIntegerOption(option =>
            option.setName('اللفل')
                  .setDescription('اختر مستوى التوثيق المطلوبة')
                  .setRequired(true)
                  .addChoices(
                      { name: '1', value: 1 },
                      { name: '2', value: 2 },
                      { name: '3', value: 3 }
                  ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const targetMember = interaction.options.getMember('العضو');
        const level = interaction.options.getInteger('اللفل');

        if (!targetMember) {
            return interaction.reply({
                content: 'العضو غير موجود في السيرفر.',
                ephemeral: true
            });
        }

        try {
            await targetMember.roles.remove(PENALTY_ROLES);
            await targetMember.roles.add(LEVEL_ROLES[level]);

            return interaction.reply({
                content: `تم توثيق العضو <@${targetMember.id}> بنجاح ومنحه المستوى ${level}.`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: 'حدث خطأ أثناء تعديل رتب العضو. تأكد من صلاحيات البوت وترتيب الرتب.',
                ephemeral: true
            });
        }
    }
};
