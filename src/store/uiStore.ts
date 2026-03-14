import { map, atom } from "nanostores";

export const $sectionStates = map<Record<string, boolean>>({});
export const $cardStates = map<Record<string, boolean>>({});
export const $lightboxState = atom<{ src: string; alt: string } | null>(null);

export function toggleSection(id: string) {
	const current = $sectionStates.get()[id] || false;
	$sectionStates.setKey(id, !current);
}

export function toggleCard(id: string) {
	const current = $cardStates.get()[id] || false;
	$cardStates.setKey(id, !current);
}

export function openLightbox(src: string, alt: string) {
	$lightboxState.set({ src, alt });
}

export function closeLightbox() {
	$lightboxState.set(null);
}
