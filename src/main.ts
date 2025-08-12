import { Plugin, WorkspaceLeaf } from 'obsidian';
import { AttachmentAnalyzeView, VIEW_TYPE_ATTACHMENT_ANALYZE } from 'view/attachment_analyze_view';

interface AttachmentAnalyzerPluginSettings { }

const DEFAULT_SETTINGS: AttachmentAnalyzerPluginSettings = { }

export default class MyPlugin extends Plugin {
	settings: AttachmentAnalyzerPluginSettings;

	async onload() {
		await this.loadSettings();
		this.registerView(
			VIEW_TYPE_ATTACHMENT_ANALYZE,
			(leaf) => new AttachmentAnalyzeView(leaf)
		);

		this.addRibbonIcon('dice', 'Activate attachment analyze view', () => {
			this.activateView();
		});

	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_ATTACHMENT_ANALYZE);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeaf("window");
			await leaf!.setViewState({ type: VIEW_TYPE_ATTACHMENT_ANALYZE, active: true });
		}
		workspace.revealLeaf(leaf!);
	}
}