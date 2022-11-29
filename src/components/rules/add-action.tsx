import { IconCheck, IconTrashX, IconUpload } from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import { IconButton } from '../control/icon-button';
import {TextInput} from '../control/text-input';
import { TextSelect } from '../control/text-select';
import { Action, Method } from '../onstart/add-actions';
import { AddSpeech } from '../onstart/add-speech';
import request from 'superagent';

import './add-rules-button.css';

export interface AddActionProps {
	/**
	 * Called when the user chooses to add a tag. If they are adding a
	 * pre-existing tag, it will only send a name.
	 */
	onAdd: (action:Action) => void;
    onClose: () => void;
    action: Action;
}

export interface Rule {
    operator: string
    operand: string
    actions: Action[][]
    next: string
}

//TODO - put in placeholders for urls!

const actions = [
    {name: "raw", id:"raw", url:"", params:"{}", method:Method.GET, description:"Call this custom url"},
    {name: "arm expand", id:"arm-expand", url:"http://[lenovo]:9107/api/arm/expand", params:"{}", method:Method.GET, description:"This will open the camera door, open the drawer and move the arm camera arm into the extended state"},
    {name: "arm collapse", id:"arm-collapse", url:"http://[lenovo]:9107/api/arm/collapse", params:"{}", method:Method.GET, description:"This will close the drawer, move the camera arm into the rest state then close the door"},
    {name: "arm scan", id:"arm-scan", url:"http://[lenovo]:9107/api/arm/scan", params:"{}", method:Method.GET, description:"This will move the camera arm left and right (once expanded)"},
    {name: "arm yes", id:"arm-yes", url:"http://[lenovo]:9107/api/arm/yes", params:"{}", method:Method.GET, description:"This will nod the camera head up and down (once expanded)"},
    {name: "arm no", id:"arm-no", url:"http://[lenovo]:9107/api/arm/no", params:"{}", method:Method.GET, description:"This will shake the camera head left and right (once expanded)"},
    {name: "arm point",id:"arm-point", url:"http://[lenovo]:9107/api/arm/point", params:`{"query":{"subject": "lock"}}`, method:Method.GET, description:"This will point the camera at items in the caravan"},
    {name: "arm home", id:"arm-home", url:"http://[lenovo]:9107/api/arm/home", params:"{}", method:Method.GET, description:"This will move the arm its standard expanded home position (i.e camera facing forward)"},
    {name: "arm lights", id:"arm-lights", url:"http://[lenovo]:9107/api/arm/lights", params:`{"query":{"colour":2}}`, method:Method.GET, description:"This will change the colour of the servos"},
    {name: "arm flash", id:"arm-flash", url:"http://[lenovo]:9107/api/arm/flash", params:`{"query":{"colours":"[2,3]", "speed":500, "repetitions":5}}`, method:Method.GET, description:"This will flash the colours of the servos"},

    {name: "fan", id: "fan", url:"http://[lenovo]:9097/ui/api/fan", params:`{"query":{"rotate": true,"power":10,"cool":true,"from":0,"to":90}}`, method:Method.GET, description:"This will control the dyson fan (temperature, air speed, rotation)"},
    
    {name: "smell right on", id: "smell-right-on", url:"http://[smell-right]/on3", method:Method.GET, params:"{}", description:"This will start the right hand side smell actuator"},
    {name: "smell right off", id: "smell-right-off", url:"http://[smell-right]/off", method:Method.GET, params:"{}", description:"This will turn off the right hand side smell actuator"},
    {name: "smell left on", id: "smell-left-on", url:"http://[smell-left]/on3", method:Method.GET, params:"{}", description:"This will start the left hand side smell actuator"},
    {name: "smell left off", id: "smell-left-off", url:"http://[smell-left]/off", method:Method.GET, params:"{}", description:"This will turn off the left hand side smell actuator"},
    
    {name: "nanoleaf", id:"nanoleaf", url:"http://[lenovo]:9104/ui/api/hex", method:Method.GET,params:`{"query":{"hue":203,"sat":91,"brightness":99}}`, description:"This will set the colours of the nanoleaf lights (under the caravan seat)"},
    
    {name: "hue", id: "huecolour", method:Method.GET,url:"http://[lenovo]:9092/ui/api/hex",  params:`{"query":{"hex":"ff0000"}}`, description:"This will change the hue lights colour"},
    
    {name: "togglewindows", id: "togglewindows", method:Method.GET,url:"http://[windows]:9222/H",  params:"{}", description:"This will toggle the opacity of the caravan windows"},
    
    {name: "printline", id: "printline", method:Method.POST, url:"http://[receipt]:8080/print", params:`{"body":{"text":"a line of text"}}`, description:"This will print a line of text on the label printer"},
    
    {name: "speech", id: "speech", method:Method.POST, url:"http://[speech]:9105/api/speech", params:`{"body":{"speech":[{"words":"a line of speech"}]}}`, description:"This will send text to the speech synthesizer, or if you render, it will play speech generated Mozilla's speech synthesizer, words between | and | will be replaced by placholders (set in the "},
    
    {name: "screen - home", id: "screen-home", method:Method.GET, url:"http://[lenovo]:9102/api/home", params:"{}", description:"This set the caravan screen to the 'future mundane' title"},
    {name: "screen - dyson", id: "screen-dyson", method:Method.GET, url:"http://[lenovo]:9102/api/air", params:"{}", description:"This will show the air quality readings from the dyson fan"},
    {name: "screen - play", id: "screen-media-play", method:Method.GET, url:"http://[lenovo]:9102/api/media/play",  params:`{"query":{"media":"","delay":0}}`, description:"This will play a media (mp4) file, which must be in the media directory of the machine running the engine."},
    {name: "screen - camera", id: "screen-camera", method:Method.GET, url:"http://[lenovo]:9102/api/camera", params:"{}", description:"This will show live video from the camera on the caravan screen"},
    {name: "screen - scan", id: "screen-scan", method:Method.GET, url:"http://[lenovo]:9102/api/camera/scan", params:"{}", description:"This will place face meshes over all faces in the streamed video"},
    {name: "screen - snippet", id: "screen-snippet", method:Method.GET, url:"http://[lenovo]:9102/api/web", params:`{"query":{"snippet":"edgeofreality"}}`, description:"This will show a snippet of html on the screen (saved in screen_driver/server/public/snippets)"},
    {name: "screen - image", id: "screen-image", method:Method.GET, url:"http://[lenovo]:9102/api/image", params:`{"query":{"image":"myimage.jpg"}}`, description:"This will show an image on the screen."},
     {name: "screen - message", id: "screen-message", method:Method.GET, url:"http://[lenovo]:9102/api/message", params:`{"query":{"message":"a message"}}`, description:"This will flash up a message on the screen, it will overlay it on whatever is currently on there"},
    {name: "screen - qrcode", id: "screen-qrcode", method:Method.GET, url:"http://[lenovo]:9102/api/qrcode", params:`{"query":{"qrcode":"http://[lenovo]:3001/wa/"}}`, description:"This will put a qrcode up on the screen to, for example, get a user to use a webapp served by the caravan.  Webapps could call bespoke webhook event to make something happen in the caravan"},
   
    {name: "mini screen", id:"mini-screen", method:Method.GET, url:"http://[lenovo]:9107/api/update", params:`{"query":{"html":"<img src='https://via.placeholder.com/150'>"}}`, description:"This will send arbitrary HTML to the caravan's mini screens"},
]

