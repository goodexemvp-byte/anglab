const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('تحذيرات')
        .setDescription('شوف العضو ده واخد كام تحذير (للموثوقين بس)')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين العضو اللي عايز تكشف سجله؟')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
                  
    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        
        // دي خطوة مبدئية، قدام لو ربطناها بقاعدة بيانات (Database) هنجيب العدد الحقيقي
        // حالياً هنرد برد مرتب للإدارة
        await interaction.reply({ 
            content: `🔍 سجل الواد **${target.tag}**: التحذيرات بتاعت والأمور ماشية إزاي (جاهز للربط بقاعدة البيانات يا باشا).`, 
            ephemeral: true 
        });
    },
};