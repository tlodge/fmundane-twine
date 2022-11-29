import {replaceInPassage, replaceInStory} from '../find-replace';
import {Passage, Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';

describe('replaceInPassage', () => {
	let dispatch: jest.Mock;
	let passage: Passage;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory();
		passage = story.passages[0];
		passage.text = 'AaBbCc';
		passage.name = 'AaYyZz';
	});

	it.each([
		['a', '*', {}, {text: '**BbCc'}],
		['no match', '*', {}, undefined],
		['.', '*', {}, undefined],
		['x', '*', {}, undefined],
		['a', '*', {matchCase: true}, {text: 'A*BbCc'}],
		['a', '*', {includePassageNames: true}, {name: '**YyZz', text: '**BbCc'}],
		['b', '*', {includePassageNames: true}, {text: 'Aa**Cc'}],
		[
			'a',
			'*',
			{includePassageNames: true, matchCase: true},
			{name: 'A*YyZz', text: 'A*BbCc'}
		],
		['\\w', '*', {useRegexes: true}, {text: '******'}],
		['a.', '*', {matchCase: true, useRegexes: true}, {text: 'A*bCc'}],
		[
			'a.',
			'*',
			{includePassageNames: true, matchCase: true, useRegexes: true},
			{name: 'A*yZz', text: 'A*bCc'}
		],
		[
			'a.',
			'*',
			{includePassageNames: true, useRegexes: true},
			{name: '*YyZz', text: '*BbCc'}
		]
	])(
		'when asked to replace "%s" with "%s" (flags %j), dispatches %j',
		(search, replace, flags, props) => {
			replaceInPassage(
				story,
				passage,
				search,
				replace,
				flags
			)(dispatch, () => [story]);

			if (props) {
				// Tests here are loose because passage text updates trigger other
				// potential dispatches (e.g. to add newly-linked passages).

				expect(dispatch).toHaveBeenCalledWith({
					props,
					type: 'updatePassage',
					passageId: passage.id,
					storyId: story.id
				});
			} else {
				expect(dispatch).not.toHaveBeenCalled();
			}
		}
	);

	it('throws an error if the passage does not belong to the story', () => {
		story.passages[0].story = 'bad';
		expect(() =>
			replaceInPassage(story, passage, 'a', 'b', {})(dispatch, () => [story])
		).toThrow();
	});

	it('throws an error if search is an empty string', () =>
		expect(() =>
			replaceInPassage(story, passage, '', 'a', {})(dispatch, () => [story])
		).toThrow());
});

describe('replaceInStory', () => {
	let dispatch: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory(2);
		story.passages[0].text = 'AaBbCc';
		story.passages[0].name = 'AaYyZz';
		story.passages[1].text = 'AaDdEe';
		story.passages[1].name = 'AaWwXx';
	});

	it.each([
		['a', '*', {}, [{text: '**BbCc'}, {text: '**DdEe'}]],
		['no match', '*', {}, undefined],
		['.', '*', {}, undefined],
		['x', '*', {}, undefined],
		['a', '*', {matchCase: true}, [{text: 'A*BbCc'}, {text: 'A*DdEe'}]],
		[
			'a',
			'*',
			{includePassageNames: true},
			[
				{name: '**YyZz', text: '**BbCc'},
				{name: '**WwXx', text: '**DdEe'}
			]
		],
		['b', '*', {includePassageNames: true}, [{text: 'Aa**Cc'}]],
		[
			'a',
			'*',
			{includePassageNames: true, matchCase: true},
			[
				{name: 'A*YyZz', text: 'A*BbCc'},
				{name: 'A*WwXx', text: 'A*DdEe'}
			]
		],
		['\\w', '*', {useRegexes: true}, [{text: '******'}, {text: '******'}]],
		[
			'a.',
			'*',
			{matchCase: true, useRegexes: true},
			[{text: 'A*bCc'}, {text: 'A*dEe'}]
		],
		[
			'a.',
			'*',
			{includePassageNames: true, matchCase: true, useRegexes: true},
			[
				{name: 'A*yZz', text: 'A*bCc'},
				{name: 'A*wXx', text: 'A*dEe'}
			]
		],
		[
			'a.',
			'*',
			{includePassageNames: true, useRegexes: true},
			[
				{name: '*YyZz', text: '*BbCc'},
				{name: '*WwXx', text: '*DdEe'}
			]
		]
	])(
		'when asked to replace "%s" with "%s" (flags %j), dispatches %j',
		(search, replace, flags, props) => {
			replaceInStory(story, search, replace, flags)(dispatch, () => [story]);

			if (props) {
				// Tests here are loose because passage text updates trigger other
				// potential dispatches (e.g. to add newly-linked passages).

				expect(dispatch).toHaveBeenCalledWith({
					type: 'updatePassage',
					passageId: story.passages[0].id,
					props: props[0],
					storyId: story.id
				});

				if (props.length > 1) {
					expect(dispatch).toHaveBeenCalledWith({
						type: 'updatePassage',
						passageId: story.passages[1].id,
						props: props[1],
						storyId: story.id
					});
				}
			} else {
				expect(dispatch).not.toHaveBeenCalled();
			}
		}
	);
});
