import { Project, ProjectStatus } from "../models/project.js";

type Listener<T> = (items: T[]) => void;

/* Base State class */
class State<T> {
	protected listeners: Listener<T>[] = [];
	
	addListener(fn: Listener<T>) {
		this.listeners.push(fn);
	}
}


/* Project status management*/
export class ProjectState extends State<Project> {
	projects: Project[];
	private static instance: ProjectState;
	
	
	private constructor() {
		super();
		this.projects = [];
	}
	
	public static hasInstance() {
		if (this.instance) {
			return this.instance;
		} else {
			this.instance = new ProjectState();
			return this.instance
		}
	}
	
	addProject(title: string, description: string, numOfPeople: number) {
		const newProject = new Project(
			Math.random().toString(),
			title,
			description,
			numOfPeople,
			ProjectStatus.ACTIVE
		)
		this.projects.push(newProject);
		this.updateListeners();
	}
	
	moveProject(projectId: string, newProjectStatus: ProjectStatus): void {
		const project = this.projects.find((project: Project) => project.id === projectId);
		if (project && project.status !== newProjectStatus) {
			project.status = newProjectStatus;
			this.updateListeners();
		}
	}
	
	private updateListeners(): void {
		for (const listener of this.listeners) {
			listener(this.projects.slice());
		}
	}
}

export const projectState = ProjectState.hasInstance();
