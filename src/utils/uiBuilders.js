const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { getEmoji } = require('./emojiManager');

/**
 * Hyperion Components V2 DSL (Hybrid Implementation)
 * Provides the requested Container/Section abstraction while ensuring
 * broad compatibility across all production Discord environments.
 */

class TextDisplayBuilder {
    constructor() { this.content = ""; }
    setContent(content) { this.content = content; return this; }
    toJSON() { return this.content; }
}

class SectionBuilder {
    constructor() { this.parts = []; }
    addTextDisplayComponents(...components) {
        this.parts.push(...components.map(c => typeof c.toJSON === 'function' ? c.toJSON() : c));
        return this;
    }
    toJSON() { return this.parts.join('\n'); }
}

class SeparatorBuilder {
    constructor() { this.divider = false; }
    setDivider(val) { this.divider = val; return this; }
    setSpacing(val) { return this; }
    toJSON() { return this.divider ? "------------------------------" : ""; }
}

class ContainerBuilder {
    constructor() {
        this.embed = new EmbedBuilder();
        this.sections = [];
        this.actionRows = [];
        this.footerText = "Hyperion Protocol v2.4.1";
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

    setThumbnail(url) {
        if (url) this.embed.setThumbnail(url);
        return this;
    }

    addSectionComponents(...sections) {
        this.sections.push(...sections.map(s => s.toJSON()));
        return this;
    }

    addSeparatorComponents(...separators) {
        this.sections.push(...separators.map(s => s.toJSON()));
        return this;
    }

    addActionRowComponents(...rows) {
        this.actionRows.push(...rows);
        return this;
    }

    toJSON() {
        const mainContent = this.sections.filter(Boolean).join('\n');

        if (this.title) {
            this.embed.setAuthor({ name: this.title, iconURL: 'https://i.imgur.com/8Q3uX7U.png' });
        }

        this.embed.setDescription(mainContent);
        this.embed.setFooter({ text: this.footerText });
        this.embed.setTimestamp();

        const payload = { embeds: [this.embed.toJSON()] };
        if (this.actionRows.length > 0) {
            payload.components = this.actionRows.map(r => r.toJSON());
        }

        return payload;
    }
}

module.exports = {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,

    buildError: (message) => {
        return new ContainerBuilder()
            .setAccentColor(0xFF4444)
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${getEmoji('ERROR')} **Error:** ${message}`)
                    )
            );
    },

    buildSuccess: (title, message) => {
        return new ContainerBuilder()
            .setAccentColor(0x00C851)
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${getEmoji('SUCCESS')} **${title}**\n${message}`)
                    )
            );
    },

    buildInfo: (title, content, color = 0x6c63ff) => {
        return new ContainerBuilder()
            .setAccentColor(color)
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${getEmoji('INFO')} **${title}**\n\n${content}`)
                    )
            );
    }
};
