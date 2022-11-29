import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus} from '@tabler/icons';
import {CardContent} from '../container/card';
import {CardButton} from '../control/card-button';
import { ChooseType } from './choose-type';


export interface ChooseTypeButtonProps {
	icon?: React.ReactNode;
	label?: string;
	type: string;
	onSelect: (type:string) => void;
}

export const ChooseTypeButton: React.FC<ChooseTypeButtonProps> = props => {
	const {icon, label, type, onSelect} = props;
	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	let validationMessage: string | undefined = undefined;
	
	React.useEffect(()=>{
		onSelect(type || "button")
	},[])
	return (
		<span className="add-tag-button">
			<CardButton
				disabled={false}
				icon={icon ?? <IconPlus />}
				label={"trigger"}
				onChangeOpen={()=>{
					setOpen(!open)
				}}
				open={open}
			>
				<CardContent style={{width:200, overflowY:"auto"}}>
					<ChooseType type={type} onSelect={(e)=>{onSelect(e.target.value);setOpen(false)}}/>
				</CardContent>
				
			</CardButton>
		</span>
	);
};