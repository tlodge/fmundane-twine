import { Speech } from "../components/onstart/add-speech";
import { Action } from "../components/onstart/add-actions";
import { Rule } from "../components/rules/add-button-rules";
import { Method } from "../components/onstart/add-actions";
import {Story} from '../store/stories';

const DEFAULTRATE 	= 180;
const DEFAULTDELAY 	= 0;
const DEFAULTVOICE = "Daniel";


export interface Node{
    type:string,
    onstart : {
        actions?:Action[][]
        speech?:Speech[]
    }
    rules : Rule[]
}

export interface CaravanAction{
    params: object,
    method: any,
    action: any,
    delay: any,
}

const extractType = (text:string): string=>{
    const toks = text.split("\n");
    for (let i = 0; i < toks.length; i++){
        if (toks[i].indexOf("[type") != -1){
            const typetoks = toks[i].split(":");
            if (typetoks.length > 1)
                return typetoks[1].replace("]","").trim();
            return "button";
        }
    }
    return "button";
}

const extractOnstart = (text:string) : string=>{
    if (text.indexOf("[onstart]") !== -1){
        return text.substring(text.indexOf("[onstart]")).split("[rules]")[0].replace("[onstart]","").trim();
    }
    return "";
}

const extractRulesText = (text:string) : string=>{
    if (text.indexOf("[rules]") !== -1){
        return text.substring(text.indexOf("[rules]")).replace("[rules]","").trim();
    }
  
    return "";
}

