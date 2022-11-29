import * as React from 'react';
import {Story, useStoriesContext} from '../../../../store/stories';
import {CheckboxButton} from '../../../../components/control/checkbox-button';
import {IconPlus, IconWriting, IconX} from '@tabler/icons';
import { CardButton } from '../../../../components/control/card-button';
import { CardContent } from '../../../../components/container/card';
import { IconButton } from '../../../../components/control/icon-button';
import { ButtonBar } from '../../../../components/container/button-bar';



export interface RenameStoryButtonProps{
    onSelect: (stories: Story[]) => void;
}

export const ExportStoriesButton: React.FC<RenameStoryButtonProps> = props => {
    const [open, setOpen] = React.useState<boolean>(false);
	const {dispatch, stories} = useStoriesContext();
    const [selectedStories, setSelectedStories] = React.useState<Story[]>([]);
	function handleChange(story: Story, selected: boolean) {
		if (selected) {
			setSelectedStories(current => [...current, story]);
		} else {
			setSelectedStories(current =>
				current.filter(other => other.id !== story.id)
			);
		}
	}
    return <CardButton
				disabled={false}
				icon={<IconWriting/>}
				label={"export stories"}
				onChangeOpen={()=>{
					setOpen(true)
				}}
				open={open}>
				<CardContent style={{width:400, maxHeight:400, overflowY:"auto"}}>
                    <ul>{stories.map(story => (
                    <li>
                            <CheckboxButton
                                key={story.id}
                                label={story.name}
                                onChange={selected => handleChange(story, selected)}
                                value={selectedStories.includes(story)}
                            />
                        </li>
                    ))}</ul>
                    <ButtonBar>
					<IconButton
						disabled={false}
						icon={<IconPlus />}
						label={"Export"}
						onClick={()=>{
                            props.onSelect(selectedStories);
                            setOpen(false);
                        }}
						variant="create"
					/>
					<IconButton
						icon={<IconX />}
						label={"Cancel"}
						onClick={() => setOpen(false)}
					/>
				</ButtonBar>
				</CardContent>
			</CardButton>
};