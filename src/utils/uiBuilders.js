const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

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
    toJSON() { return this.divider ? "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" : ""; }
}

class ContainerBuilder {
    constructor() {
        this.embed = new EmbedBuilder();
        this.sections = [];
        this.actionRows = [];
    }

    setAccentColor(color) {
        const numericColor = typeof color === 'string' ? parseInt(color.replace('#', ''), 16) : color;
        this.embed.setColor(numericColor || 0x6c63ff);
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

    /**
     * Map the "V2" structure into a high-end Message Object
     */
    toJSON() {
        this.embed.setDescription(this.sections.filter(Boolean).join('\n'));
        
        return {
            embeds: [this.embed.toJSON()],
            components: this.actionRows.map(r => r.toJSON())
        };
    }
}

module.exports = {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,

    // High Level Defaults
    buildError: (message) => {
        return new ContainerBuilder()
            .setAccentColor(0xFF4444)
            .addSectionComponents(
                new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`❌ **Error:** ${message}`)
                )
            );
    },

    buildSuccess: (title, message) => {
        return new ContainerBuilder()
            .setAccentColor(0x00C851)
            .addSectionComponents(
                new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`✅ **${title}**\n${message}`)
                )
            );
    },

    buildInfo: (title, content, color = 0x6c63ff) => {
        return new ContainerBuilder()
            .setAccentColor(color)
            .addSectionComponents(
                new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`ℹ️ **${title}**\n\n${content}`)
                )
            );
    }
};
