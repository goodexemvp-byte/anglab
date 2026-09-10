const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder() // زودنا علامة التساوي = هنا
        .setName('دخل')
        .setDescription('فك الحظر عن شخص مطرود وخليه يرجع السيرفر تاني (للموثوقين بس)')
        .addStringOption(option => 
            option.setName('ايدي_الشخص')
                  .setDescription('اكتب الـ ID بتاع الشخص اللي عايز تفك عنه الحظر')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
                  
    async execute(interaction) {
        const userId = interaction.options.getString('ايدي_الشخص');
        
        try {
            await interaction.guild.members.unban(userId);
            
            await interaction.reply(`🔓 يا أهلاً بالعودة! تم إلغاء الحظر وإدخال صاحب الآي دي **${userId}** السيرفر تاني. ما تحاولش تعيدها بقى! ✅`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'يا حزني، مش عارف أفك الحظر! تأكد إن الآي دي صح وإن الشخص ده محظور أصلاً.', ephemeral: true });
        }
    },
};