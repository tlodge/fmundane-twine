import * as React from 'react';
import {Helmet} from 'react-helmet';
import {useParams} from 'react-router-dom';
import {MainContent} from '../../components/container/main-content';
import {MarqueeSelection} from '../../components/marquee-selection';
import {PassageMap} from '../../components/passage/passage-map/passage-map';
import {
	DialogsContextProvider,
	PassageEditDialog,
	useDialogsContext
} from '../../dialogs';
import {
	createUntitledPassage,
	deselectPassage,
	movePassages,
	Passage,
	selectPassage,
	selectPassagesInRect,
	storyWithId
} from '../../store/stories';
import {
	UndoableStoriesContextProvider,
	useUndoableStoriesContext
} from '../../store/undoable-stories';
import {Point, Rect} from '../../util/geometry';
import {StoryEditToolbar} from './toolbar';
import './story-edit-route.css';
import {ZoomButtons} from './zoom-buttons';

export const InnerStoryEditRoute: React.FC = () => {
	const [inited, setInited] = React.useState(false);
	const {dispatch: dialogsDispatch} = useDialogsContext();
	const mainContent = React.useRef<HTMLDivElement>(null);
	const {storyId} = useParams<{storyId: string}>();
	const {
		dispatch: undoableStoriesDispatch,
		stories
	} = useUndoableStoriesContext();
	const story = storyWithId(stories, storyId);

	const selectedPassages = React.useMemo(
		() => story.passages.filter(passage => passage.selected),
		[story.passages]
	);

	const getCenter = React.useCallback(() => {
		if (!mainContent.current) {
			throw new Error(
				'Asked for the center of the main content, but it does not exist in the DOM yet'
			);
		}

		return {
			left:
				(mainContent.current.scrollLeft + mainContent.current.clientWidth / 2) /
				story.zoom,
			top:
				(mainContent.current.scrollTop + mainContent.current.clientHeight / 2) /
				story.zoom
		};
	}, [story.zoom]);

	const handleDeselectPassage = React.useCallback(
		(passage: Passage) =>
			undoableStoriesDispatch(deselectPassage(story, passage)),
		[story, undoableStoriesDispatch]
	);

	const handleDragPassages = React.useCallback(
		(change: Point) => {
			// Ignore tiny drags--they're probably caused by the user moving their
			// mouse slightly during double-clicking.

			if (Math.abs(change.left) < 1 && Math.abs(change.top) < 1) {
				return;
			}

			undoableStoriesDispatch(
				movePassages(
					story,
					story.passages.reduce<string[]>(
						(result, current) =>
							current.selected ? [...result, current.id] : result,
						[]
					),
					change.left,
					change.top
				),
				selectedPassages.length > 1
					? 'undoChange.movePassages'
					: 'undoChange.movePassages'
			);
		},
		[selectedPassages.length, story, undoableStoriesDispatch]
	);

	const handleEditPassage = React.useCallback(
		(passage: Passage) =>
			dialogsDispatch({
				type: 'addDialog',
				component: PassageEditDialog,
				props: {passageId: passage.id, storyId: story.id}
			}),
		[dialogsDispatch, story.id]
	);

	const handleSelectPassage = React.useCallback(
		(passage: Passage, exclusive: boolean) =>
			undoableStoriesDispatch(selectPassage(story, passage, exclusive)),
		[story, undoableStoriesDispatch]
	);

	const handleSelectRect = React.useCallback(
		(rect: Rect, exclusive: boolean) => {
			// The rect we receive is in screen coordinates--we need to convert to
			// logical ones.

			const logicalRect: Rect = {
				height: rect.height / story.zoom,
				left: rect.left / story.zoom,
				top: rect.top / story.zoom,
				width: rect.width / story.zoom
			};

			// This should not be undoable.

			undoableStoriesDispatch(
				selectPassagesInRect(
					story,
					logicalRect,
					exclusive ? [] : selectedPassages.map(passage => passage.id)
				)
			);
		},
		[selectedPassages, story, undoableStoriesDispatch]
	);

	// TODO: space bar scrolling

	// If we have just mounted and the story has no passages, create one for the
	// user (and skip undo history, since it was an automatic action).

	React.useEffect(() => {
		if (!inited) {
			setInited(true);

			if (story.passages.length === 0) {
				const center = getCenter();

				undoableStoriesDispatch(
					createUntitledPassage(story, center.left, center.top)
				);
			}
		}
	}, [getCenter, inited, story, undoableStoriesDispatch]);

	return (
		<div className="story-edit-route">
			<Helmet>
				<title>{story.name}</title>
			</Helmet>
			<StoryEditToolbar getCenter={getCenter} story={story} />
			<MainContent padded={false} ref={mainContent}>
				<MarqueeSelection
					container={mainContent}
					ignoreEventsOnSelector=".passage-card, .passage-toolbar"
					onSelectRect={handleSelectRect}
				/>
				<PassageMap
					formatName={story.storyFormat}
					formatVersion={story.storyFormatVersion}
					onDeselect={handleDeselectPassage}
					onDrag={handleDragPassages}
					onEdit={handleEditPassage}
					onSelect={handleSelectPassage}
					passages={story.passages}
					startPassageId={story.startPassage}
					tagColors={story.tagColors}
					zoom={story.zoom}
				/>
				<ZoomButtons story={story} />
			</MainContent>
		</div>
	);
};;

// This is a separate component so that the inner one can use
// `useEditorsContext()` and `useUndoableStoriesContext()` inside it.

export const StoryEditRoute: React.FC = () => (
	<UndoableStoriesContextProvider>
		<DialogsContextProvider>
			<InnerStoryEditRoute />
		</DialogsContextProvider>
	</UndoableStoriesContextProvider>
);
