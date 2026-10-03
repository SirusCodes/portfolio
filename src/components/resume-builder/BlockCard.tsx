import type { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import type { ResumeBlock } from "../../lib/resume/types";
import { LineItem } from "./LineItem";

interface BlockCardProps {
	block: ResumeBlock;
	index: number;
	isFirst: boolean;
	isLast: boolean;
	onToggleBlock: (id: string) => void;
	onMoveBlockUp: (index: number) => void;
	onMoveBlockDown: (index: number) => void;
	onEditBlockMeta: (id: string, updates: Partial<ResumeBlock>) => void;
	onToggleLine: (blockId: string, lineId: string) => void;
	onEditLine: (blockId: string, lineId: string, newText: string) => void;
	onMoveLineUp: (blockId: string, lineIndex: number) => void;
	onMoveLineDown: (blockId: string, lineIndex: number) => void;
	onDeleteLine: (blockId: string, lineId: string) => void;
	onRevertLine: (blockId: string, lineId: string) => void;
	onAddLine: (blockId: string, text: string) => void;
	onDragStartBlock?: (index: number) => void;
	onDragOverBlock?: (e: DragEvent, index: number) => void;
	onDropBlock?: (index: number) => void;
}

export const BlockCard: FunctionalComponent<BlockCardProps> = ({
	block,
	index,
	isFirst,
	isLast,
	onToggleBlock,
	onMoveBlockUp,
	onMoveBlockDown,
	onEditBlockMeta,
	onToggleLine,
	onEditLine,
	onMoveLineUp,
	onMoveLineDown,
	onDeleteLine,
	onRevertLine,
	onAddLine,
	onDragStartBlock,
	onDragOverBlock,
	onDropBlock
}) => {
	const [isEditingMeta, setIsEditingMeta] = useState(false);
	const [isAddingLine, setIsAddingLine] = useState(false);
	const [newLineText, setNewLineText] = useState("");
	const [draggedLineIndex, setDraggedLineIndex] = useState<number | null>(null);

	// Meta edit state
	const [title, setTitle] = useState(block.title);
	const [subtitle, setSubtitle] = useState(block.subtitle ?? "");
	const [period, setPeriod] = useState(block.period ?? "");
	const [location, setLocation] = useState(block.location ?? "");

	const handleSaveMeta = () => {
		onEditBlockMeta(block.id, {
			title,
			subtitle: subtitle || undefined,
			period: period || undefined,
			location: location || undefined
		});
		setIsEditingMeta(false);
	};

	const handleAddLineSubmit = () => {
		const trimmed = newLineText.trim();
		if (trimmed) {
			onAddLine(block.id, trimmed);
			setNewLineText("");
			setIsAddingLine(false);
		}
	};

	const handleLineDragStart = (lineIdx: number) => {
		setDraggedLineIndex(lineIdx);
	};

	const handleLineDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	const handleLineDrop = (targetIdx: number) => {
		if (draggedLineIndex === null || draggedLineIndex === targetIdx) {
			setDraggedLineIndex(null);
			return;
		}

		// Reorder lines via move up/down
		if (draggedLineIndex < targetIdx) {
			for (let i = draggedLineIndex; i < targetIdx; i++) {
				onMoveLineDown(block.id, i);
			}
		} else {
			for (let i = draggedLineIndex; i > targetIdx; i--) {
				onMoveLineUp(block.id, i);
			}
		}
		setDraggedLineIndex(null);
	};

	const selectedLineCount = block.lines.filter((l) => l.selected).length;

	return (
		<div
			class={`rb-block ${block.selected ? "" : "unselected"}`}
			draggable={!isEditingMeta && !isAddingLine}
			onDragStart={() => onDragStartBlock?.(index)}
			onDragOver={(e) => onDragOverBlock?.(e as any, index)}
			onDrop={() => onDropBlock?.(index)}
		>
			<div class="rb-block-header">
				<div class="rb-block-info">
					<div class="rb-block-title-row">
						<input
							type="checkbox"
							class="rb-block-checkbox"
							checked={block.selected}
							onChange={() => onToggleBlock(block.id)}
							title={block.selected ? "Unselect this block" : "Select this block"}
						/>

						{isEditingMeta ? (
							<div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
								<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
									<input
										type="text"
										class="rb-line-edit-input"
										style={{ flex: 1, minHeight: "auto", padding: "6px 8px" }}
										placeholder="Title (e.g. UBS, Wingman)"
										value={title}
										onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
									/>
									<input
										type="text"
										class="rb-line-edit-input"
										style={{ flex: 1, minHeight: "auto", padding: "6px 8px" }}
										placeholder="Position / Subtitle"
										value={subtitle}
										onInput={(e) => setSubtitle((e.target as HTMLInputElement).value)}
									/>
								</div>
								<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
									<input
										type="text"
										class="rb-line-edit-input"
										style={{ flex: 1, minHeight: "auto", padding: "6px 8px" }}
										placeholder="Period (e.g. Feb 2026 – Present)"
										value={period}
										onInput={(e) => setPeriod((e.target as HTMLInputElement).value)}
									/>
									{block.location !== undefined && (
										<input
											type="text"
											class="rb-line-edit-input"
											style={{ flex: 1, minHeight: "auto", padding: "6px 8px" }}
											placeholder="Location (e.g. Pune, Remote)"
											value={location}
											onInput={(e) => setLocation((e.target as HTMLInputElement).value)}
										/>
									)}
								</div>
								<div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
									<button
										type="button"
										class="rb-btn rb-btn-sm rb-btn-ghost"
										onClick={() => setIsEditingMeta(false)}
									>
										Cancel
									</button>
									<button
										type="button"
										class="rb-btn rb-btn-sm rb-btn-primary"
										onClick={handleSaveMeta}
									>
										<i class="fas fa-check" /> Save Info
									</button>
								</div>
							</div>
						) : (
							<div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
								<span class="rb-block-title">{block.title}</span>
								{block.subtitle && (
									<span class="rb-block-subtitle">· {block.subtitle}</span>
								)}
							</div>
						)}
					</div>

					{!isEditingMeta && (
						<div class="rb-block-meta">
							{block.period && (
								<span>
									<i class="far fa-calendar-alt" style={{ marginRight: "4px" }} />
									{block.period}
								</span>
							)}
							{block.location && (
								<span>
									<i class="fas fa-map-marker-alt" style={{ marginRight: "4px" }} />
									{block.location}
								</span>
							)}
							{block.lines.length > 0 && (
								<span style={{ color: "#a0a0a0" }}>
									({selectedLineCount}/{block.lines.length} lines selected)
								</span>
							)}
						</div>
					)}

					{block.tags && block.tags.length > 0 && (
						<div class="rb-block-tags">
							{block.tags.map((tag) => (
								<span class="rb-tag" key={tag}>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				<div class="rb-block-controls">
					{!isEditingMeta && (
						<button
							type="button"
							class="rb-btn-icon"
							onClick={() => setIsEditingMeta(true)}
							title="Edit block heading & dates"
						>
							<i class="fas fa-pen" />
						</button>
					)}
					<button
						type="button"
						class="rb-btn-icon"
						disabled={isFirst}
						onClick={() => onMoveBlockUp(index)}
						title="Move block up"
					>
						<i class="fas fa-chevron-up" />
					</button>
					<button
						type="button"
						class="rb-btn-icon"
						disabled={isLast}
						onClick={() => onMoveBlockDown(index)}
						title="Move block down"
					>
						<i class="fas fa-chevron-down" />
					</button>
				</div>
			</div>

			{/* Bullet Lines List */}
			{block.lines.length > 0 && (
				<div class="rb-lines-container">
					{block.lines.map((line, lineIdx) => (
						<LineItem
							key={line.id}
							line={line}
							index={lineIdx}
							isFirst={lineIdx === 0}
							isLast={lineIdx === block.lines.length - 1}
							onToggle={(lineId) => onToggleLine(block.id, lineId)}
							onEdit={(lineId, text) => onEditLine(block.id, lineId, text)}
							onMoveUp={(lIdx) => onMoveLineUp(block.id, lIdx)}
							onMoveDown={(lIdx) => onMoveLineDown(block.id, lIdx)}
							onDelete={(lineId) => onDeleteLine(block.id, lineId)}
							onRevert={(lineId) => onRevertLine(block.id, lineId)}
							onDragStart={handleLineDragStart}
							onDragOver={handleLineDragOver}
							onDrop={handleLineDrop}
						/>
					))}
				</div>
			)}

			{/* Add Bullet Line Form */}
			{isAddingLine ? (
				<div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
					<textarea
						class="rb-line-edit-input"
						placeholder="Add new bullet point description (use **bold** for emphasis)..."
						value={newLineText}
						onInput={(e) => setNewLineText((e.target as HTMLTextAreaElement).value)}
						rows={2}
						autoFocus
					/>
					<div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
						<button
							type="button"
							class="rb-btn rb-btn-sm rb-btn-ghost"
							onClick={() => {
								setIsAddingLine(false);
								setNewLineText("");
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							class="rb-btn rb-btn-sm rb-btn-primary"
							onClick={handleAddLineSubmit}
						>
							<i class="fas fa-plus" /> Add Bullet
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					class="rb-add-line-btn"
					onClick={() => setIsAddingLine(true)}
				>
					<i class="fas fa-plus" /> Add bullet point
				</button>
			)}
		</div>
	);
};
