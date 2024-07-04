import {
	Notice,
	Plugin,
	FuzzySuggestModal
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

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('waves', 'View notes in the past', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new NoteEntriesSuggestionsModal(this.app).open();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Did you read notes on this day, already?');
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

interface SlimFile {
	path: string;
	name: string;
}


/**
 * Will show entries based on config
 */
export class NoteEntriesSuggestionsModal extends FuzzySuggestModal<SlimFile> {
	// constructor(app: App) {
	// 	super(app);
	// }
	// Returns all available suggestions.
	getItems(): SlimFile[] {
		const fmp = this.app.vault.fileMap;
		return getFilesOnThisDay(fmp)
			.map(key => fmp[key])
	}

	getItemText(slimFile: SlimFile) {
		return `${slimFile.name} | (${slimFile.path})`;
	}

	// Perform action on the selected suggestion.
	onChooseItem(slimFile: SlimFile, evt: MouseEvent | KeyboardEvent) {
		// TODO, pick from different messages in the future
		new Notice(`Good choice. Happy reflecting. Enable me to choose random messages in the future`);
		this.app.workspace.activeLeaf.openFile(this.app.vault.fileMap[slimFile.path]);
	}
}
