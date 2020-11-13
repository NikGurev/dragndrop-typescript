/* Drag & Drop Interfaces*/
interface Draggable {
    dragStartHandle(event: DragEvent): void;
    dragEndHandle(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

/* Enum */
enum ProjectStatus {
    ACTIVE = 'active',
    FINISHED = 'finished'
}

/* Project Model*/
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

type Listener<T> = (items: T[]) => void;

/* Base State class */
class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(fn: Listener<T>) {
        this.listeners.push(fn);
    }
}


/* Project status management*/
class ProjectState extends State<Project>{
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

const projectState = ProjectState.hasInstance();

/* Simple validation */
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatable: Validatable): boolean {
    let isValid = true;
    if (Object.keys(validatable).length === 1) {
        return true;
    } else {
        for (const [key, value] of Object.entries(validatable)) {
            switch (key) {
                case 'required':
                    isValid = isValid && ((value) ? !!validatable.value : true)
                    break;
                case 'minLength':
                    isValid = isValid && validatable.value.toString().length >= value
                    break;
                case 'maxLength':
                    isValid = isValid && validatable.value.toString().length <= value
                    break;
                case 'min':
                    isValid = isValid && validatable.value >= value
                    break;
                case 'max':
                    isValid = isValid && validatable.value <= value
                    break;
            }
        }
    }
    return isValid;
}

// autobind decorator
function autobind(target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: true,
        get(): any {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor;
}

/* Base Component element, Handling DOM getting*/
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    appElement: T;
    element: U;

    constructor(templateId: string, appElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.appElement = document.getElementById(appElementId)! as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean): void {
        this.appElement.insertAdjacentElement(
            insertAtBeginning ? 'afterbegin' : 'beforeend',
            this.element
        )
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

/* list handler class*/
class ProjectItem extends Component<HTMLUListElement, HTMLElement> implements Draggable {

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
    dragEndHandle(_: DragEvent) {}

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


/* list handler class*/
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
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
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = `${this.type}`.toUpperCase() + ' PROJECTS';
    }

}

/* form and inputs handler class*/
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    formInputs: HTMLInputElement[];

    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.formInputs = [
            this.element.querySelector('#title')! as HTMLInputElement,
            this.element.querySelector('#description')! as HTMLInputElement,
            this.element.querySelector('#people')! as HTMLInputElement
        ]
        this.configure();
    }

    private gatherUserInput(): [string, string, number] | void {
        if (
            validate({value: this.formInputs[0].value, required: true, minLength: 5}) &&
            validate({value: this.formInputs[1].value, required: true, minLength: 5}) &&
            validate({value: +this.formInputs[2].value, required: true, min: 5})
        ) {
            console.log('inputs validated')
            return [this.formInputs[0].value, this.formInputs[1].value, +this.formInputs[2].value];
        } else {
            alert('Invalid input, try again');
            return;
        }
    }

    private clearInputs(): void {
        for (const input of this.formInputs) {
            if (input.value.length) {
                input.value = '';
            }
        }
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
        }
        this.clearInputs();

    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent() {
    }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList(ProjectStatus.ACTIVE);
const finishedProjectList = new ProjectList(ProjectStatus.FINISHED);
