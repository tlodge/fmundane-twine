import {  IconPlus,  IconX } from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import { ButtonBar } from '../container/button-bar';
import { IconButton } from '../control/icon-button';
import {TextInput} from '../control/text-input';
import { Action } from '../onstart/add-actions';
import { Actions } from './actions';

import './add-rules-button.css';

export interface AddRulesProps {
	onAdd: (rules:Rule[]) => void;
	onCancel:()=>void;
	type:string;
	rules?: Rule[];
}

export interface Rule {
	type?: string,
    rule:{
		operator: string
    	operand: string | string[]
	}
    actions: Action[][]
    next: string
}

export const AddButtonRules: React.FC<AddRulesProps> = props => {
	const {onAdd, onCancel} = props;
	const {t} = useTranslation();

	const [rules, setRules] = React.useState<Rule[]>(props.rules || [{rule:{operator:"equals", operand:""},actions:[],next:""}]);

	const addNewRule = ()=>{
		setRules([...rules,{rule:{operator:"equals", operand:""},actions:[],next:""}]);
	}

	const removeAction = (actions:Action[][], index:number, subindex:number) : Action[][]=>{
		
		if (actions.length <= index){
			return actions;
		}

		return (actions || []).reduce((acc:Action[][],actionarr:Action[],j)=>{
			if (j !== index)
				return [...acc, actionarr]
			const newactions =  actionarr.filter((a,i)=>i !== subindex);
			return newactions.length <= 0 ? acc : [...acc, newactions];
		},[])
	}

	const updateAction = (actions:Action[][], index:number, subindex:number, action:Action) : Action[][]=>{
		
		if (actions.length <= index){
			return [...actions, [action]];
		}

		return (actions || []).reduce((acc:Action[][],actionarr:Action[],j)=>{
			if (j !== index)
				return [...acc, actionarr]

			return [...acc, actionarr.map((a,i)=>{
				return i === subindex ? action : a;
			})]

		},[])
	}

	const appendAction = (actions:Action[][], index:number, action:Action) : Action[][]=>{
		
		if (actions.length <= index){
			return [...actions, [action]];
		}

		return (actions || []).reduce((acc:Action[][],actionarr:Action[],j)=>{
			if (j !== index)
				return [...acc, actionarr]

			return [...acc, [...actionarr, action]]
		},[])
	}

	const deleteAction = (rindex:number, aindex:number, subindex:number)=>{
		const _rules = rules.reduce((acc:Rule[], rule:Rule, i:number)=>{
			if (i !== rindex)
				return [...acc, rule];
			return [	
				...acc, 
				{
					...rule, 
					actions: removeAction(rule.actions, aindex, subindex)
				}	
			]
		},[]);
		setRules(_rules);
	}

	const editAction = (rindex:number, aindex:number, subindex:number, action:Action)=>{
		const _rules = rules.reduce((acc:Rule[], rule:Rule, i:number)=>{
			if (i !== rindex)
				return [...acc, rule];
			return [	
				...acc, 
				{
					...rule, 
					actions: updateAction(rule.actions, aindex, subindex, action)
				}	
			]
		},[]);
		setRules(_rules);
	}

	const addParallelAction = (rindex:number)=>{
		const _rules = rules.reduce((acc:Rule[], rule:Rule, i:number)=>{
			if (i !== rindex)
				return [...acc, rule];
			return [	
				...acc, 
				{
					...rule, 
					actions: [...rule.actions, [{"action":""}]]				
				}	
			]
		},[]);
		setRules(_rules);
	}

	const addAction = (rindex:number, aindex:number, action:Action)=>{
		const _rules = rules.reduce((acc:Rule[], rule:Rule, i:number)=>{
			if (i !== rindex)
				return [...acc, rule];
			return [	
				...acc, 
				{
					...rule, 
					actions: appendAction(rule.actions, aindex, action)
				}	
			]
		},[]);
		setRules(_rules);
	}

	const setOperand = (index:number, operand:string)=>{
		setRules(rules.reduce((acc:Rule[], item:Rule, i:number)=>{
			if (i !== index)
				return [...acc, item];
			return [...acc, {...item, rule:{...item.rule,operand}}];
		},[]));
	}

	const setNext = (index:number, next:string)=>{
		setRules(rules.reduce((acc:Rule[], item:Rule, i:number)=>{
			if (i !== index)
				return [...acc, item];
			return [...acc, {...item, next: next.trim()}];
		},[]));
	}

	const renderNext = (index:number, next:string)=>{
		return <div className="rulerow">
			<div>then go to</div>
			<TextInput placeholder="next part" style={{padding:2}} onChange={e => setNext(index,e.target.value)} value={next}></TextInput> 
		</div>
	}

	const operandtostring  = (value: string | string[]) : string=>{
		if (Array.isArray(value)){
			return value.join(",")
		}
		return value;
	}

	const renderRule = (index:number, rule:Rule)=>{
		
		return (<div key={index}>
				<div className="rulerow">	
					<div>when</div>
					<div style={{marginTop:2}}>
						<TextInput placeholder="name" style={{padding:2,width:Math.max(20,rule.rule.operand.length * 9)}} onChange={e => setOperand(index, e.target.value)} value={operandtostring(rule.rule.operand)}></TextInput> 
					</div>
					<div onClick={()=>{
						addAction(0,0,{"action":""})
					}}>is pressed, call {rule.actions.length <= 0 ? "nothing" : ""} </div>
				</div>
				
				{rule.actions.length > 0 && <Actions actions={rule.actions} 
						 deleteAction={(a,s)=>deleteAction(index, a,s)}
						 addAction={(aindex:number, _action:Action)=>{addAction(index, aindex, _action)}}
						 editAction={(aindex:number, subindex:number, action:Action)=>editAction(index,aindex,subindex,action)}
						 addParallelAction={()=>addParallelAction(index)}/>}
				
				{renderNext(index,(rule.next||"").trim())}
			</div>)
	}

	const renderRules = ()=>{
		return rules.map((r,i)=>{
			return renderRule(i,r);
		});
	}

	return (<>
			<div id="rules" style={{marginBottom:40}}>		
				{renderRules()}
				<div style={{textAlign:"center"}}>
					<IconButton icon={<IconPlus />} iconOnly={false} label={"add another rule"} onClick={addNewRule} variant="primary"/>
				</div>
			</div>
			<div style={{display:"flex", justifyContent:"center"}}>
				<ButtonBar>
					<IconButton
						disabled={false}
						icon={<IconPlus />}
						label={t('Update')}
						onClick={()=>onAdd(rules)}
						variant="create"
					/>
					<IconButton
						icon={<IconX />}
						label={t('common.cancel')}
						onClick={() => onCancel()}
					/>
				</ButtonBar>
			</div>
		</>)
};
