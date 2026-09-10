const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ادي')
        .setDescription('ادي رتبة (للعضو) من رتب السيرفر (للموثوقين بس)')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين العضو اللي هياخد الرتبة؟')
                  .setRequired(true))
        .addRoleOption(option => 
            option.setName('الرتبة')
                  .setDescription('إيه هي الرتبة اللي هدهاله؟')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
                  
    async execute(interaction) {
        const target = interaction.options.getMember('الشخص');
        const role = interaction.options.getRole('Rank') || interaction.options.getRole('الرتبة');
        
        try {
            await target.roles.add(role);
            await interaction.reply(`✨ تمام يا باشا، الواد **${target.user.tag}** خد رتبة **${role.name}** ومبقاش قليلة! 🎖️`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'حصلت مشكلة، تأكد إن رتبة البوت أعلى من الرتبة اللي عايز يديها وصلاحياته تمام.', ephemeral: true });
        }
    },
};