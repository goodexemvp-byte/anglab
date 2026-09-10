const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('خذ')
        .setDescription('اسحب رتبة من العضو (للموثوقين بس)')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين العضو اللي هنسحب منه الرتبة؟')
                  .setRequired(true))
        .addRoleOption(option => 
            option.setName('الرتبة')
                  .setDescription('إيه هي الرتبة اللي هنسحبها منه؟')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
                  
    async execute(interaction) {
        const target = interaction.options.getMember('الشخص');
        const role = interaction.options.getRole('الرتبة');
        
        try {
            await target.roles.remove(role);
            await interaction.reply(`✂️ تم سحب رتبة **${role.name}** من الواد **${target.user.tag}** بنجاح! رجع لحجمه الطبيعي.`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'مش عارف أسحب الرتبة، تأكد من صلاحيات البوت!', ephemeral: true });
        }
    },
};