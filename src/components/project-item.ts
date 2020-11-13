import { Component } from "./base-component.js";
import { Draggable } from "../models/drag-drop.js";
import { Project } from "../models/project.js";
import { autobind } from "../decorators/autobind.js";

export class ProjectItem extends Component<HTMLUListElement, HTMLElement> implements Draggable {
	
	get persons(): string {
		return (this.project.people === 1) ? '1 person' : `${this.project.people} persons`;
	}
	
	constructor(private project: Project) {
		super('single-project', `${project.status}-projects-list`, false);
		
		this.configure();
		this.renderContent();
	}
	
	@autobind
	dragStartHandle(event: DragEvent) {
		event.dataTransfer!.setData('text/plain', this.project.id);
		event.dataTransfer!.effectAllowed = 'move';
	}
	
	@autobind
	dragEndHandle(_: DragEvent) {
	}
	
	configure() {
		this.element.addEventListener('dragstart', this.dragStartHandle);
		this.element.addEventListener('dragend', this.dragEndHandle);
	}
	
	renderContent() {
		this.element.querySelector('h2')!.textContent = this.project.title;
		this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
		this.element.querySelector('p')!.textContent = this.project.description;
	}
}
