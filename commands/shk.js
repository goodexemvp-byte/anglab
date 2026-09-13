const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const TARGET_ROLE_ID = '1548652935968456705';

const ROLES_TO_REMOVE = [
    '1546180583636471849',
    '1546180827631587369',
    '1547561634422325288',
    '1547936949506154546',
    '1546180715886940341'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('شك')
        .setDescription('تطبيق إجراء الشك على العضو وتعديل رتبه')
        .addUserOption(option =>
            option.setName('العضو')
                  .setDescription('العضو المراد تطبيق الإجراء عليه')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const targetMember = interaction.options.getMember('العضو');

        if (!targetMember) {
            return interaction.reply({
                content: 'العضو غير موجود في السيرفر.',
                ephemeral: true
            });
        }

        try {
            await targetMember.roles.remove(ROLES_TO_REMOVE);
            await targetMember.roles.add(TARGET_ROLE_ID);

            return interaction.reply({
                content: `تم تطبيق إجراء الشك على العضو <@${targetMember.id}> بنجاح.`,
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
