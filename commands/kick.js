const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('برا')
        .setDescription('طرد العضو من السيرفر مؤقتاً.. يلا بررررا!')
        .addUserOption(option => 
            option.setName('الشخص')
                  .setDescription('مين العضو اللي هيطير برة؟')
                  .setRequired(true))
        .addStringOption(option => 
            option.setName('السبب')
                  .setDescription('ليه هتمشيه؟')
                  .setRequired(false)),
                  
    async execute(interaction) {
        const target = interaction.options.getUser('الشخص');
        const reason = interaction.options.getString('السبب') || 'مفيش سبب، بس برا وخلاص!';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        
        if (!member) {
            return interaction.reply({ content: 'يا عم الشخص ده مش موجود أصلاً في السيرفر!', ephemeral: true });
        }
        
        try {
            await member.kick(reason);
            await interaction.reply(`تم طرد **${target.tag}** برة السيرفر بالسلامة! ✈️💨\nالسبب: ${reason}`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'يا حزني، الواد ده مقطوع من شجرة وصلاحياته منعتني أطرده!', ephemeral: true });
        }
    },
};
