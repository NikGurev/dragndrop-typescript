/* Simple validation */
export interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

export function validate(validatable: Validatable): boolean {
	let isValid = true;
	if (Object.keys(validatable).length === 1) {
		return true;
	} else {
		// TODO Rewrite requesting
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
