const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('فك_الميوت')
        .setDescription('فك الكتم (Timeout) عن العضو ورجوعه يتكلم تاني (للموثوقين بس)')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين الواد اللي هتفك عنه الكتم؟')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
                  
    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        
        if (!member) {
            return interaction.reply({ content: 'يا عم الشخص ده مش موجود أصلاً في السيرفر!', ephemeral: true });
        }
        
        try {
            // إلغاء التايم أوت عن طريق إرسال null للـ timeout
            await member.timeout(null, 'تم العفو عنه من قِبل الانقلاب');
            
            await interaction.reply(`🔊 يا أهلاً بالمعارك! تم فك الميوت عن الواد **${target.tag}**، خليه يعقل بقى وما يجيبش لنفسه الكلام. ✅`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'حصلت مشكلة وأنا بفك الميوت عن الواد ده.', ephemeral: true });
        }
    },
};