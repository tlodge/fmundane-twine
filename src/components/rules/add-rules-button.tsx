import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus} from '@tabler/icons';
import {CardContent} from '../container/card';
import {CardButton} from '../control/card-button';
import { AddButtonRules } from './add-button-rules';
import { AddSpeechRules } from './add-speech-rules';
import { AddWebhookRules } from './add-webhook-rules';
import './add-rules-button.css';
import {Rule} from './add-button-rules';
import { TextSelect } from '../control/text-select';

export interface AddRuleButton {
	icon?: React.ReactNode;
	label?: string;
	type: string;
	onAdd: (rules:Rule[]) => void;
	onSelect: (event:string) => void;
    rules: Rule[];
}

export const AddRulesButton: React.FC<AddRuleButton> = props => {
	const {icon, label, type, onAdd} = props;
	const [creatingStart, setCreatingStart] = React.useState(true);
	const [open, setOpen] = React.useState(false);

	const {t} = useTranslation();

	let validationMessage: string | undefined = undefined;

	const typeChange = (e: React.ChangeEvent<HTMLSelectElement>)=>{
		props.onSelect(e.target.value);
	}
	return (
		<span className="add-tag-button">
			<CardButton
				disabled={false}
				icon={icon ?? <IconPlus />}
				label={label ?? t('common.rules')}
				onChangeOpen={()=>{
					setOpen(true)
				}}
				open={open}
			>
				<CardContent style={{width:460, overflowY:"auto"}}>
					<div className="container">
						<div className="help">Rules determine what needs to happen to move from this node to another node.  So far we support buttons being pressed (by the experience controller) or keywords being said by the particpants (experimental)</div>
						
						<div style={{padding:15, background:"#cfe4fc", borderRadius:5, marginTop:15}}>
							<div style={{marginBottom:15, paddingBottom:15, borderBottom:"1px solid black"}}>
								<TextSelect onChange={typeChange} options={[{label:"button", value:"button"}, {label:"webhook", value:"webhook"}, {label:"speech", value:"speech"}]} value={type}>rule type</TextSelect>
							</div>
							
							{type === "button" && <AddButtonRules onCancel={()=>{setOpen(false)}} type={type} rules={props.rules}  onAdd={(rules:Rule[])=>{
								console.log("add buttn rules, add rukes", rules);
								setOpen(false);
								onAdd(rules);
							}}/>}
						
							{type === "webhook" && <AddWebhookRules onCancel={()=>{setOpen(false)}} type={type} rules={props.rules}  onAdd={(rules:Rule[])=>{
								console.log("add webhook rules, add rukes", rules);
								setOpen(false);
								onAdd(rules);
							}}/>}
						
							{type === "speech" && <AddSpeechRules onCancel={()=>{setOpen(false)}} type={type} rules={props.rules}  onAdd={(rules:Rule[])=>{
								console.log("add speech rules, add rukes", rules);
								setOpen(false);
								onAdd(rules);
							}}/>}

						
						</div>
						{creatingStart && !!validationMessage && <p>{validationMessage}</p>}
					</div>
				</CardContent>
				
			</CardButton>
		</span>
	);
};
