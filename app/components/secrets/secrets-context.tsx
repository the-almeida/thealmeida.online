"use client";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { SECRETS, STORAGE_KEY, SecretId } from "./config";

export type Overlay = null | "found-name" | "game" | "prize";

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
		const raw = window.localStorage.getItem(STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed)
			? (parsed.filter((x) => VALID.has(x)) as SecretId[])
			: [];
	} catch {
		return [];
	}
}

function save(found: SecretId[]) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
	} catch {
		// storage blocked: progress just won't persist
	}
}

export const SecretsProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const [ready, setReady] = useState(false);
	const [found, setFound] = useState<SecretId[]>([]);
	const [overlay, setOverlay] = useState<Overlay>(null);

	useEffect(() => {
		setFound(load());
		setReady(true);
	}, []);

	const isFound = useCallback((id: SecretId) => found.includes(id), [found]);

	const markFound = useCallback(
		(id: SecretId) => {
			if (found.includes(id)) return false;
			const next = [...found, id];
			setFound(next);
			save(next);
			return true;
		},
		[found],
	);

	const reset = useCallback(() => {
		setFound([]);
		save([]);
		setOverlay(null);
	}, []);

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
