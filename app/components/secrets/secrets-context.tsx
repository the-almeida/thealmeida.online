"use client";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { track } from "../umami";
import { SECRETS, STORAGE_KEY, SecretId } from "./config";

/** The full-screen layer currently open. Only one at a time. */
export type Overlay = null | "intro" | "game" | "prize" | "visitor";

type SecretsState = {
	/** False until localStorage has been read (avoids hydration flashes). */
	ready: boolean;
	found: SecretId[];
	isFound: (id: SecretId) => boolean;
	/** Marks a secret as found. Returns true only the first time. */
	markFound: (id: SecretId) => boolean;
	reset: () => void;
	overlay: Overlay;
	setOverlay: (o: Overlay) => void;
};

const Ctx = createContext<SecretsState | null>(null);

const VALID = new Set<string>(SECRETS.map((s) => s.id));

function load(): SecretId[] {
	try {
		const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
		return Array.isArray(parsed) ? (parsed.filter((x) => VALID.has(x)) as SecretId[]) : [];
	} catch {
		return [];
	}
}

function save(found: SecretId[]) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
	} catch {
		// Storage blocked: progress just won't persist.
	}
}

export const SecretsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [ready, setReady] = useState(false);
	const [found, setFound] = useState<SecretId[]>([]);
	const [overlay, setOverlay] = useState<Overlay>(null);
	// Source of truth for markFound, so it stays stable (never re-creates the
	// game loop that holds it) and is safe to call twice in the same tick.
	const foundRef = useRef<SecretId[]>([]);

	useEffect(() => {
		foundRef.current = load();
		setFound(foundRef.current);
		setReady(true);
	}, []);

	const isFound = useCallback((id: SecretId) => found.includes(id), [found]);

	const markFound = useCallback((id: SecretId) => {
		if (foundRef.current.includes(id)) return false;
		const next = [...foundRef.current, id];
		foundRef.current = next;
		setFound(next);
		save(next);
		track("secret_found", { id, total: next.length });
		return true;
	}, []);

	const reset = useCallback(() => {
		foundRef.current = [];
		setFound([]);
		save([]);
		setOverlay(null);
	}, []);

	// The page underneath must not scroll while a layer is open.
	useEffect(() => {
		if (!overlay) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [overlay]);

	const value = useMemo(
		() => ({ ready, found, isFound, markFound, reset, overlay, setOverlay }),
		[ready, found, isFound, markFound, reset, overlay],
	);
	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useSecrets() {
	const ctx = useContext(Ctx);
	if (!ctx) throw new Error("useSecrets must be used inside SecretsProvider");
	return ctx;
}
