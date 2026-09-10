const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('مسح')
        .setDescription('مسح رسائل شات معين أو رسائل عضو بحد أقصى 200 رسالة')
        .addIntegerOption(option =>
            option.setName('العدد')
                  .setDescription('كام رسالة عايز تمسح؟ (أقصى حاجة 200)')
                  .setMinValue(1)
                  .setMaxValue(200)
                  .setRequired(true))
        .addUserOption(option =>
            option.setName('العضو')
                  .setDescription('لو عايز تمسح رسائل شخص معين لوحده (اختياري)')
                  .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const count = interaction.options.getInteger('العدد');
        const targetUser = interaction.options.getUser('العضو');
        const channel = interaction.channel;

        await interaction.deferReply({ ephemeral: true });

        try {
            // جلب الرسائل من الشات
            let messages = await channel.messages.fetch({ limit: 100 });
            let messagesToDelete = [];

            if (targetUser) {
                // لو حدد عضو، هنفلتر رسائله بس بالعدد المطلوب
                let userMessages = messages.filter(m => m.author.id === targetUser.id);
                messagesToDelete = Array.from(userMessages.values()).slice(0, count);
            } else {
                // لو من غير عضو، هيمسح أي رسائل بالعدد المطلوب
                messagesToDelete = Array.from(messages.values()).slice(0, count);
            }

            if (messagesToDelete.length === 0) {
                return interaction.editReply('يا عم مفيش رسائل تنفع تتمسح بالمعايير دي!');
            }

            // تنفيذ مسح الرسائل
            await channel.bulkDelete(messagesToDelete, true);

            if (targetUser) {
                await interaction.editReply(`يا باشا، مسحت **${messagesToDelete.length}** رسالة للواد **${target.tag}** ونضفت وراه! 🧹✨`);
            } else {
                await interaction.editReply(`تم مسح **${messagesToDelete.length}** رسالة بنجاح، الشات بقى يلمع! ✨🗑️`);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply('حصلت مشكلة وأنا بمسح الرسائل (تأكد إن الرسائل مش أقدم من 14 يوم عشان ديسكورد بيعترض عليها).');
        }
    },
};