import * as React from 'react';
import {axe} from 'jest-axe';
import {render, screen, waitFor} from '@testing-library/react';
import {MainContent, MainContentProps} from '../main-content';

describe('<MainContent>', () => {
	function renderComponent(props?: MainContentProps) {
		return render(
			<MainContent {...props}>
				<div data-testid="mock-main-content-child" />
			</MainContent>
		);
	}

	it('renders its children', () => {
		renderComponent();
		expect(screen.getByTestId('mock-main-content-child')).toBeInTheDocument();
	});

	it('renders its title', () => {
		renderComponent({title: 'mock-title'});
		expect(screen.getByText('mock-title')).toBeInTheDocument();
	});

	it('sets the page title to its title prop', async () => {
		renderComponent({title: 'mock-title'});
		await waitFor(() => expect(document.title).not.toBe(''));
		expect(document.title).toBe('mock-title');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();
		expect(await axe(container)).toHaveNoViolations();
	});
});
