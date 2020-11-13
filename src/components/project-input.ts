import { Component } from "./base-component.js";
import { autobind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";
import { validate } from "../util/validation.js";

/* form and inputs handler class*/
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
