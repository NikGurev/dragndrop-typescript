import { ProjectItem } from "./project-item.js";
import { Component } from './base-component.js';
import { Project, ProjectStatus } from '../models/project.js';
import { DragTarget } from "../models/drag-drop.js"
import { autobind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";

/* list handler class*/
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
	assignedProjects: Project[];
	
	constructor(private type: ProjectStatus.ACTIVE | ProjectStatus.FINISHED) {
		super('project-list', 'app', false, `${type}-projects`);
		this.assignedProjects = [];
		
		this.configure();
		this.renderContent();
		
	}
	
	@autobind
	dragOverHandler(event: DragEvent) {
		if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
			event.preventDefault();
			const listEl = this.element.querySelector('ul')!;
			listEl.classList.add('droppable');
		}
	}
	
	@autobind
	dragLeaveHandler(event: DragEvent) {
		const listEl = this.element.querySelector('ul')!;
		listEl.classList.remove('droppable');
	}
	
	@autobind
	dropHandler(event: DragEvent) {
		const prjId = event.dataTransfer!.getData('text/plain');
		projectState.moveProject(
			prjId,
			this.type === ProjectStatus.ACTIVE ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED
		);
	}
	
	configure() {
		this.element.addEventListener('dragover', this.dragOverHandler);
		this.element.addEventListener('dragleave', this.dragLeaveHandler);
		this.element.addEventListener('drop', this.dropHandler);
		projectState.addListener((projects: Project[]) => {
			this.assignedProjects = projects.filter((project: Project) => project.status === this.type);
			this.renderList();
		})
	}
	
	private renderList() {
		const list = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
		list.innerHTML = '';
		for (const project of this.assignedProjects) {
			new ProjectItem(project);
		}
	}
	
	renderContent(): void {
		let listId: string;
		listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent = `${this.type}`.toUpperCase() + ' PROJECTS';
	}
	
}
