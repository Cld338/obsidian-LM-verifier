import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Replace with your Gemini API endpoint URL
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface MyPluginSettings {
  apiKey: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  apiKey: 'AIzaSyAGEY83Z2woKZV7l3lHiwwYL0YBDPhp7bE',
};

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    // Add a command to trigger sending note to Gemini
    this.addCommand({
      id: 'send-note-to-gemini',
      name: 'Send Note to Gemini',
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        const noteContent = editor.getValue();

        // Check if API key is set
        if (!this.settings.apiKey) {
          new Notice('Please set your Gemini API key in settings.');
          return;
        }

        try {
          const response = await this.sendToGemini(noteContent);
          new Notice(`Gemini Response: ${response}`);
        } catch (error) {
          console.error('Error sending note to Gemini:', error);
          new Notice('Error sending note to Gemini. Check console for details.');
        }
      },
    });

    // Add settings tab for API key
    this.addSettingTab(new MySettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async sendToGemini(noteContent: string) {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Authorization: `Bearer ${this.settings.apiKey}`,
      },
      body: noteContent,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.text();
  }
}

class MySettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Gemini API Key')
      .setDesc('Required for sending notes to Gemini')
      .addText(text => text
        .setPlaceholder('Enter your Gemini API Key')
        .setValue(this.plugin.settings.apiKey)
        .onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        }));
  }
}
