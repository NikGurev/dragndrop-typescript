/* Drag & Drop Interfaces*/
export interface Draggable {
	dragStartHandle(event: DragEvent): void;
	dragEndHandle(event: DragEvent): void;
}

export interface DragTarget {
	dragOverHandler(event: DragEvent): void;
	dropHandler(event: DragEvent): void;
	dragLeaveHandler(event: DragEvent): void;
}

