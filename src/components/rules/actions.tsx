import { IconButton } from "../control/icon-button";
import { Action, Method } from "../onstart/add-actions";
import {  IconArrowBarRight, IconEdit, IconPlus, IconTrashX } from '@tabler/icons';
import { AddAction } from './add-action';
import React from "react";

export interface ActionsProps {
    actions: Action[][];
    deleteAction: (aindex:number,subindex:number)=>void;
    addParallelAction:()=>void;
    addAction:(aindex:number, action:Action)=>void;
    editAction:(aindex:number, subindex:number, action:Action)=>void;
}


export const Actions: React.FC<ActionsProps> = props => {
    const {actions} = props;
    const [mode, setMode] = React.useState("");
    const [actionIndex, setActionIndex] = React.useState(0);
    const [actionSubIndex, setActionSubIndex] = React.useState(0);

    const onEdit  = (aindex:number,subindex:number)=>{
        setMode("edit");
        setActionIndex(aindex); 
        setActionSubIndex(subindex); 
    }

    const onDelete  = (aindex:number,subindex:number)=>{
        props.deleteAction(aindex,subindex)
    }

    const onAdd = (aindex:number)=>{
        setMode("add");
        setActionIndex(aindex)
    }

    const close = ()=>{
        console.log("settin gmode to emot!!");
        setMode("");
    }

    const addParallelAction = ()=>{
        setMode("edit");
        setActionIndex(actions.length);
        props.addParallelAction()
    }

    const addAction = (aindex:number, action:Action)=>{
        console.log("Adding action", action);
        close();
        props.addAction(aindex,action)
    }

    const bootstrap = ()=>{

        return <div style={{marginTop:10}}>
                <IconButton icon={<IconPlus />} style={{fontSize:"0.8em"}} label={"add a new action"} onClick={()=>{
                    addAction(0,{action:"", params:"{}", method:Method.GET});
                    setMode("edit");
                }} variant="primary"/> 
        </div>
        /*return (<>				
                {<AddAction onClose={close} action={{action:""}} onAdd={(_action:Action)=>addAction(0,_action)}/>}
                <div style={{textAlign:"center"}}>
                    <IconButton icon={<IconPlus />} iconOnly={true} label={""} onClick={()=>setMode("add")} variant="primary"/> 
                </div>
        </>)*/
    }

    if (actions.length <= 0){
      return bootstrap();
    }else{
        //TODO: schekc edit action here (how can it remember speech aprams!!)
        const lines = actions.map((arr, aindex)=>{
            
            const rows =  arr.map(((action,subindex)=>{
                return <div key={`${aindex}-${subindex}`} style={{padding:7}}>
                    <div style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
                        <div style={{display: "flex", flex: "1 1 auto", flexDirection:"column"}}>
                            <div style={{padding:4,display:"flex", flexDirection:"row"}}>
                                <div style={{flex: "1 1 auto", fontSize:"0.9em"}}>after waiting {action.delay} ms, call</div> 
                            </div>
                            <div style={{padding:4,display:"flex", flexDirection:"column"}}>
                                <div style={{flex: "1 1 auto", fontSize:"0.9em", fontWeight:700}}>{action.action.toString()}</div> 
                            </div>
                            
                        </div>	
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <IconButton icon={<IconEdit />} iconOnly={true} label={""} onClick={()=>onEdit(aindex,subindex)} variant="primary"/>
                            <IconButton icon={<IconTrashX />} iconOnly={true} label={""} onClick={()=>onDelete(aindex,subindex)} variant="primary"/>
                            <IconButton icon={<IconPlus />} iconOnly={true} label={""} onClick={()=>{onAdd(aindex)}} variant="primary"/>
                        </div>
                    </div>
                </div>
            }))					
            return <div key={aindex} style={{borderLeft:"2px solid black", marginBottom:10}}>
                {rows}
            </div>
        })
      
        return (<>
            <div style={{marginLeft:10}}>
                {mode==="add" && <AddAction onClose={close} action={{action:""}}  onAdd={(_action:Action)=>{close(); addAction(actionIndex,_action)}}/>}
                {mode==="edit" && <AddAction onClose={close} action={actions[actionIndex][actionSubIndex]} onAdd={(_action)=>{close();props.editAction(actionIndex,actionSubIndex,_action)}}/>}
                {lines}
            </div>
            <IconButton icon={<IconArrowBarRight />} style={{fontSize:"0.8em"}} label={"add parallel action(s)"} onClick={()=>{addParallelAction()}} variant="primary"/> 
            </>
        )
    }
    

}
