const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ميوت')
        .setDescription('اعمل كتم (Timeout) للعضو عشان يقعد على جنب (للموثوقين بس)')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين الواد اللي عايز تكتمه؟')
                  .setRequired(true))
        .addIntegerOption(option => 
            option.setName('الدقائق')
                  .setDescription('كام دقيقة هيفضل قاعد ساكت؟')
                  .setRequired(true))
        .addStringOption(option => 
            option.setName('السبب')
                  .setDescription('ليه واخد الكتم ده؟')
                  .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
                  
    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        const minutes = interaction.options.getInteger('الدقائق');
        const reason = interaction.options.getString('السبب') || 'مفيش سبب، بس إحنا الانقلاب!';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        
        if (!member) {
            return interaction.reply({ content: 'يا عم الشخص ده مش موجود أصلاً في السيرفر!', ephemeral: true });
        }
        
        try {
            const durationMs = minutes * 60 * 1000;
            await member.timeout(durationMs, reason);
            
            await interaction.reply(`🔇 تم كتم الواد **${target.tag}** لمدة **${minutes}** دقيقة! خليه يشرب من طين الشات وهو ساكت. 🤐\nالسبب: ${reason}`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'معلش، الواد ده صعت وصلاحياته أعلى مني ومش عارف أعمله ميوت!', ephemeral: true });
        }
    },
};