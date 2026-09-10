const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('تحذير')
        .setDescription('ادي تحذير لعضو مع حماية الإدارة والرتب الأكبر (للموثوقين بس)')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين الواد اللي عايز تحذره؟')
                  .setRequired(true))
        .addStringOption(option => 
            option.setName('السبب')
                  .setDescription('إيه سبب التحذير ده؟')
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
                  
    async execute(interaction) {
        const targetUser = interaction.options.getUser('الشخص');
        const reason = interaction.options.getString('السبب');
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        // 1. التأكد إن العضو موجود في السيرفر
        if (!member) {
            return interaction.reply({ content: 'يا عم الشخص ده مش موجود أصلاً في السيرفر!', ephemeral: true });
        }

        // 2. منع العضو من تحذير نفسه
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({ content: 'يا ذكي! عايز تحذر نفسك ليه؟ مفيش تحذير لنفسك!', ephemeral: true });
        }

        // 3. منع تحذير صاحب البوت أو أدمن أقدم رتبة منه (باستثناء الأونر لو حابب)
        const executor = interaction.member;
        
        // لو الشخص المستهدف رتبته أعلى من الشخص اللي بيحاول يحذره أو تساويه
        if (targetUser.id !== interaction.guild.ownerId && member.roles.highest.position >= executor.roles.highest.position && interaction.guild.ownerId !== executor.id) {
            return interaction.reply({ content: 'يا حزني فين وفين! هتحذر واحد رتبته قدك أو أعلى منك؟ العب بعيد ياض!', ephemeral: true });
        }

        // لو كل الحراسات عدت تمام، ينفذ التحذير
        await interaction.reply({ 
            content: `⚠️ تم إعطاء تحذير للواد **${targetUser.tag}** بنجاح!\nالسبب: ${reason}` 
        });
    },
};