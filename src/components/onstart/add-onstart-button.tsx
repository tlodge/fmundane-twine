import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus, IconX} from '@tabler/icons';
import {ButtonBar} from '../container/button-bar';
import {CardContent} from '../container/card';
import {CardButton} from '../control/card-button';
import {IconButton} from '../control/icon-button';
import './add-onstart-button.css';
import { Speech } from './add-speech';
import {Action} from './add-actions';
import { Actions } from '../rules/actions';


export interface AddOnStartButtonProps {
	icon?: React.ReactNode;
	label?: string;
	onAdd: (actions:Action[][]) => void;
    onClose : ()=>void
    //lines: Speech[]
    actions: Action[][]
}

export const AddOnStartButton: React.FC<AddOnStartButtonProps> = props => {
    
	const {icon, label, onAdd, onClose} = props;
	const [creatingStart, setCreatingStart] = React.useState(true);
    const [actions, setActions] = React.useState<Action[][]>([]);
	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	let validationMessage: string | undefined = undefined;
	//let canAdd = lines.length > 0;


    React.useEffect(()=>{
        console.log("ok set actions to", props.actions);
        setActions(props.actions);
    },[props.actions]);

	function handleAdd() {
		setOpen(false);
        onAdd(actions);
	}

    const deleteAction = (aindex:number,subindex:number)=>{
       
        const _actions:Action[][] =  actions.reduce((acc:Action[][], arr:Action[], index:number)=>{
            if (aindex===index){
                if (subindex === 0 && arr.length === 1){
                    return acc;
                }
                return [...acc, arr.reduce((acc:Action[], item:Action, si:number)=>{
                    if (si === subindex)
                        return acc;
                    return [...acc, item];
                },[])]
            }
            return [...acc, arr];
        },[]);
        setActions(_actions);
    }

    const addAction = (aindex:number, action:Action)=>{
        
        if (actions.length === 0){
            setActions([[action]])
        }
        else{
            const _actions:Action[][] =  actions.map((arr, index)=>{
                return index===aindex ? [...arr, action] : arr;
            });
            setActions(_actions);
        }
    }
    

    const editAction = (aindex:number,subindex:number, action:Action)=>{
       
        const _actions:Action[][] =  actions.reduce((acc:Action[][], arr:Action[], index:number)=>{
            if (aindex===index){
                return [...acc, arr.reduce((acc:Action[], item:Action, si:number)=>{
                    if (si === subindex)
                        return [...acc,action]
                    return [...acc, item];
                },[])]
            }
            return [...acc, arr];
        },[]);
        setActions(_actions);
    }


    const addParallelAction = ()=>{
		setActions([...actions,[{"action":""}]]);
	}

	return (
		<span className="add-tag-button">
			<CardButton
				disabled={false}
				icon={icon ?? <IconPlus />}
				label={label ?? t('common.onstart')}
				onChangeOpen={(e)=>{setOpen(true)}}
				open={open}
			>
            
				<CardContent style={{maxHeight:500, width:440, padding:15, overflowY:"auto"}}>
                    <div className="help">Make something happen immediately when this node is triggered. You could either have a voice in the caravan say something and/or you could control the caravan' sensors</div>
                    <div style={{padding:15, background:"#cfe4fc", borderRadius:5, marginTop:15}}>
                      
                          
                        <Actions actions={actions} 
                            deleteAction={(a,s)=>deleteAction(a,s)}
                            addAction={(aindex:number, _action:Action)=>{addAction(aindex, _action)}}
                            editAction={(aindex:number, subindex:number, action:Action)=>editAction(aindex,subindex,action)}
                            addParallelAction={()=>addParallelAction()}/>
                            
                    </div>
                    {creatingStart && !!validationMessage && <p>{validationMessage}</p>}
				</CardContent>
                <div style={{ display:"flex", justifyContent:"center"}}>
				<ButtonBar>
					<IconButton
						disabled={false}
						icon={<IconPlus />}
						label={t('common.add')}
						onClick={handleAdd}
						variant="create"
					/>
					<IconButton
						icon={<IconX />}
						label={t('common.cancel')}
						onClick={() => {
                            setOpen(false);
                            onClose();
                        }}
					/>
				</ButtonBar>
                </div>
			</CardButton>
		</span>
	);
};
