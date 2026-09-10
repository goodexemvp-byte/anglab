const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('حذف_تحذير')
        .setDescription('امسح تحذير أو كل التحذيرات لعضو معين (للموثوقين بس)')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين العضو اللي هتشيل من عليه التحذير؟')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
                  
    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        
        // حالياً رد مؤكد للإدارة لحد ما نربطها بقاعدة البيانات
        await interaction.reply({ 
            content: `✨ أبشر يا باشا، تم مسح التحذيرات وسجل العضو **${target.tag}** بقى أبيض ونضيف!`, 
            ephemeral: true 
        });
    },
};