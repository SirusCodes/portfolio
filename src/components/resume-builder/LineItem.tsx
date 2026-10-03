import type { FunctionalComponent } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import type { ResumeLine } from "../../lib/resume/types";

interface LineItemProps {
	line: ResumeLine;
	index: number;
	isFirst: boolean;
	isLast: boolean;
	onToggle: (id: string) => void;
	onEdit: (id: string, newText: string) => void;
	onMoveUp: (index: number) => void;
	onMoveDown: (index: number) => void;
	onDelete: (id: string) => void;
	onRevert: (id: string) => void;
	onDragStart?: (index: number) => void;
	onDragOver?: (e: DragEvent, index: number) => void;
	onDrop?: (index: number) => void;
}

export const LineItem: FunctionalComponent<LineItemProps> = ({
	line,
	index,
	isFirst,
	isLast,
	onToggle,
	onEdit,
	onMoveUp,
	onMoveDown,
	onDelete,
	onRevert,
	onDragStart,
	onDragOver,
	onDrop
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(line.text);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		setEditText(line.text);
	}, [line.text]);

	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.focus();
			textareaRef.current.selectionStart = textareaRef.current.value.length;
			textareaRef.current.selectionEnd = textareaRef.current.value.length;
		}
	}, [isEditing]);

	const handleSave = () => {
		const trimmed = editText.trim();
		if (trimmed) {
			onEdit(line.id, trimmed);
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditText(line.text);
		setIsEditing(false);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			handleSave();
		} else if (e.key === "Escape") {
			e.preventDefault();
			handleCancel();
		}
	};

	// Simple helper to render **bold** syntax visually
	const renderFormattedText = (raw: string) => {
		const parts = raw.split(/(\*\*.*?\*\*)/g);
		return parts.map((part, i) => {
			if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
				return <strong key={i}>{part.slice(2, -2)}</strong>;
			}
			return part;
		});
	};

	const isModified = line.text !== line.originalText;

	return (
		<div
			class={`rb-line-item ${line.selected ? "" : "unselected"}`}
			draggable={!isEditing}
			onDragStart={() => onDragStart?.(index)}
			onDragOver={(e) => onDragOver?.(e as any, index)}
			onDrop={() => onDrop?.(index)}
		>
			<input
				type="checkbox"
				class="rb-line-checkbox"
				checked={line.selected}
				onChange={() => onToggle(line.id)}
				title={line.selected ? "Unselect this bullet" : "Select this bullet"}
			/>

			{isEditing ? (
				<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
					<textarea
						ref={textareaRef}
						class="rb-line-edit-input"
						value={editText}
						onInput={(e) => setEditText((e.target as HTMLTextAreaElement).value)}
						onKeyDown={handleKeyDown as any}
						rows={2}
					/>
					<div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
						<button
							type="button"
							class="rb-btn rb-btn-sm rb-btn-ghost"
							onClick={handleCancel}
						>
							Cancel
						</button>
						<button
							type="button"
							class="rb-btn rb-btn-sm rb-btn-primary"
							onClick={handleSave}
						>
							<i class="fas fa-check" /> Save
						</button>
					</div>
				</div>
			) : (
				<div
					class="rb-line-content"
					onClick={() => setIsEditing(true)}
					title="Click to edit line"
				>
					{renderFormattedText(line.text)}
					{isModified && (
						<span
							style={{
								marginLeft: "8px",
								fontSize: "0.7rem",
								color: "#88d3ff",
								background: "rgba(136, 211, 255, 0.1)",
								padding: "1px 6px",
								borderRadius: "4px"
							}}
						>
							edited
						</span>
					)}
				</div>
			)}

			{!isEditing && (
				<div class="rb-line-controls">
					<button
						type="button"
						class="rb-btn-icon rb-btn-xs"
						onClick={() => setIsEditing(true)}
						title="Edit line"
					>
						<i class="fas fa-pencil-alt" />
					</button>

					{isModified && (
						<button
							type="button"
							class="rb-btn-icon rb-btn-xs"
							onClick={() => onRevert(line.id)}
							title="Revert to original text"
						>
							<i class="fas fa-undo" />
						</button>
					)}

					<button
						type="button"
						class="rb-btn-icon rb-btn-xs"
						disabled={isFirst}
						onClick={() => onMoveUp(index)}
						title="Move up"
					>
						<i class="fas fa-arrow-up" />
					</button>

					<button
						type="button"
						class="rb-btn-icon rb-btn-xs"
						disabled={isLast}
						onClick={() => onMoveDown(index)}
						title="Move down"
					>
						<i class="fas fa-arrow-down" />
					</button>

					<button
						type="button"
						class="rb-btn-icon rb-btn-xs"
						onClick={() => onDelete(line.id)}
						title="Delete line"
						style={{ color: "#ff8888" }}
					>
						<i class="fas fa-trash-alt" />
					</button>
				</div>
			)}
		</div>
	);
};
