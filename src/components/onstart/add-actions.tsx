import * as React from 'react';
import {useTranslation} from 'react-i18next';
import { Color} from '../../util/color';
import {TextInput} from '../control/text-input';

import './add-onstart-button.css';

export interface AddActionProps {
	/**
	 * Called when the user chooses to add a tag. If they are adding a
	 * pre-existing tag, it will only send a name.
	 */
	onAdd: (name: string, color?: Color) => void;
}

export enum Method {
    POST = 'POST',
    GET = 'GET',
    NONE = ''
}

export interface Action {
    action: string | URL
    delay?:Number
    params?: string
    method?: Method
	url?:string
}




export const AddActions: React.FC<AddActionProps> = props => {
	const {onAdd} = props;
	const [action, setAction] = React.useState('');
	const {t} = useTranslation();
	return (<TextInput onChange={e => setAction(e.target.value.replace(/\s/g, '-'))} value={action}>Action</TextInput>);
};
