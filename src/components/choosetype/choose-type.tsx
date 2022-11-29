import * as React from 'react';
import {TextSelect} from '../control/text-select';

export interface ChooseTypeProps {
	icon?: React.ReactNode;
	label?: string;
	onSelect: (event:React.ChangeEvent<HTMLSelectElement>) => void;
	type:string;
}

export const ChooseType: React.FC<ChooseTypeProps> = props => {
    return <TextSelect onChange={(e)=>props.onSelect(e)} options={[{label:"button", value:"button"}, {label:"webhook", value:"webhook"}, {label:"speech", value:"speech"}]} value={props.type}>node type</TextSelect>
}