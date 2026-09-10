const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('قفل')
        .setDescription('قفل القناة الحالية عشان محدش يكتب فيها (للموثوقين بس)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
                  
    async execute(interaction) {
        const channel = interaction.channel;
        
        try {
            // منع رتبة الـ Everyone من إرسال الرسائل في القناة
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
            
            await interaction.reply(`🔒 يا رجالة، تم قفل الشات ده! ابقوا قابلوني لو حد عرف يكتب حرف تاني هنا. 🛑`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'يا حزني، مش عارف اقفل الشات ده (تأكد إن صلاحيات البوت مظبوطة).', ephemeral: true });
        }
    },
};