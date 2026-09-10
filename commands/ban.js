const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('زيت')
        .setDescription('ايوه زي ما سمعت، زيت الواد ده واديله حظر نهائي من السيرفر!')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين العضو اللي هيتزيت؟')
                  .setRequired(true))
        .addStringOption(option => 
            option.setName('المدة_أو_السبب')
                  .setDescription('اكتب السبب أو المدة يا باشا')
                  .setRequired(false)),
                  
    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        const reason = interaction.options.getString('المدة_أو_السبب') || 'مفيش سبب، بس إحنا الانقلاب!';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        
        if (!member) {
            return interaction.reply({ content: 'يا عم الشخص ده مش موجود أصلاً في السيرفر!', ephemeral: true });
        }
        
        try {
            await member.ban({ reason: reason });
            await interaction.reply(`خلاص يا باشا، **${target.tag}** اتقلب واتزيت بره السيرفر! 🛢️🔥\nالسبب: ${reason}`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'معلش، الواد ده صعت ومش قادر أزيتة (صلاحياته أعلى أو البوت محتاج صلاحية Ban).', ephemeral: true });
        }
    },
};