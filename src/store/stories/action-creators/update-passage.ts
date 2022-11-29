import escapeRegExp from 'lodash/escapeRegExp';
import {Thunk} from 'react-hook-thunk-reducer';
import {Passage, StoriesAction, StoriesState, Story} from '../stories.types';
import {createNewlyLinkedPassages} from './create-newly-linked-passages';

export interface UpdatePassageOptions {
	dontCreateNewlyLinkedPassages?: boolean;
}

/**
 * General update of a passage.
 */
export function updatePassage(
	story: Story,
	passage: Passage,
	props: Partial<Passage>,
	options: UpdatePassageOptions = {}
): Thunk<StoriesState, StoriesAction> {
	if (!story.passages.some(p => p.id === passage.id)) {
		throw new Error('This passage does not belong to this story.');
	}

	if (
		'name' in props &&
		story.passages
			.filter(p => p.name === props.name)
			.some(p => p.id !== passage.id)
	) {
		throw new Error(`There is already a passage named "${props.name}".`);
	}

	return (dispatch, getState) => {
		// Do the passage update itself.

		const oldName = passage.name;
		const oldText = passage.text;

		dispatch({
			props,
			type: 'updatePassage',
			passageId: passage.id,
			storyId: story.id
		});

		// Side effects from changes.

		if (!options.dontCreateNewlyLinkedPassages && props.text) {
			dispatch(createNewlyLinkedPassages(story, passage, props.text, oldText));
		}

		if (props.name) {
			const oldNameEscaped = escapeRegExp(oldName);

			// We only need to escape $ stuff in the new name, because it will be the
			// second argument to replace(). This is a little mindbending, but the
			// purpose of this is to replace $ with $$.

			const newNameEscaped = props.name.replace(/\$/g, '$$$$');

			const simpleLinkRegexp = new RegExp(
				'\\[\\[' + oldNameEscaped + '(\\]\\[.*?)?\\]\\]',
				'g'
			);
			const compoundLinkRegexp = new RegExp(
				'\\[\\[(.*?)(\\||->)' + oldNameEscaped + '(\\]\\[.*?)?\\]\\]',
				'g'
			);
			const reverseLinkRegexp = new RegExp(
				'\\[\\[' + oldNameEscaped + '(<-.*?)(\\]\\[.*?)?\\]\\]',
				'g'
			);

			story.passages.forEach(relinkedPassage => {
				if (
					simpleLinkRegexp.test(relinkedPassage.text) ||
					compoundLinkRegexp.test(relinkedPassage.text) ||
					reverseLinkRegexp.test(relinkedPassage.text)
				) {
					let newText = relinkedPassage.text;

					newText = newText.replace(
						simpleLinkRegexp,
						'[[' + newNameEscaped + '$1]]'
					);
					newText = newText.replace(
						compoundLinkRegexp,
						'[[$1$2' + newNameEscaped + '$3]]'
					);
					newText = newText.replace(
						reverseLinkRegexp,
						'[[' + newNameEscaped + '$1$2]]'
					);

					updatePassage(
						story,
						relinkedPassage,
						{text: newText},
						options
					)(dispatch, getState);
				}
			});
		}
	};
}
