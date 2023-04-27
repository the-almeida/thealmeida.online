import { useEffect, useState } from "react";

interface MousePosition {
	x: number;
	y: number;
}

export function useMousePosition(): MousePosition {
	console.log('usa mouse position');
	
	const [mousePosition, setMousePosition] = useState<MousePosition>({
		x: 0,
		y: 0,
	});

	useEffect(() => {
		console.log('entoru no mouse move');
		
		const handleMouseMove = (event: MouseEvent) => {
			setMousePosition({ x: event.clientX, y: event.clientY });
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	console.log('actual mouse position: ', JSON.stringify(mousePosition));
	

	return mousePosition;
}
