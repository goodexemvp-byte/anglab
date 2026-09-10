const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('بطئ')
        .setDescription('اظبط الوضع البطيء للشات بالثواني عشان الناس تهدى (للموثوقين بس)')
        .addIntegerOption(option => 
            option.setName('الثواني')
                  .setDescription('كام ثانية تأخير بين الرسالة والتانية؟ (اكتب 0 للإلغاء)')
                  .setMinValue(0)
                  .setMaxValue(21600) // أقصى حد في ديسكورد 6 ساعات
                  .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
                  
    async execute(interaction) {
        const seconds = interaction.options.getInteger('الثواني');
        const channel = interaction.channel;
        
        try {
            await channel.setRateLimitPerUser(seconds);
            
            if (seconds === 0) {
                await interaction.reply(`🚀 يا أهلاً بالحرية! تم إلغاء الوضع البطيء، الشات رجع يطير تاني.`);
            } else {
                await interaction.reply(`⏳ تم تفعيل الوضع البطيء وبقى فيه تأخير **${seconds}** ثانية بين كل رسالة والتانية. خلوا العقل زينة!`);
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'يا حزني، مش عارف أظبط الوضع البطيء (تأكد من صلاحيات البوت في الروم دي).', ephemeral: true });
        }
    },
};