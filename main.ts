import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	SuggestModal
} from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}
const getFilesOnThisDay = (fileMap: {}) => {
	return Object.keys(fileMap).filter((key) => {
		const now = new Date();
		const prepadmonth = now.getMonth() + 1;
		const month = prepadmonth < 10 ? "0" + prepadmonth : prepadmonth;
		const day = now.getDate();
		const regex = new RegExp("20\\d\\d" + month + day + "\.md");
		return regex.test(key);
	});
}


export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	// How to bring from a module?
	// async averageFileLength(): Promise<number> {
	// 	const { vault } = this.app;
	//
	// 	const fileContents: string[] = await Promise.all(
	// 		vault.getMarkdownFiles().map((file) => vault.cachedRead(file))
	// 	);
	//
	// 	let totalLength = 0;
	// 	fileContents.forEach((content) => {
	// 		totalLength += content.length;
	// 	});
	//
	// 	return totalLength / fileContents.length;
	// }

	async onload() {
		await this.loadSettings();
		// this.addRibbonIcon("info", "Calculate average file length", async () => {
		// 	const fileLength = await this.averageFileLength();
		// 	new Notice(`The average file length is ${fileLength} characters.`);
		// });

		this.addRibbonIcon("atom", "Open on this day", async () => {
			// new Notice("Clicked!");
			const { vault } = this.app;
			const filesOnThisDay = getFilesOnThisDay(vault.fileMap)
			// assumes one file only
			if(filesOnThisDay.length === 1) {
				this.app.workspace.activeLeaf.openFile(vault.fileMap[filesOnThisDay[0]]);
			}
			new Notice(JSON.stringify(filesOnThisDay));
		});

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
			new OnThisDaySuggestions(this.app).open();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
interface Book {
	title: string;
	author: string;
}

const ALL_BOOKS = [
	{
		title: "How to Take Smart Notes",
		author: "Sönke Ahrens",
	},
	{
		title: "Thinking, Fast and Slow",
		author: "Daniel Kahneman",
	},
	{
		title: "Deep Work",
		author: "Cal Newport",
	},
];

export class OnThisDaySuggestions extends SuggestModal<Book> {
	// Returns all available suggestions.
	getSuggestions(query: string): Book[] {
		return ALL_BOOKS.filter((book) =>
			book.title.toLowerCase().includes(query.toLowerCase())
		);
	}

	// Renders each suggestion item.
	renderSuggestion(book: Book, el: HTMLElement) {
		el.createEl("div", { text: book.title });
		el.createEl("small", { text: book.author });
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(book: Book, evt: MouseEvent | KeyboardEvent) {
		new Notice(`Selected ${book.title}`);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
