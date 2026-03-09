const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { getEmoji } = require('./emojiManager');

class TextDisplayBuilder {
    constructor() { this.content = ''; }
    setContent(content) { this.content = content; return this; }
    toJSON() { return this.content; }
}

class SectionBuilder {
    constructor() { this.parts = []; }
    addTextDisplayComponents(...components) {
        this.parts.push(...components.map((component) => (typeof component.toJSON === 'function' ? component.toJSON() : component)));
        return this;
    }
    toJSON() { return this.parts.join('\n'); }
}

class SeparatorBuilder {
    constructor() { this.divider = false; }
    setDivider(value) { this.divider = value; return this; }
    setSpacing() { return this; }
    toJSON() { return this.divider ? '────────────────────────' : ''; }
}

class ContainerBuilder {
    constructor() {
        this.embed = new EmbedBuilder();
        this.sections = [];
        this.actionRows = [];
        this.footerText = 'HYPERION QUIZ';
    }

    setAccentColor(color) {
        const numericColor = typeof color === 'string' ? parseInt(color.replace('#', ''), 16) : color;
        this.embed.setColor(numericColor || 0x6c63ff);
        return this;
    }

    setTitle(title) {
        this.title = title;
        return this;
    }

    setFooterText(text) {
        this.footerText = text;
        return this;
    }

    setThumbnail(url) {
        if (url) this.embed.setThumbnail(url);
        return this;
    }

    addSectionComponents(...sections) {
        this.sections.push(...sections.map((section) => section.toJSON()));
        return this;
    }

    addSeparatorComponents(...separators) {
        this.sections.push(...separators.map((separator) => separator.toJSON()));
        return this;
    }

    addActionRowComponents(...rows) {
        this.actionRows.push(...rows);
        return this;
    }

    toJSON() {
        const description = this.sections.filter(Boolean).join('\n');

        if (this.title) {
            this.embed.setAuthor({ name: this.title, iconURL: 'https://i.imgur.com/8Q3uX7U.png' });
        }

        this.embed.setDescription(description);
        this.embed.setFooter({ text: this.footerText });
        this.embed.setTimestamp();

        const payload = { embeds: [this.embed.toJSON()] };
        if (this.actionRows.length > 0) {
            payload.components = this.actionRows.map((row) => row.toJSON());
        }

        return payload;
    }
}

function buildPanel({ icon, title, lines = [], accentColor, thumbnail }) {
    const container = new ContainerBuilder()
        .setAccentColor(accentColor)
        .setTitle('Quiz Meister');

    if (thumbnail) {
        container.setThumbnail(thumbnail);
    }

    const header = `${icon} **${title}**`;
    const body = lines.filter(Boolean).join('\n');

    container
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(header))
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(body))
        );

    return container;
}

module.exports = {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    buildPanel,

    buildError: (message) =>
        buildPanel({
            icon: getEmoji('ERROR'),
            title: 'ERROR',
            lines: [message],
            accentColor: 0xff4444
        }),

    buildSuccess: (title, message) =>
        buildPanel({
            icon: getEmoji('SUCCESS'),
            title,
            lines: [message],
            accentColor: 0x00c851
        }),

    buildInfo: (title, content, color = 0x6c63ff) =>
        buildPanel({
            icon: getEmoji('INFO'),
            title,
            lines: [content],
            accentColor: color
        })
};
