import classNames from 'classnames';
import * as React from 'react';
import './text-input.css';

export interface TextInputProps {
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
	orientation?: 'horizontal' | 'vertical';
	placeholder?: string;
	type?: 'search' | 'text';
	value: string;
	style?: object;
	helptext?:string;
}

export const TextInput: React.FC<TextInputProps> = props => {
	const className = classNames(
		'text-input',
		`orientation-${props.orientation}`,
		`type-${props.type}`
	);

	return (
		<>
		<span className={className}>
			<label>
				{props.children && <span className="text-input-label">{props.children}</span>}
				<input
					onChange={props.onChange}
					onInput={props.onInput}
					placeholder={props.placeholder}
					type={props.type ?? 'text'}
					value={props.value}
					style={props.style || {}}
				/>
			</label>
		</span>
		{props.helptext && <div style={{fontSize:"0.8em", margin:"5px 0px 0px 100px"}}>{props.helptext||""}</div>}
		</>
	);
};
