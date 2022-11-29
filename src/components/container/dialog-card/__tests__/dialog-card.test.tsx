import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {DialogCard, DialogCardProps} from '../dialog-card';

describe('<DialogCard>', () => {
	function renderComponent(props?: Partial<DialogCardProps>) {
		return render(
			<DialogCard
				collapsed={false}
				domId="mock-dialog-id"
				headerLabel="mock-header-label"
				onChangeCollapsed={jest.fn()}
				onClose={jest.fn()}
				{...props}
			>
				<div data-testid="dialog-card-children" />
			</DialogCard>
		);
	}

	it('calls the onChangeCollapsed prop when the header button is clicked', () => {
		const onChangeCollapsed = jest.fn();

		renderComponent({onChangeCollapsed, headerLabel: 'test-label'});
		expect(onChangeCollapsed).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('test-label'));
		expect(onChangeCollapsed).toHaveBeenCalledTimes(1);
	});

	it('calls the onClose prop when the close button is clicked', () => {
		const onClose = jest.fn();

		renderComponent({onClose});
		expect(onClose).not.toHaveBeenCalled();
		fireEvent.click(screen.getByLabelText('common.close'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('displays its children when expanded', () => {
		renderComponent({collapsed: false});
		expect(screen.getByTestId('dialog-card-children')).toBeInTheDocument();
	});

	it('does not display children when collapsed', () => {
		renderComponent({collapsed: true});
		expect(
			screen.queryByTestId('dialog-card-children')
		).not.toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
