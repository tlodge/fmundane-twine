import {Story, StoriesState, StoriesDispatch} from '../../stories.types';
import {updatePassage} from '../update-passage';
import {fakeStory} from '../../../../test-util';
import {createNewlyLinkedPassages} from '../create-newly-linked-passages';

jest.mock('../create-newly-linked-passages');

describe('updatePassage action creator', () => {
	const createNewlyLinkedPassagesMock = createNewlyLinkedPassages as jest.Mock;
	let dispatch: StoriesDispatch;
	let dispatchMock: jest.Mock;
	let getState: () => StoriesState;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		dispatchMock = dispatch as jest.Mock;
		story = fakeStory(1);
		getState = () => [story];
	});

	describe('The thunk it returns', () => {
		it('calls dispatch with an updatePassage action type', () => {
			updatePassage(story, story.passages[0], {name: 'test name'})(
				dispatch,
				getState
			);
			expect(dispatchMock.mock.calls).toEqual([
				[
					{
						passageId: story.passages[0].id,
						props: {name: 'test name'},
						storyId: story.id,
						type: 'updatePassage'
					}
				]
			]);
		});

		it('dispatches update actions to update links to the passage if its name changes', () => {
			story = fakeStory(3);
			story.passages[0].name = 'a';
			story.passages[1].text = '[[a]]';
			story.passages[2].text = 'unlinked';
			updatePassage(
				story,
				story.passages[0],
				{name: 'test name'},
				{dontCreateNewlyLinkedPassages: true}
			)(dispatch, getState);
			expect(dispatchMock.mock.calls).toEqual([
				[
					{
						passageId: story.passages[0].id,
						props: {name: 'test name'},
						storyId: story.id,
						type: 'updatePassage'
					}
				],
				[
					{
						passageId: story.passages[1].id,
						props: {text: '[[test name]]'},
						storyId: story.id,
						type: 'updatePassage'
					}
				]
			]);
		});

		it('handles passage name changes where the original name has regular expression characters correctly', () => {
			story = fakeStory(3);
			story.passages[0].name = '.*?\\1$1';
			story.passages[1].text = '[[.*?\\1$1]]';
			story.passages[2].text = 'unlinked';
			updatePassage(
				story,
				story.passages[0],
				{name: 'test name'},
				{dontCreateNewlyLinkedPassages: true}
			)(dispatch, getState);
			expect(dispatchMock.mock.calls).toEqual([
				[
					{
						passageId: story.passages[0].id,
						props: {name: 'test name'},
						storyId: story.id,
						type: 'updatePassage'
					}
				],
				[
					{
						passageId: story.passages[1].id,
						props: {text: '[[test name]]'},
						storyId: story.id,
						type: 'updatePassage'
					}
				]
			]);
		});

		it('handles passage name changes where the new name has regular expression characters correctly', () => {
			story = fakeStory(3);
			story.passages[0].name = 'a';
			story.passages[1].text = '[[a]]';
			updatePassage(
				story,
				story.passages[0],
				{name: '.*?\\1$1'},
				{dontCreateNewlyLinkedPassages: true}
			)(dispatch, getState);
			expect(dispatchMock.mock.calls).toEqual([
				[
					{
						passageId: story.passages[0].id,
						props: {name: '.*?\\1$1'},
						storyId: story.id,
						type: 'updatePassage'
					}
				],
				[
					{
						passageId: story.passages[1].id,
						props: {text: '[[.*?\\1$1]]'},
						storyId: story.id,
						type: 'updatePassage'
					}
				]
			]);
		});

		it('handles passage name changes where both old and new name has regular expression characters correctly', () => {
			story = fakeStory(3);
			story.passages[0].name = 'old .*?\\1$1';
			story.passages[1].text = '[[old .*?\\1$1]]';
			updatePassage(
				story,
				story.passages[0],
				{name: 'new .*?\\1$1'},
				{dontCreateNewlyLinkedPassages: true}
			)(dispatch, getState);
			expect(dispatchMock.mock.calls).toEqual([
				[
					{
						passageId: story.passages[0].id,
						props: {name: 'new .*?\\1$1'},
						storyId: story.id,
						type: 'updatePassage'
					}
				],
				[
					{
						passageId: story.passages[1].id,
						props: {text: '[[new .*?\\1$1]]'},
						storyId: story.id,
						type: 'updatePassage'
					}
				]
			]);
		});

		it("throws an error if the passage doesn't belong to the story", () =>
			expect(() =>
				updatePassage(
					story,
					{...story.passages[0], id: 'nonexistent'},
					{name: 'test name'}
				)(dispatch, getState)
			).toThrow());

		it('throws an error if the passage is being renamed to a name that already exists', () => {
			story = fakeStory(2);

			expect(() =>
				updatePassage(story, story.passages[0], {
					name: story.passages[1].name
				})(dispatch, getState)
			).toThrow();
		});

		it('calls createNewlyLinkedPassages when text is changed', () => {
			const oldText = story.passages[0].text;

			updatePassage(story, story.passages[0], {text: 'new text'})(
				dispatch,
				getState
			);
			expect(createNewlyLinkedPassagesMock.mock.calls).toEqual([
				[story, story.passages[0], 'new text', oldText]
			]);
		});

		it("doesn't call createNewlyLinkedPassages if text isn't being changed", () => {
			updatePassage(story, story.passages[0], {name: 'new name'})(
				dispatch,
				getState
			);
			expect(createNewlyLinkedPassagesMock.mock.calls).toEqual([]);
		});

		it("doesn't call createNewlyLinkedPassages if the dontCreateNewlyLinkedPassages option is true", () => {
			updatePassage(
				story,
				story.passages[0],
				{text: 'new text'},
				{dontCreateNewlyLinkedPassages: true}
			)(dispatch, getState);
			expect(createNewlyLinkedPassagesMock.mock.calls).toEqual([]);
		});
	});
});
