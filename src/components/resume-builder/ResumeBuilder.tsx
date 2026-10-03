import type { FunctionalComponent } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";
import type { RawCollectionData, ResumeSection, ResumeBlock, ResumeLine } from "../../lib/resume/types";
import {
	generateResumeLatex,
	compileLatexToPdf,
	downloadBlob
} from "../../lib/resume/latexEngine";
import { BlockCard } from "./BlockCard";
import { LatexModal } from "./LatexModal";

const STORAGE_KEY = "darshan_resume_builder_draft_v1";

interface ResumeBuilderProps {
	collections: RawCollectionData;
	baseTemplate: string;
}

export const ResumeBuilder: FunctionalComponent<ResumeBuilderProps> = ({
	collections,
	baseTemplate
}) => {
	// Build default initial sections from raw collections
	const buildInitialSections = (): ResumeSection[] => {
		const expBlocks: ResumeBlock[] = (collections.experience || []).map((exp, idx) => ({
			id: `exp-${exp.id ?? idx}`,
			type: "experience",
			title: exp.name,
			subtitle: exp.position,
			location: exp.location,
			period: exp.years,
			selected: exp.inResume ?? true,
			lines: (exp.description || []).map((desc, dIdx) => ({
				id: `exp-${exp.id ?? idx}-line-${dIdx}`,
				text: desc,
				originalText: desc,
				selected: true
			})),
			links: exp.link ? [exp.link] : []
		}));

		const projBlocks: ResumeBlock[] = (collections.projects || []).map((proj, idx) => ({
			id: `proj-${proj.id ?? idx}`,
			type: "project",
			title: proj.name,
			period: proj.timeline,
			tags: proj.tags || [],
			links: proj.links || [],
			selected: proj.inResume ?? false,
			lines: (proj.description || []).map((desc, dIdx) => ({
				id: `proj-${proj.id ?? idx}-line-${dIdx}`,
				text: desc,
				originalText: desc,
				selected: true
			}))
		}));

		const talkBlocks: ResumeBlock[] = (collections.talks || []).map((talk, idx) => {
			let formattedDate = "";
			try {
				formattedDate = Intl.DateTimeFormat("en-US", {
					month: "short",
					year: "numeric"
				}).format(new Date(talk.date));
			} catch {
				formattedDate = String(talk.date);
			}

			return {
				id: `talk-${talk.id ?? idx}`,
				type: "talk",
				title: talk.title,
				subtitle: talk.event,
				period: formattedDate,
				links: talk.links || [],
				selected: talk.inResume ?? false,
				lines: []
			};
		});

		return [
			{
				id: "experience",
				title: "Experience",
				selected: true,
				blocks: expBlocks
			},
			{
				id: "projects",
				title: "Projects",
				selected: true,
				blocks: projBlocks
			},
			{
				id: "talks",
				title: "Talks & Conferences",
				selected: true,
				blocks: talkBlocks
			}
		];
	};

	const [sections, setSections] = useState<ResumeSection[]>(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem(STORAGE_KEY);
				if (saved) {
					return JSON.parse(saved);
				}
			} catch (e) {
				console.error("Failed to restore saved draft", e);
			}
		}
		return buildInitialSections();
	});

	const [isLatexModalOpen, setIsLatexModalOpen] = useState(false);
	const [isCompilingPdf, setIsCompilingPdf] = useState(false);
	const [compileError, setCompileError] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [draggedBlock, setDraggedBlock] = useState<{ sectionId: string; index: number } | null>(null);
	const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

	const toggleSectionCollapse = (sectionId: string) => {
		setCollapsedSections((prev) => ({
			...prev,
			[sectionId]: !prev[sectionId]
		}));
	};

	const toggleAllCollapse = () => {
		const allCollapsed = sections.every((s) => Boolean(collapsedSections[s.id]));
		const nextState: Record<string, boolean> = {};
		sections.forEach((s) => {
			nextState[s.id] = !allCollapsed;
		});
		setCollapsedSections(nextState);
	};

	const showToast = (msg: string) => {
		setToastMessage(msg);
		setTimeout(() => setToastMessage(null), 3000);
	};

	// Save draft to localStorage on change
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
		} catch (e) {
			console.error("Error auto-saving draft", e);
		}
	}, [sections]);

	const handleReset = () => {
		if (confirm("Reset resume content back to original portfolio defaults? All manual edits will be cleared.")) {
			try {
				localStorage.removeItem(STORAGE_KEY);
			} catch {}
			setSections(buildInitialSections());
			showToast("Reset to portfolio defaults");
		}
	};

	// Calculate counts
	const stats = useMemo(() => {
		let totalBlocks = 0;
		let selectedBlocks = 0;
		let totalLines = 0;
		let selectedLines = 0;

		sections.forEach((sec) => {
			if (!sec.selected) return;
			sec.blocks.forEach((blk) => {
				totalBlocks++;
				if (blk.selected) {
					selectedBlocks++;
					blk.lines.forEach((line) => {
						totalLines++;
						if (line.selected) selectedLines++;
					});
				}
			});
		});

		return { totalBlocks, selectedBlocks, totalLines, selectedLines };
	}, [sections]);

	// Current generated LaTeX
	const currentLatex = useMemo(() => {
		return generateResumeLatex(sections, baseTemplate);
	}, [sections, baseTemplate]);

	// Section & Block mutations
	const handleToggleSection = (sectionId: string) => {
		setSections((prev) =>
			prev.map((s) => (s.id === sectionId ? { ...s, selected: !s.selected } : s))
		);
	};

	const handleToggleBlock = (sectionId: string, blockId: string) => {
		setSections((prev) =>
			prev.map((sec) => {
				if (sec.id !== sectionId) return sec;
				return {
					...sec,
					blocks: sec.blocks.map((blk) =>
						blk.id === blockId ? { ...blk, selected: !blk.selected } : blk
					)
				};
			})
		);
	};

	const handleEditBlockMeta = (
		sectionId: string,
		blockId: string,
		updates: Partial<ResumeBlock>
	) => {
		setSections((prev) =>
			prev.map((sec) => {
				if (sec.id !== sectionId) return sec;
				return {
					...sec,
					blocks: sec.blocks.map((blk) =>
						blk.id === blockId ? { ...blk, ...updates } : blk
					)
				};
			})
		);
		showToast("Block info updated");
	};

	const handleMoveBlock = (sectionId: string, fromIndex: number, toIndex: number) => {
		setSections((prev) =>
			prev.map((sec) => {
				if (sec.id !== sectionId) return sec;
				const newBlocks = [...sec.blocks];
				if (toIndex < 0 || toIndex >= newBlocks.length) return sec;
				const [moved] = newBlocks.splice(fromIndex, 1);
				newBlocks.splice(toIndex, 0, moved);
				return { ...sec, blocks: newBlocks };
			})
		);
	};

	// Line mutations
	const handleToggleLine = (sectionId: string, blockId: string, lineId: string) => {
		setSections((prev) =>
			prev.map((sec) => {
				if (sec.id !== sectionId) return sec;
				return {
					...sec,
					blocks: sec.blocks.map((blk) => {
						if (blk.id !== blockId) return blk;
						return {
							...blk,
							lines: blk.lines.map((line) =>
								line.id === lineId ? { ...line, selected: !line.selected } : line
							)
						};
					})
				};
			})
		);
	};

	const handleEditLine = (
		sectionId: string,
		blockId: string,
		lineId: string,
		newText: string
	) => {
		setSections((prev) =>
			prev.map((sec) => {
				if (sec.id !== sectionId) return sec;
				return {
					...sec,
					blocks: sec.blocks.map((blk) => {
						if (blk.id !== blockId) return blk;
						return {
							...blk,
							lines: blk.lines.map((line) =>
								line.id === lineId ? { ...line, text: newText } : line
							)
						};
					})
				};
			})
		);
	};

	const handleRevertLine = (sectionId: string, blockId: string, lineId: string) => {
		setSections((prev) =>
			prev.map((sec) => {
				if (sec.id !== sectionId) return sec;
				return {
					...sec,
					blocks: sec.blocks.map((blk) => {
						if (blk.id !== blockId) return blk;
						return {
							...blk,
							lines: blk.lines.map((line) =>
								line.id === lineId ? { ...line, text: line.originalText } : line
							)
						};
					})
				};
			})
		);
		showToast("Reverted line to original");
	};

	const handleDeleteLine = (sectionId: string, blockId: string, lineId: string) => {
		setSections((prev) =>
			prev.map((sec) => {
				if (sec.id !== sectionId) return sec;
				return {
					...sec,
					blocks: sec.blocks.map((blk) => {
						if (blk.id !== blockId) return blk;
						return {
							...blk,
							lines: blk.lines.filter((line) => line.id !== lineId)
						};
					})
				};
			})
		);
		showToast("Line deleted");
	};

	const handleAddLine = (sectionId: string, blockId: string, text: string) => {
		const newLine: ResumeLine = {
			id: `custom-line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			text,
			originalText: text,
			selected: true
		};

		setSections((prev) =>
			prev.map((sec) => {
				if (sec.id !== sectionId) return sec;
				return {
					...sec,
					blocks: sec.blocks.map((blk) => {
						if (blk.id !== blockId) return blk;
						return {
							...blk,
							lines: [...blk.lines, newLine]
						};
					})
				};
			})
		);
		showToast("New bullet line added");
	};

	const handleMoveLine = (
		sectionId: string,
		blockId: string,
		fromIndex: number,
		toIndex: number
	) => {
		setSections((prev) =>
			prev.map((sec) => {
				if (sec.id !== sectionId) return sec;
				return {
					...sec,
					blocks: sec.blocks.map((blk) => {
						if (blk.id !== blockId) return blk;
						const newLines = [...blk.lines];
						if (toIndex < 0 || toIndex >= newLines.length) return blk;
						const [moved] = newLines.splice(fromIndex, 1);
						newLines.splice(toIndex, 0, moved);
						return { ...blk, lines: newLines };
					})
				};
			})
		);
	};

	// Block drag and drop
	const handleBlockDragStart = (sectionId: string, index: number) => {
		setDraggedBlock({ sectionId, index });
	};

	const handleBlockDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	const handleBlockDrop = (sectionId: string, targetIndex: number) => {
		if (!draggedBlock || draggedBlock.sectionId !== sectionId || draggedBlock.index === targetIndex) {
			setDraggedBlock(null);
			return;
		}
		handleMoveBlock(sectionId, draggedBlock.index, targetIndex);
		setDraggedBlock(null);
	};

	// PDF Download action
	const handleDownloadPdf = async () => {
		setIsCompilingPdf(true);
		setCompileError(null);
		try {
			const pdfBlob = await compileLatexToPdf(currentLatex);
			downloadBlob(pdfBlob, "resume-darshan-rander.pdf", "application/pdf");
			showToast("PDF generated & downloaded successfully!");
		} catch (err: any) {
			console.error("PDF generation error", err);
			const errMsg = err?.message || "Failed to compile PDF via online LaTeX service.";
			setCompileError(errMsg);
			setIsLatexModalOpen(true);
			showToast("PDF compiler unavailable. You can download the .tex file.");
		} finally {
			setIsCompilingPdf(false);
		}
	};

	return (
		<div class="rb-container">
			{/* Sticky Toolbar Header */}
			<header class="rb-header">
				<div class="rb-title-group">
					<h1>
						Resume Builder
						<span class="rb-title-badge">LaTeX Powered</span>
					</h1>
					<div class="rb-stats">
						<span class="rb-stat-item">
							<i class="far fa-check-square" />
							<span class="rb-stat-val">{stats.selectedBlocks}</span>/{stats.totalBlocks} Blocks
						</span>
						<span>•</span>
						<span class="rb-stat-item">
							<i class="fas fa-list-ul" />
							<span class="rb-stat-val">{stats.selectedLines}</span>/{stats.totalLines} Bullets
						</span>
						<span>•</span>
						<span
							style={{
								color: stats.selectedLines <= 14 ? "#a3e635" : "#fbbf24",
								fontWeight: 500
							}}
							title="Around 10-14 bullets fits well on a standard 1-page resume"
						>
							{stats.selectedLines <= 14 ? "Ideal ~1 page fit" : "May spill to 2 pages"}
						</span>
					</div>
				</div>

				<div class="rb-actions">
					<button
						type="button"
						class="rb-btn rb-btn-ghost"
						onClick={toggleAllCollapse}
						title={sections.every((s) => Boolean(collapsedSections[s.id])) ? "Expand all sections" : "Collapse all sections"}
					>
						<i class={`fas fa-${sections.every((s) => Boolean(collapsedSections[s.id])) ? "angles-down" : "angles-up"}`} />
						{sections.every((s) => Boolean(collapsedSections[s.id])) ? "Expand All" : "Collapse All"}
					</button>

					<button
						type="button"
						class="rb-btn rb-btn-ghost"
						onClick={handleReset}
						title="Reset to defaults from portfolio"
					>
						<i class="fas fa-rotate-left" /> Reset
					</button>

					<button
						type="button"
						class="rb-btn rb-btn-secondary"
						onClick={() => setIsLatexModalOpen(true)}
						title="View and copy generated LaTeX"
					>
						<i class="fas fa-code" /> View LaTeX
					</button>

					<button
						type="button"
						class="rb-btn rb-btn-secondary"
						onClick={() => downloadBlob(currentLatex, "resume.tex", "text/x-tex")}
						title="Download resume.tex"
					>
						<i class="fas fa-file-download" /> .tex
					</button>

					<button
						type="button"
						class="rb-btn rb-btn-primary"
						disabled={isCompilingPdf}
						onClick={handleDownloadPdf}
						title="Compile and download resume PDF"
					>
						{isCompilingPdf ? (
							<>
								<div class="rb-spinner" /> Compiling...
							</>
						) : (
							<>
								<i class="fas fa-download" /> Generate PDF
							</>
						)}
					</button>

					<a
						href="/"
						class="rb-btn rb-btn-ghost"
						title="Back to portfolio"
						style={{ textDecoration: "none" }}
					>
						<i class="fas fa-arrow-left" /> Home
					</a>
				</div>
			</header>

			{/* Sections List */}
			<main>
				{sections.map((section) => (
					<section key={section.id} class="rb-section">
						<div
							class="rb-section-header"
							style={{ cursor: "pointer", userSelect: "none" }}
							onClick={() => toggleSectionCollapse(section.id)}
						>
							<div class="rb-section-title-wrap">
								<button
									type="button"
									class="rb-btn-icon rb-btn-xs"
									onClick={(e) => {
										e.stopPropagation();
										toggleSectionCollapse(section.id);
									}}
									title={collapsedSections[section.id] ? "Expand section" : "Collapse section"}
								>
									<i class={`fas fa-chevron-${collapsedSections[section.id] ? "right" : "down"}`} />
								</button>
								<input
									type="checkbox"
									class="rb-block-checkbox"
									checked={section.selected}
									onClick={(e) => e.stopPropagation()}
									onChange={() => handleToggleSection(section.id)}
									title={section.selected ? "Unselect entire section" : "Select section"}
								/>
								<h2 class="rb-section-title">{section.title}</h2>
								<span class="rb-section-count">
									{section.blocks.filter((b) => b.selected).length}/{section.blocks.length} active
								</span>
							</div>

							<div class="rb-section-actions" onClick={(e) => e.stopPropagation()}>
								<button
									type="button"
									class="rb-btn rb-btn-sm rb-btn-ghost"
									onClick={() => toggleSectionCollapse(section.id)}
								>
									{collapsedSections[section.id] ? "Expand" : "Collapse"}
								</button>

								<button
									type="button"
									class="rb-btn rb-btn-sm rb-btn-ghost"
									onClick={() => {
										// Select or unselect all blocks in this section
										const allSelected = section.blocks.every((b) => b.selected);
										setSections((prev) =>
											prev.map((s) =>
												s.id === section.id
													? {
															...s,
															blocks: s.blocks.map((b) => ({
																...b,
																selected: !allSelected
															}))
													  }
													: s
											)
										);
									}}
								>
									{section.blocks.every((b) => b.selected) ? "Unselect All" : "Select All"}
								</button>
							</div>
						</div>

						{!collapsedSections[section.id] && (
							section.selected ? (
								<div class="rb-blocks-list">
									{section.blocks.map((block, bIdx) => (
										<BlockCard
											key={block.id}
											block={block}
											index={bIdx}
										isFirst={bIdx === 0}
										isLast={bIdx === section.blocks.length - 1}
										onToggleBlock={(blkId) => handleToggleBlock(section.id, blkId)}
										onMoveBlockUp={(idx) => handleMoveBlock(section.id, idx, idx - 1)}
										onMoveBlockDown={(idx) => handleMoveBlock(section.id, idx, idx + 1)}
										onEditBlockMeta={(blkId, updates) =>
											handleEditBlockMeta(section.id, blkId, updates)
										}
										onToggleLine={(blkId, lineId) =>
											handleToggleLine(section.id, blkId, lineId)
										}
										onEditLine={(blkId, lineId, text) =>
											handleEditLine(section.id, blkId, lineId, text)
										}
										onMoveLineUp={(blkId, lIdx) =>
											handleMoveLine(section.id, blkId, lIdx, lIdx - 1)
										}
										onMoveLineDown={(blkId, lIdx) =>
											handleMoveLine(section.id, blkId, lIdx, lIdx + 1)
										}
										onDeleteLine={(blkId, lineId) =>
											handleDeleteLine(section.id, blkId, lineId)
										}
										onRevertLine={(blkId, lineId) =>
											handleRevertLine(section.id, blkId, lineId)
										}
										onAddLine={(blkId, text) => handleAddLine(section.id, blkId, text)}
										onDragStartBlock={(idx) => handleBlockDragStart(section.id, idx)}
										onDragOverBlock={handleBlockDragOver}
										onDropBlock={(idx) => handleBlockDrop(section.id, idx)}
									/>
								))}
							</div>
						) : (
							<div style={{ color: "#777", fontSize: "0.85rem", fontStyle: "italic", padding: "10px 0" }}>
								Section is disabled and excluded from the resume.
							</div>
						))}
					</section>
				))}
			</main>

			{/* LaTeX Modal */}
			<LatexModal
				latexCode={currentLatex}
				isOpen={isLatexModalOpen}
				onClose={() => setIsLatexModalOpen(false)}
				onDownloadPdf={handleDownloadPdf}
				isCompilingPdf={isCompilingPdf}
				compileError={compileError}
			/>

			{/* Toast notification */}
			{toastMessage && <div class="rb-toast">{toastMessage}</div>}
		</div>
	);
};
