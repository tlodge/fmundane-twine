import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {TextInput} from '../control/text-input';
import {TextArea} from '../control/text-area';

import './add-onstart-button.css';
import { IconButton } from '../control/icon-button';
import { IconPlus, IconTrashX } from '@tabler/icons';
import { TextSelect } from '../control/text-select';

export interface Speech {
    words?: string,
    voice?: string,
    rate?: string,
    delay?: string,
}

export interface AddSpeechProps {
	onAdd: (lines:Speech[]) => void,
    lines: Speech[]
}
/*
 {name:"Daniel", id:"p226"},
    {name:"Fred", id:"p228"},
    {name:"Richard", id:"p230"},
    {name:"Dave", id:"p231"},
    {name:"Robin", id:"p234"},
    {name:"Charlie", id:"p236"},
    {name:"Kate", id:"p237"},
    {name:"Ed", id:"p239"},
    {name:"Geeta", id:"p240"},
    {name:"Paul", id:"p241"},
    {name:"Eleanor", id:"p243"},
    {name:"Molly", id:"p245"},
    {name:"Izzy", id:"p248"},
    {name:"Holly", id:"p374"},
    {name:"Nadia", id:"p362"},
    {name:"Chloe", id:"p361"},
]*/

/*const voices = [
    {name:"Daniel"},
    {name:"Fred"},
    {name:"Richard"},
    {name:"Dave"},
    {name:"Robin"},
    {name:"Charlie"},
    {name:"Kate"},
    {name:"Ed"},
    {name:"Geeta"},
    {name:"Paul"},
    {name:"Eleanor"},
    {name:"Molly"},
    {name:"Izzy"},
    {name:"Holly"},
    {name:"Nadia"},
    {name:"Chloe"},
]*/

const voices = [
    {name:"Daniel"},
    {name:"Serena"},
    {name:"Emily"},
    {name:"Tom"},
    {name:"Lee"},
]

export const AddSpeech: React.FC<AddSpeechProps> = props => {
	const {onAdd, lines} = props;
    const lastline = lines.length > 0 ? lines[lines.length-1] : {};

	const [words, setWords] = React.useState(lastline.words || '');
    const [voice, setVoice] = React.useState(lastline.voice || '');
    const [rate, setRate]   = React.useState(lastline.rate || '') ;
    const [delay, setDelay] = React.useState(lastline.delay || '');
    const [lineIndex, setLineIndex] = React.useState(Math.max(lines.length-1,0));

    const handleAdd = ()=>{
        const newlines = [...(lines||[]).map((item,i)=>{
            if (i===lineIndex){
                return {words, voice, rate, delay}
            }
            return item;
        }),{}];
        onAdd(newlines);
        setLineIndex(lines.length);
        setWords('some words');
        setVoice('Daniel');
        setRate('');
        setDelay('');
    }

    React.useEffect(()=>{
        const line = lines[lineIndex] || {};
        setWords(line?.words || "");
        setVoice(line?.voice || "Daniel");
        setRate(line?.rate || "180");
        setDelay(line?.delay || "0");
    },[lineIndex])

    React.useEffect(()=>{
       // if (lineIndex === 0){
        //    onAdd([{words, voice, rate, delay}]);
       // }
       // else{
            const newlines = (lines||[]).map((item,i)=>{
                if (i===lineIndex){
                    return {words, voice, rate, delay}
                }
                return item;
            })
            onAdd(newlines)
      //  }
    },[words,voice,rate,delay]);

    const deleteLine = (index:number)=>{
        onAdd([...lines.slice(0, index),...lines.slice(index + 1)]);
    }

    const renderLines = ()=>{
       const rows =  lines.map((line,i)=>(<tr onClick={()=>{setLineIndex(i)}} key={i} >
          
                    <td style={{fontSize:"0.9em", paddingTop:7, width:220, maxWidth:220, overflow:"hidden"}}>{line.words}</td> 
                    <td style={{fontSize:"0.9em", paddingTop:7}}>{line.voice}</td>
                    <td style={{fontSize:"0.9em", paddingTop:7}}>{line.delay}</td>
                    <td style={{fontSize:"0.9em", paddingTop:7}}><IconButton icon={<IconTrashX />} iconOnly={true} label={""} onClick={()=>{deleteLine(i)}} variant="primary"/></td>
                </tr>))

        return  <div style={{maxHeight:500, overflowY:"scroll"}}>
                <table>
                    <thead>
                        <tr>
                            <th style={{textAlign:"start", fontSize:"0.9em"}}>words</th>
                            <th style={{textAlign:"start",fontSize:"0.9em"}}>voice</th>
                            <th style={{textAlign:"start",fontSize:"0.9em"}}>pause(ms)</th>
                            <th style={{textAlign:"start"}}></th>
                        </tr>
                    </thead>
                    <tbody>
                            {rows}
                    </tbody>
                </table>
                </div>
    }

	const {t} = useTranslation();


    const handleVoiceSelect = (e:React.ChangeEvent<HTMLSelectElement>)=>{
        var audio = new Audio();
        audio.src = `/speechsamples/${e.target.value}.wav`;
        audio.play();
        setVoice(e.target.value)
    }

    return (<div className="speechcontainer">
            <div style={{borderBottom:"1px solid black", marginBottom:15}}>
            <div className="speechformitem">
                <TextArea  style={{width:268}} placeholder="something to say" onChange={e => setWords(e.target.value.replace( /[,]/g," "))} value={words}>words</TextArea></div>
            <div className="paramline" style={{marginTop:15}}>
               
                <TextSelect onChange={handleVoiceSelect} options={voices.map(a => ({ label: a.name, value: a.name }))} value={voice}>{"voice"}</TextSelect>
                
                {/*<TextInput style={{width:60}}  placeholder="rate" onChange={e => setRate(e.target.value)} value={rate}></TextInput>*/}
                <TextInput style={{width:90}}  placeholder="delay(ms)" onChange={e => setDelay(e.target.value)} value={delay}></TextInput>
            </div>
            
            <div style={{marginTop:10, marginBottom:15, textAlign:"center"}}>
                <IconButton icon={<IconPlus />} label={'add more speech'} onClick={handleAdd} variant="create"/>
            </div>
            </div>
            {renderLines()}
        </div>);
}