const _lookupaction = (action:Action)=>{
    const url = (action.action || "").toString();
    const idx = actions.map(a=>a.url).indexOf(url);
    return idx === -1 ? "raw" : actions[idx].id;
}

export const AddAction: React.FC<AddActionProps> = props => {
	const {onAdd,onClose,action} = props;
	const [_action, _setAction] = React.useState<Action>(action);
    const [file, setFile] = React.useState<File>();
    const [mediaList, setMediaList] = React.useState<string[]>([]);
    const [selectedActionProfile, setSelectedActionProfile] = React.useState(_lookupaction(action));
	const {t} = useTranslation();

    React.useEffect(()=>{
        request.get("/media/list").end((err,response)=>{
            if (!err){
                const {files=[]} = response.body;
                setMediaList(files);
            }
        })
        
    },[file]);

	const handleMethodChange = (event: React.ChangeEvent<HTMLSelectElement>)=>{
		const _method = event.target.value;
		setMethod(_method === "POST" ? Method.POST : Method.GET);
	}

	const cancel = (e:React.MouseEvent<Element, MouseEvent>)=>{
		e.stopPropagation();
	}

    //convert to URL later!
    const setAction = (actionstr: string="")=>{
        _setAction({ 
            ..._action,
            action : actionstr
        })
    }

    const setParams = (params:string="")=>{
        
        _setAction({ 
            ..._action,
            params 
        })
    }

    const setMethod = (method: Method=Method.GET)=>{
        _setAction({ 
           ..._action,
           method,
        })
    }

    const setDelay = (delay:string="0")=>{
        _setAction({ 
           ..._action,
           delay: isNaN(Number(delay)) ? 0 : Number(delay)
        })
    }

    const setURL = (url:string="")=>{
        _setAction({ 
           ..._action,
          url
        })
    }

    const _format = (action:Action)=>{

        return {
            ...action,
            delay: isNaN(Number(action.delay)) ? 0 : Number(action.delay),
            method: action.method ? action.method : Method.GET,
            params: action.params || "",
        }

    }

    const handleActionChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
        setSelectedActionProfile(e.target.value);
        _setAction({
            ..._action,
            ...actions.reduce((acc, item)=>{
                if (item.id===e.target.value){
                    return {
                        action:item.url,
                        params:item.params,
                        method:item.method,
                        delay:0
                    }
                }
                return acc;
            },{})
        })
    }

    const description = ()=>{
        return actions.reduce((acc, item)=>{
            if (item.id===selectedActionProfile){
               return item.description;
            }
            return acc;
        },"")
    }

    const _hueparams = ()=>{
       
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {hex="ff0000"} = query;
        return <> 
            <input type="color" id="favcolor" name="favcolor" value={`#${hex}`} onChange={(e)=>{setParams(JSON.stringify({query:{hex:e.target.value.replace("#","")}}))}}/>
            <p className="description">select a colour for the lights</p>
        </>
    }

    const _nanoparams = ()=>{
       
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {hex="ff0000"} = query;
        return <> 
            <input type="color" id="favcolor" name="favcolor" value={`#${hex}`} onChange={(e)=>{setParams(JSON.stringify({query:{hex:e.target.value.replace("#","")}}))}}/>
            <p className="description">select a colour for the lights</p>
        </>
    }

    const _rawparams = ()=>{
        return <TextInput onChange={e => setParams(e.target.value)} helptext={`as a json object e.g {'greeting':{'hello':'world'}}`} value={_action.params||""}>params</TextInput>
    }

    const _messageparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {message="a message"} = query;
        return <div>
            {renderSelectScreen("message")}
            <TextInput onChange={e => setParams(JSON.stringify({query:{message:e.target.value}}))} helptext={`the message you want to display`} value={message}>message</TextInput>
        </div>
                
    }

    const onFileChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {files=[]} = e.target;
        if (files && files.length > 0){
            setFile(files[0]);
        }
    }

    const onFileUpload = ()=>{
        if (file){
            const formData = new FormData(); 
     
            // Update the formData object 
            formData.append( 
                "mediaFile", 
                file,
                file.name 
            ); 

            request.post("/media/upload").send(formData).end(function(err, response) {
                console.log(err, response);
                if (!err){
                    setFile(undefined);
                    setParams(JSON.stringify({query:{media:file.name}}));
                }
            });
        }
        
    }

    const _armpointparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {subject=""} = query;

        const options = [
            {label:"dyson", value:"dyson"},
            {label:"windows", value:"windows"},
            {label:"door", value:"door"},
            {label:"screen", value:"screen"},
            {label:"forward", value:"forward"},
            {label:"down", value:"down"},
            {label:"mad", value:"mad"},
            {label:"home", value:"home"}
        ]
        
        const _setSubject = (e:React.ChangeEvent<HTMLSelectElement>)=>{
            setParams(JSON.stringify({query:{subject:e.target.value}}));
        }
        return <TextSelect onChange={_setSubject}  options={options} value={subject}>place to point to</TextSelect>
    }

    const _extracthost = (action:string)=>{
        const toks = action.split(":");
        if (toks.length > 1){
            const host1 = toks[1].split("[");
            if (host1.length > 1){
                return host1[1].replace("[","").replace("]","");
            }
        }
        return "";
    }

    const renderSelectScreen = (api:string="")=>{
        const host = _extracthost(`${_action.action}`);
        console.log("ok host is", host);

        const options = [
            {label:"main", value:"lenovo"},
            {label:"left", value:"miniscreen-left"},
            {label:"right", value:"miniscreen-right"}
        ]

        const _setURL = (e:React.ChangeEvent<HTMLSelectElement>)=>{
            setAction(`http://[${e.target.value}]:9102/api/${api}`);
        }
        
        return <div style={{paddingBottom:7}}>
                    <TextSelect onChange={_setURL}  options={options} value={host}>which screen</TextSelect>
                </div>
    }

    const _mediaparams = ()=>{

        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {media=""} = query;

        const _setMedia = (e:React.ChangeEvent<HTMLSelectElement>)=>{
           setParams(JSON.stringify({query:{media:e.target.value}}));
        }

        return  <div style={{paddingBottom:7}}>
                    {renderSelectScreen("media/play")}
                    <div style={{paddingTop:7,paddingBottom:15,  borderBottom:"1px solid"}}>
                        <div style={{marginTop:7,marginBottom:15, fontWeight:700}}>
                                Select from media on caravan server
                        </div>
                        <TextSelect onChange={_setMedia}  options={[{label:"",value:""},...mediaList.map(m=>({label:m, value:m}))]} value={media}>media in caravan</TextSelect>
                    </div>
                    <div style={{paddingTop:15,paddingBottom:7,  borderBottom:"1px solid"}}>
                        <div style={{marginTop:7, marginBottom:15, fontWeight:700}}>
                            Or upload new media
                        </div>
                        <div>
                            <input type="file" onChange={onFileChange} /> 
                        </div>
                        <div style={{marginTop:10}}>
                            {file && <IconButton
                                    disabled={false}
                                    icon={<IconUpload />}
                                    label={t('Upload this file')}
                                    onClick={onFileUpload}
                                    variant="primary"
                            />}
                        </div>
                    </div>
                    <div style={{paddingTop:15,paddingBottom:7}}>
                        <div style={{marginTop:7, marginBottom:15, fontWeight:700}}>
                            Or add filename (and upload later)
                        </div>
                        <TextInput onChange={e => setParams(JSON.stringify({query:{media:e.target.value}}))} helptext={`the media you want to play`} value={media}>media file</TextInput>
                    </div>
                   {media.trim() != "" && <div style={{textAlign:"center", borderRadius: 5, padding:10, marginTop:15, fontSize:"1em"}}><strong>play file: </strong>{`${media}`}</div>}

                  
                </div>
    }

    const _imageparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {image="name of image"} = query;
        return <div>
                {renderSelectScreen("image")}
                <TextInput onChange={e => setParams(JSON.stringify({query:{image:e.target.value}}))} helptext={`the image you want to display`} value={image}>image</TextInput>
        </div>
    }

    const _printerparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {body={}} = params;
        const {text="a line to print"} = body;
        return <TextInput onChange={e => setParams(JSON.stringify({body:{text:e.target.value}}))} helptext={`the message you want to display`} value={text}>line to print</TextInput>
    }

    const _armlightsparams =()=>{
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {colour="1"} = query;
        return <TextInput onChange={e => setParams(JSON.stringify({query:{colour:e.target.value}}))} helptext={`colour (0-7)`} value={colour}>colour</TextInput>

    }

    const _armflashparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {colours=[], speed=1000, repetitions=5} = query;

        return  <div style={{paddingBottom:7}}>
                    <div style={{paddingTop:7,paddingBottom:15}}>
                        <TextInput onChange={e => setParams(JSON.stringify({query:{...query, colours:e.target.value}}))} helptext={`colours you want to flash between`} value={colours}>colours</TextInput>
                    </div>
                    <div style={{paddingTop:7,paddingBottom:15}}>
                        <TextInput onChange={e => setParams(JSON.stringify({query:{...query, speed:e.target.value}}))} helptext={`flash rate (ms)`} value={speed}>speed</TextInput>
                    </div>
                    <div style={{paddingTop:7,paddingBottom:15,  borderBottom:"1px solid"}}>
                        <TextInput onChange={e => setParams(JSON.stringify({query:{...query, repetitions:e.target.value}}))} helptext={`number of flash repetitions`} value={repetitions}>repetitions</TextInput>
                    </div>
                </div>
    };

    const _qrcodeparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {qrcode="http://[lenovo]:3001/wa/"} = query;
        return <div>
            {renderSelectScreen("qrcode")}
            <TextInput onChange={e => setParams(JSON.stringify({query:{qrcode:e.target.value}}))} helptext={`the url to embed with the qrcode`} value={qrcode}>url</TextInput>
        </div>
        
    }

    const _snippetparams = ()=>{
       
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {snippet="edgeofreality"} = query;
        return <div>
                    {renderSelectScreen("web")}
                    <TextInput onChange={e => setParams(JSON.stringify({query:{snippet:e.target.value}}))} helptext={`the html snippet (saved in screen_driver/server/public/snippets) to display`} value={snippet}>snippet</TextInput>
                </div>
    }

    const _speechparams = ()=>{
        
        //FIX!!
        const params = JSON.parse(_action.params || "{}");
        const {body={}} = params;
        const {speech=[]} = body;
        return <AddSpeech lines={speech} onAdd={(lines)=>{
            setMethod(Method.POST);
            setParams(JSON.stringify({body:{speech:lines}}))
        }}/>
    }


    const _fanparams = ()=>{
        const params = JSON.parse(_action.params || "{}");
        const {query={}} = params;
        const {rotate=true, power=10, cool=true, from=0, to=90} = query;
        
        const _handleRotateChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
            setParams(JSON.stringify({query:{rotate:e.target.value==="true" ? true : false, power, cool, from, to}}));
        }

        const _handlePowerChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
            setParams(JSON.stringify({query:{rotate, power:Number(e.target.value), cool, from, to}}));
        }

        const _handleTempChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
            setParams(JSON.stringify({query:{rotate, cool:e.target.value==="true" ? true : false, power, from, to}}));
        }

        const _handleFromChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
            if (!isNaN(Number(e.target.value))){
                setParams(JSON.stringify({query:{rotate, cool, power, from:Number(e.target.value), to}}));
            }
        }

        const _handleToChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
            if (!isNaN(Number(e.target.value))){
                setParams(JSON.stringify({query:{rotate, cool, power, to:Number(e.target.value), from}}));
            }
        }

        const powerlabels = [0,1,2,3,4,5,6,7,8,9,10].map(i=>({label:`${i}`, value:`${i}`}))


        return  <div style={{display:"flex", flexDirection:"column"}}>
                    <div className="formItem">
                        <TextSelect onChange={_handleRotateChange}  options={[{label:"true", value:"true"}, {label:"false", value:"false"}]} value={rotate ? "true": "false"}>rotate</TextSelect>
                    </div>
                    <div className="formItem">
                        <TextSelect onChange={_handlePowerChange}  options={powerlabels} value={power}>power</TextSelect>
                    </div>
                    <div className="formItem">
                        <TextSelect onChange={_handleTempChange} options={[{label:"true", value:"true"}, {label:"false", value:"false"}]} value={cool ? "true": "false"}>cool</TextSelect>
                    </div>
                    <div className="formItem">
                        <TextInput onChange={_handleFromChange} helptext={`rotation from (deg)`} value={from}>rotation from</TextInput>
                    </div>
                    <div className="formItem">
                        <TextInput onChange={_handleToChange} helptext={`rotation to (deg)`} value={to}>rotation to</TextInput>
                    </div>
                </div>
    }

    const renderParams = ()=>{
    
        switch (selectedActionProfile){
          
            case "screen-message": // message on screen!
                return _messageparams();
            case "screen-home":
                return renderSelectScreen("home");
            case "screen-dyson":
                return renderSelectScreen("air");
            case "screen-media-play":
                return _mediaparams();
            case "screen-snippet":
                return _snippetparams();
            case "screen-image": 
                return _imageparams();
            case "screen-qrcode":
                return _qrcodeparams();   
            case "nanoleaf":
                return _nanoparams();
            case "huecolour":
                return _hueparams();
            case "arm-lights":
                return _armlightsparams();
            case "arm-flash":
                return _armflashparams();
            case "arm-point":
                return _armpointparams();
            case "raw":
                return _rawparams();
            case "printline": // send to label printer
                return _printerparams();
            case "fan":
                return _fanparams();
            case "speech":    
                return _speechparams();
            
            default:
                return;

        }
    }

    const renderMethod = ()=>{
        if (selectedActionProfile == "raw"){
            return <TextSelect onChange={handleMethodChange} options={[
                {disabled:false, label:"GET", value:Method.GET},
                {disabled:false, label:"POST", value:Method.POST}
                ]} value={_action.method === Method.POST ? Method.POST : Method.GET}>
                {"method"}
            </TextSelect>
        }
    }

    const renderURL = ()=>{
        if (selectedActionProfile === "raw"){
            return <TextInput onChange={e => setAction(e.target.value)} value={_action.action.toString()} helptext={'a url or a tag!'}>url</TextInput>
        }
    }

    return (<div className="add-dialogue">
                <div className="heading">add action</div>
                <div className="formItem">
                    <TextSelect onChange={handleActionChange} options={actions.map(a => ({ label: a.name, value: a.id }))} value={selectedActionProfile}>{"action profiles"}</TextSelect>
                </div>
                <div className="description">
                    {description()}
                </div>
                <div className="formItem">
                    {renderURL()}
                </div>
                <div className="formItem">
                    {renderMethod()}
                </div>
                <div className="formItem">
                    {renderParams()}
                </div>
                <div className="formItem">
                    <TextInput style={{width:60}} onChange={e => setDelay(e.target.value)} helptext={`pause in ms BEFORE action fires`} value={`${_action.delay||0}`}>delay</TextInput>
                </div>
                <div style={{textAlign:"center"}}>
                <IconButton icon={<IconCheck />} iconOnly={true} label={""} onClick={()=>onAdd(_format(_action))} variant="primary"/> 
                <IconButton icon={<IconTrashX />} iconOnly={true} label={""} onClick={onClose} variant="primary"/> 
                </div>
            </div>)

};
