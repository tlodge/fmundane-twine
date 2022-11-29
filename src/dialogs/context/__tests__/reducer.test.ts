import {reducer} from '../reducer';

const mockComponent = () => null;

describe('Dialog reducer', () => {
	describe('when an addDialog action is received', () => {
		it('adds a dialog if it does not already exist', () =>
			expect(
				reducer([], {
					type: 'addDialog',
					component: mockComponent,
					props: {mockProp: true}
				})
			).toEqual([
				{collapsed: false, component: mockComponent, props: {mockProp: true}}
			]));

		it('adds a dialog if another component of its kind exists, but has different props', () =>
			expect(
				reducer(
					[
						{
							collapsed: false,
							component: mockComponent,
							props: {mockProp: true}
						}
					],
					{
						type: 'addDialog',
						component: mockComponent,
						props: {mockProp: false}
					}
				)
			).toEqual([
				{collapsed: false, component: mockComponent, props: {mockProp: true}},
				{collapsed: false, component: mockComponent, props: {mockProp: false}}
			]));

		it('expands an existing dialog if its component and props are identical', () =>
			expect(
				reducer(
					[
						{
							collapsed: true,
							component: mockComponent,
							props: {mockProp: true}
						}
					],
					{
						type: 'addDialog',
						component: mockComponent,
						props: {mockProp: true}
					}
				)
			).toEqual([
				{collapsed: false, component: mockComponent, props: {mockProp: true}}
			]));
	});

	describe('when a removeDialog action is received', () => {
		it('removes the dialog', () => {
			expect(
				reducer(
					[
						{
							collapsed: false,
							component: mockComponent,
							props: {mockProp: true}
						},
						{
							collapsed: false,
							component: mockComponent,
							props: {mockProp: false}
						}
					],
					{type: 'removeDialog', index: 0}
				)
			).toEqual([
				{
					collapsed: false,
					component: mockComponent,
					props: {mockProp: false}
				}
			]);
			expect(
				reducer(
					[
						{
							collapsed: false,
							component: mockComponent,
							props: {mockProp: true}
						},
						{
							collapsed: false,
							component: mockComponent,
							props: {mockProp: false}
						}
					],
					{type: 'removeDialog', index: 1}
				)
			).toEqual([
				{
					collapsed: false,
					component: mockComponent,
					props: {mockProp: true}
				}
			]);
		});

		it('does nothing if an incorrect index is specified', () => {
			expect(
				reducer(
					[
						{
							collapsed: false,
							component: mockComponent,
							props: {mockProp: true}
						}
					],
					{type: 'removeDialog', index: 2}
				)
			).toEqual([
				{
					collapsed: false,
					component: mockComponent,
					props: {mockProp: true}
				}
			]);
		});
	});

	describe('when a setDialogCollapsed action is received', () => {
		it('updates the dialog at the index specified', () =>
			expect(
				reducer(
					[
						{
							collapsed: false,
							component: mockComponent,
							props: {mockProp: true}
						},
						{
							collapsed: false,
							component: mockComponent,
							props: {mockProp: false}
						}
					],
					{type: 'setDialogCollapsed', collapsed: true, index: 0}
				)
			).toEqual([
				{
					collapsed: true,
					component: mockComponent,
					props: {mockProp: true}
				},
				{
					collapsed: false,
					component: mockComponent,
					props: {mockProp: false}
				}
			]));

		it('does nothing if an incorrect index is specified', () =>
			expect(
				reducer(
					[
						{
							collapsed: false,
							component: mockComponent,
							props: {mockProp: true}
						}
					],
					{type: 'setDialogCollapsed', collapsed: true, index: 2}
				)
			).toEqual([
				{
					collapsed: false,
					component: mockComponent,
					props: {mockProp: true}
				}
			]));
	});
});
