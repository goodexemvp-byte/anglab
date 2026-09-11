const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('وثق')
        .setDescription('توثيق الواد ومنحه لفل التوثيق')
        .addUserOption(option =>
            option.setName('العضو')
                  .setDescription('مين الواد اللي عايز توثقه؟')
                  .setRequired(true))
        .addIntegerOption(option =>
            option.setName('اللفل')
                  .setDescription('اكتب رقم اللفل (1، 2، أو 3)')
                  .setRequired(true)
                  .addChoices(
                      { name: '1', value: 1 },
                      { name: '2', value: 2 },
                      { name: '3', value: 3 }
                  ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // للمشرفين والناس الثقيلة بس

    async execute(interaction) {
        const targetMember = interaction.options.getMember('العضو');
        const level = interaction.options.getInteger('اللفل');

        if (!targetMember) {
            return await interaction.reply({
                content: '❌ يا باشا الواد ده مش موجود معانا في السيرفر أصلاً!',
                ephemeral: true
            });
        }

        // رتب المستويات حسب الاختيار
        const roles = {
            1: '1547561328753778718',
            2: '1547561634422325288',
            3: '1546180583636471849'
        };

        const roleId = roles[level];
        
        // رتبة الخيانة اللي هتتشال منه لو واخدها
        const traitorRoleId = '1547936949506154546';

        try {
            // لو معاه رتبة الخيانة، نشيلهاله الأول
            if (targetMember.roles.cache.has(traitorRoleId)) {
                await targetMember.roles.remove(traitorRoleId);
            }

            // نديله رتبة اللفل الجديد
            await targetMember.roles.add(roleId);

            await interaction.reply({
                content: `✅ يا عم مبروك! تم توثيق الواد <@${targetMember.id}> ولبسناه **اللفل ${level}**!`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ يا حزني! مش عارف أعدل الرتب، اتأكد إن رتبة البوت فوق الرتب دي كلها وإن معاه صلاحية إدارة الرتب (Manage Roles).',
                ephemeral: true
            });
        }
    },
};
