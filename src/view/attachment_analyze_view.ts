import { App, ItemView, WorkspaceLeaf } from "obsidian";
import * as echarts from 'echarts';

export const VIEW_TYPE_ATTACHMENT_ANALYZE = 'attachment-analyzer-view';

export class AttachmentAnalyzeView extends ItemView {
    private _chart: echarts.ECharts | null = null
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_ATTACHMENT_ANALYZE;
    }

    getDisplayText() {
        return 'Attactment Analyze';
    }

    onResize(): void {
        this._chart?.resize({
            width: this.contentEl.clientWidth,
            height: this.contentEl.clientHeight
        })
    }

    private async fetchData(app: App): Promise<Array<any>> {
        const data = new Array<any>()
        const resolvedLinks = app.metadataCache.resolvedLinks
        for (const notePath in resolvedLinks) {
            const linkRecords = resolvedLinks[notePath]
            const noteEntry = {
                "name": notePath,
                "path": notePath,
                "children": new Array<any>()
            }
            data.push(noteEntry)
            for (const link in linkRecords) {
                if (resolvedLinks[link] !== undefined) continue // exclude note link
                const stats = await app.vault.adapter.stat(link)
                noteEntry.children.push({
                    "name": link.substring(link.lastIndexOf("/") + 1),
                    "path": link,
                    "value": Math.round((stats?.size ?? 0) / 1024)
                })
            }
        }
        return data
    }

    async onOpen() {
        const container = this.contentEl;
        container.empty();
        const chartContainer = container.createDiv();
        const chart = echarts.init(chartContainer);
        this._chart = chart
        chart.showLoading()
        const data = await this.fetchData(this.app)
        chart.hideLoading()
        chart.setOption({
            title: {
                text: 'Attachments',
                left: 'center'
            },
            tooltip: {
                formatter: function (info: any) {
                    const value = info.value;
                    const path = info.data.path
                    const treePathInfo = info.treePathInfo as Array<{ name: string }>;
                    const treePath = treePathInfo.slice(1).map(node => node.name).join('/');
                    return `
                        <div class="tooltip-title">${treePath}</div>
                        Disk Usage: ${value} KB<br>
                        Path: ${path}
                    `;
                }
            },
            series: [{
                name: 'Notes',
                type: 'treemap',
                visibleMin: 300,
                upperLabel: {
                    show: true,
                    height: 30
                },
                label: {
                    show: true,
                    formatter: '{b}'
                },
                itemStyle: {
                    borderColor: '#fff'
                },
                levels: [
                    {
                        itemStyle: {
                            borderWidth: 0,
                            gapWidth: 2
                        }
                    }
                ],
                data: data
            }]
        });
    }

    async onClose() {
        this._chart = null
    }
}