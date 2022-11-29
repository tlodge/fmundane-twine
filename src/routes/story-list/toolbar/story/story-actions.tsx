import * as React from 'react';
import request from 'superagent';
import {ButtonBar} from '../../../../components/container/button-bar';
import {RenameStoryButton} from '../../../../components/story/rename-story-button';
import {Story, updateStory, useStoriesContext} from '../../../../store/stories';
import {CreateStoryButton} from './create-story-button';
import {DeleteStoryButton} from './delete-story-button';
import {DuplicateStoryButton} from './duplicate-story-button';
import {EditStoryButton} from './edit-story-button';
import {TagStoryButton} from './tag-story-button';
import {ExportStoriesButton} from './export-stories-button';
import { convertToCaravan } from '../../../../util/caravan';


export interface StoryActionsProps {
	selectedStory?: Story;
}
const exportData = async (stories:Story[]) => {
	let name = "";
	
	const _stories = stories.reduce((acc:any,s)=>{
		name = stories.length == 1 ? s.name.replace(/\s+/g,'') : `${name}_${(s.name || "not").substring(0,3)}`;
		const arr = convertToCaravan(s);
		if (arr.length > 0){
			return [...acc, arr[0]]
		}
		return acc;
	},[])

    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(_stories,null,4)
    )}`;
	
	try{	
		await request.post('/author/save').set('Content-Type', 'application/json').send({name,layer:_stories});
	}catch(err){
		console.log("failed to transfer to fmundane engine!");
	}
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${name}.json`;
    link.click();
};

export const StoryActions: React.FC<StoryActionsProps> = props => {
	const {selectedStory} = props;
	const {dispatch, stories} = useStoriesContext();

	return (
		<ButtonBar>
			<CreateStoryButton />
			<EditStoryButton story={selectedStory} />
			<TagStoryButton story={selectedStory} />
			<RenameStoryButton
				existingStories={stories}
				onRename={name =>
					dispatch(updateStory(stories, selectedStory!, {name}))
				}
				story={selectedStory}
			/>
			<DuplicateStoryButton story={selectedStory} />
			<DeleteStoryButton story={selectedStory} />
			<ExportStoriesButton onSelect={(stories:Story[])=>{exportData(stories)}}/>
		</ButtonBar>
	);
};