const parseSpeechLine = (line:string) : Speech =>{
    //temporarily replace any commas in speech with special symbol
    var commasreplaced = line.replace(/"[^"]+"/g, v=>v.replace(/,/g, '#'));
    const tokens = commasreplaced.replace("[speech]","").replace( /[()]/g,"").replace(/["]/g,"").trim().split(',').map(l=>l.replaceAll("#",","));
    
    return {
        words:tokens.length > 0 ? tokens[0].trim(): "", 
        voice:tokens.length > 1 ? tokens[1].trim(): `${DEFAULTVOICE}`,
        rate:tokens.length  > 2 ? tokens[2].trim(): `${DEFAULTRATE}`, 
        delay:tokens.length > 3 ? tokens[3].trim(): `${DEFAULTDELAY}`
    }
}

const extractParams = (tuplestr:string="()") : Record<string,any>=>{
    const str = tuplestr.replace( /[(]/g,"{").replace(/[)]/g,"}");
    try{
        return JSON.parse(str);
    }catch(err){
        console.log("error parsing", err);
    }
    return {};
}

const extractParamsString = (str:string)=>{
    const toks = str.trim().substring(1, str.trim().length-1);
    const si = toks.indexOf("{");
    const ei = toks.lastIndexOf("}");
    return si > -1 && ei > -1 ? toks.substring(si,ei+1) : "";
}

const formatURL = (str:string)=>{
    if (str.startsWith("http")){
        try {
            return new URL(str);
        }catch(err){

        }
    } 
    return str;
}

const parseActionLine = (line:string) : Action=>{
    const params = extractParamsString(line);
    const toks = line.replace(params,"").replace( /[()]/g,"").replace(/["]/g,"").trim().split(',');
 
    if (toks.length > 0){
        
        let paramobj = {};
      

        const paramstr = (params||"{}").replace(/[(]/g,"{").replace(/[)]/g,"}");//.replace(/[']/g,"\"");
        

        try{
            paramobj = JSON.parse(paramstr);
        }catch(err){
            paramobj = {parseErr:paramstr}
        }

        return {
            action: formatURL(toks[0]), 
            delay: toks.length > 1 ? Number(toks[1].trim()) : 0, 
            params: toks.length > 2 ? JSON.stringify(paramobj) : "{}",
            method: toks.length > 3 ? toks[3] === "POST" ? Method.POST : Method.GET : Method.NONE 
        }
    }
    return {action:""}
}

const extractSpeech = (text:string) : Speech[]=>{
    
    const toks = text.split('\n');
    let line = 0;
    let speech:Speech[] = [];

    const endCondition = (token:string)=>{
        return token.trim() === "" || token.indexOf("[") !== -1;
    }
    while (line < toks.length){
        if (toks[line].trim().startsWith("[speech]")){
            while (++line < toks.length){
                if (!endCondition(toks[line])){
                    speech = [...speech, parseSpeechLine(toks[line])]
                }else{
                    break;
                }	
            }
        }
        line +=1;
    }
    return speech;
}

const extractActions = (text:string) : (Action)[][] =>{


    const toks = text.split('\n');
    let line = 0;
    let actions:Action[][] = [];

    const endCondition = (token:string)=>{
        return token.trim() === "" || token.trim().startsWith("[");
    }

   
    while (line < toks.length){
       
        if (toks[line].trim().startsWith("[action]")){
            let _actions:Action[] = [];
            while (++line < toks.length){
              
                if (!endCondition(toks[line])){
                    _actions = [..._actions, parseActionLine(toks[line])]
                }else{
                    break;
                }	
            }
            actions = [...actions, _actions]
           
        }else{
            line +=1;
        }
    }
  
    return actions;
}

const parseRuleText = (text:string, type:string) : Rule =>{
    const [r, actions] = text.split('[actions]');
    
    
    const rtoks = r.replace("[[","").replace("]]","").split("|");
    const [operand=""] = rtoks[0].trim().split(" ");
    const next = rtoks.length > 1 ? rtoks[1] : operand;
    return  {
        rule:{
            operator: type==="speech" ? "contains" : "equals", 
            //operand:  type==="speech"? operand.split(",").filter(t=>t.trim()!=="") : operand,
            operand:  type==="speech"? operand.replace(/\s+/g,"").split(",").filter(t=>t.trim()!=="") : operand.replace(/\s+/g,""),
        },
        next: next.trim(),//.replace(/\s+/g,""),
        actions : extractActions((actions||"").trim())
    }
}

const extractRules = (text:string, type:string="button"): Rule[]=>{
    const toks = text.trim().replace("[rules]","").split('\n');
    let line = 0;
    let rules: Rule[] = [];

    const endCondition = (token:string)=>{
        return /*token.trim() === "" ||*/ token.indexOf("[rule") !== -1;
    }
    while (line < toks.length){
        if (toks[line].trim().startsWith("[rule")){
            let ruletxt = "";
            const [_,_type] = toks[line].replace("[","").replace("]","").split(":");
           
            while (++line < toks.length){
                if (!endCondition(toks[line])){
                    ruletxt += `\n${toks[line]}`;
                }else{
                    break;
                }	
            }
            rules = [...rules, parseRuleText(ruletxt.trim(), type)]
        }else{
            line +=1;
        }
    }
    return rules;
}



const paramToTuple = (params:any) : string=>{
    return params;
}

const actionToString = (actions:Action[], sep:string='\t\t\t'):string=>{
    return (actions || []).reduce((acc:string,a:Action)=>{
        return `${acc}${sep}("${a.action}","${a.delay||0}","${paramToTuple(a.params)}","${a.method}")\n`
    },"");
}

const actionsToString = (actions:Action[][], sep:string='\t\t'): string=>{
    return (actions || []).reduce((acc:string,s:Action[])=>{
        return `${acc}\n${sep}[action]\n${actionToString(s, `${sep}\t`)}`
    },"");
}

const speechFromNode = (node: Node): string=>{
    return (node.onstart.speech || []).reduce((acc:string,s:Speech)=>{
        return `${acc}\t("${s.words}","${s.voice}","${s.rate}","${s.delay}")\n`
    },"");
}

const onStartFromNode = (node:Node):string=>{
    //return `\t[speech]\n${speechFromNode(node)}\n\n\t[actions]${actionsToString(node.onstart.actions || [])}`
    return `\t[actions]${actionsToString(node.onstart.actions || [])}`
}

const rulesFromNode = (node:Node):string=>{
    return node.rules.reduce((acc:string, rule:Rule)=>{
        const actionstr = (rule.actions && rule.actions.length > 0) ? `\n\t\t[actions]${actionsToString(rule.actions, '\t\t\t')}`:"";
        return `${acc}\n\t[rule]\n\t\t[[${rule.rule.operand}|${rule.next.trim()}]]${actionstr}`
    },"");
}


 /*return [...acc, (rule.actions||[]).reduce((row:string[], arr:Action[][])=>{
            return arr.reduce((row:string[], item:Action[]))=>{
                return [...row, ""];
            },[])     
       },[])]*/

  /*     ...(node.rules || []).reduce((acc:string[], rule:Rule)=>{
        return [...acc, ""];*/

const extractWordsFromParams = (params:string="()"):string[]=>{
    const paramobj = extractParams(params);
    const {body={}} = paramobj;
    const {speech=[]} = body;
    
    return speech.map((w:Record<string,string>) => w.words);
  
   
}

const extractWordsFromActions = (actions: Action[]):string[]=>{
    return actions.reduce((acc:string[], action:Action)=>{
        if (action.action === "say"){
            return [...acc, ...extractWordsFromParams(action.params)]
        }
        return acc;
    },[]);
}

const extractWordsFromActionsArray = (actions:Action[][]):string[]=>{
    return (actions||[]).reduce((acc:string[], arr:Action[])=>{
        return [...acc, ...extractWordsFromActions(arr)]
    },[]);
}

const extractWordsFromNode = (node:Node, lookup:Record<string,string>|never[]) : (string|undefined)[]=>{
    const onstartspeechwords  = [...(node.onstart.speech || []).map(s=>s.words)];
    const onstartactionwords  = [...extractWordsFromActionsArray(node.onstart.actions||[])]
    const rulewords = (node.rules || []).reduce((acc:string[], rule:Rule)=>{
        return [...acc, ...extractWordsFromActionsArray(rule.actions)]
    },[]);
    return [...onstartspeechwords, ...onstartactionwords, ...rulewords];
;}

export function extractWords(passages:string[]){
    const nodes:Node[] = passages.map(p=>convertToObject(p));
    let lookup:Record<string,string>|never[] = [];

    return nodes.reduce((acc:(string|undefined)[], node:Node)=>{
        return [...acc, ...extractWordsFromNode(node,lookup)]
    },[]);

}

export function convertToString(node:Node): string{
    return `[type:${node.type}]\n\n[onstart]\n\n${onStartFromNode(node)}\n[rules]\n${rulesFromNode(node)}`
}

export function convertToObject(text:string): Node{

    const type = extractType(text);
    const onstarttext = extractOnstart(text);
    const speech = extractSpeech(onstarttext)
    const actions = extractActions(onstarttext);
    const rules = extractRules(extractRulesText(text),type);
    
    return {
        type,
        onstart : {
            speech,
            actions
        },
        rules
    }
}

const convertToCaravanObject = (_name:string, text:string)=>{
    const name = _name;//.replace(/\s+/g,"");
    const type = extractType(text);
    const onstarttext = extractOnstart(text); 
    const speech = extractSpeech(onstarttext)
    const actions = extractActions(onstarttext);
    const rules = extractRules(extractRulesText(text),type);

    const base = {
        type,
        name,
        id:name,
        subscription: type === "speech" ? "/speech" : type === "button" ? "/press" : "/webhook",
        onstart : {
            speech,
            actions
        },
        rules
    }
    if (type==="speech"){
        return base;
    }
    return {
       ...base,
       data: rules.map(r=>r.rule.operand),
    }
}


const simplifyOnstart = (onstart:any)=>{
    return Object.keys(onstart).reduce((acc, key)=>{
        if (key === "speech" && onstart[key] && onstart[key].length > 0){
            return {...acc, [key]: onstart[key]}
        }
        if (key === "actions" && onstart[key].length > 0 && onstart[key][0].length > 0){
            return {...acc, [key]: onstart[key].map((a:Action[])=>simplifyActions(a))}
        }
        return acc;
    },{})
}

const simplifyAction = (a:any)=>{
    let action = {
        action: a.action,
        params: {},
        method: "",
        delay: 0,
    };

    if (a.params && Object.keys(a.params).length > 0){
        action = {
            ...action,
            params: JSON.parse(a.params),
            method: a.method,
        }
    }
    if (a.delay !== undefined && a.delay > 0){
        action = {
            ...action,
            delay: a.delay
        }
    }
    return action;
}
const simplifyActions = (actions:Action[])=>{
    return actions.map(a=>simplifyAction(a));
}

const simplifyRules = (rules:Rule[])=>{
    return rules.reduce((acc:any, rule)=>{
        return [...acc,{...rule, actions:rule.actions.map(a=>simplifyActions(a))}]
    },[]);
}

const simplify = (nodes:any)=>{
    return nodes.map((n:any)=>{
        return Object.keys(n).reduce((acc, key)=>{
            if (key === "onstart"){
                return {...acc, onstart:simplifyOnstart(n.onstart)}
            }
            if (key === "rules"){
                return {...acc, rules:simplifyRules(n.rules)}
            }
            return {...acc, [key]:n[key]}
        },{});
    })
}

export function convertToCaravan(story?:Story){
    const {passages, startPassage, name} = story || {};
   
    const eligiblePassage = (text:string) : boolean =>{
        return text.indexOf("[onstart]") !== -1 || text.indexOf("[actions]") !== -1 || text.indexOf("[rules]") !== -1;
    }
    let event = "";

    const nodes = (passages||[]).reduce((acc:any, passage)=>{
        if (passage.id === startPassage){
            event = passage.name;//.replace(/\s/g, '');
        }    
        if (passage.text && (passage.text.replace(/\s/g, '') !== "" && eligiblePassage(passage.text))){
            return [...acc,convertToCaravanObject(passage.name,passage.text)]
        }else{
            return acc;
        }
    },[]);

    const root = [{
        id: name,
        start: {
            actions: [[]],
            event,
        },
        events:simplify(nodes),
    }];

    return root;
}
