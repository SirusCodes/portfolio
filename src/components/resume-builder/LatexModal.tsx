import type { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import { downloadBlob } from "../../lib/resume/latexEngine";

interface LatexModalProps {
	latexCode: string;
	isOpen: boolean;
	onClose: () => void;
	onDownloadPdf: () => void;
	isCompilingPdf: boolean;
	compileError?: string | null;
}

export const LatexModal: FunctionalComponent<LatexModalProps> = ({
	latexCode,
	isOpen,
	onClose,
	onDownloadPdf,
	isCompilingPdf,
	compileError
}) => {
	const [copied, setCopied] = useState(false);

	if (!isOpen) return null;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(latexCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy LaTeX code", err);
		}
	};

	const handleDownloadTex = () => {
		downloadBlob(latexCode, "resume.tex", "text/x-tex");
	};

	return (
		<div class="rb-modal-overlay" onClick={onClose}>
			<div class="rb-modal" onClick={(e) => e.stopPropagation()}>
				<div class="rb-modal-header">
					<h2>
						<i class="fas fa-file-code" style={{ color: "#88d3ff" }} />
						Generated LaTeX Source
					</h2>
					<button
						type="button"
						class="rb-btn-icon"
						onClick={onClose}
						title="Close modal"
					>
						<i class="fas fa-times" />
					</button>
				</div>

				<div class="rb-modal-body">
					{compileError && (
						<div
							style={{
								marginBottom: "16px",
								padding: "12px 16px",
								background: "rgba(255, 80, 80, 0.12)",
								border: "1px solid rgba(255, 80, 80, 0.35)",
								borderRadius: "8px",
								color: "#ff9999",
								fontSize: "0.85rem",
								display: "flex",
								alignItems: "center",
								gap: "10px"
							}}
						>
							<i class="fas fa-exclamation-triangle" />
							<div>
								<strong>PDF Compilation Note:</strong> {compileError}
							</div>
						</div>
					)}

					<pre class="rb-code-preview">
						<code>{latexCode}</code>
					</pre>
				</div>

				<div class="rb-modal-footer">
					<button
						type="button"
						class="rb-btn rb-btn-secondary"
						onClick={handleCopy}
					>
						<i class={copied ? "fas fa-check" : "far fa-copy"} />
						{copied ? "Copied to Clipboard!" : "Copy LaTeX"}
					</button>

					<button
						type="button"
						class="rb-btn rb-btn-secondary"
						onClick={handleDownloadTex}
					>
						<i class="fas fa-file-download" />
						Download .tex
					</button>

					<button
						type="button"
						class="rb-btn rb-btn-primary"
						disabled={isCompilingPdf}
						onClick={onDownloadPdf}
					>
						{isCompilingPdf ? (
							<>
								<div class="rb-spinner" /> Compiling PDF...
							</>
						) : (
							<>
								<i class="fas fa-download" /> Download PDF
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};
