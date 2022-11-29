import classNames from 'classnames';
import * as React from 'react';
import './text-area.css';

export interface TextAreaProps {
	onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onInput?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
	orientation?: 'horizontal' | 'vertical';
	placeholder?: string;
	value: string;
	style?: object;
}

export const TextArea: React.FC<TextAreaProps> = props => {
	const className = classNames(
		'text-area',
		`orientation-${props.orientation}`
	);

	return (
		<span className={className}>
			<label>
				<span className="text-input-label">{props.children}</span>
				<textarea
                    rows={3}
					onChange={props.onChange}
					onInput={props.onInput}
					placeholder={props.placeholder}
					value={props.value}
					style={props.style || {}}
				/>
			</label>
		</span>
	);
};
