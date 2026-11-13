/** How I work: five principles, from the business down to the team. */

export type Stage = {
	id: string;
	tab: string;
	label: string;
	title: string;
	body: string;
	books: string[];
};

export const stages: Stage[] = [
	{
		id: 'business',
		tab: 'Business',
		label: 'Business & domain',
		title: 'Learn the business before drawing a box.',
		body: "Start with the domain's own language. When the architecture reads like the business, people find their way around faster.",
		books: [],
	},
	{
		id: 'design',
		tab: 'Design',
		label: 'Design thinking',
		title: 'Start with the people, not the solution.',
		body: 'Understand the people, frame the right problem, and prototype before committing. A prototype is cheaper to throw away than a platform.',
		books: ['The Design of Everyday Things'],
	},
	{
		id: 'product',
		tab: 'Product',
		label: 'Product',
		title: 'What brings people back?',
		body: 'Think in user journeys and habit loops, and keep change cheap wherever the product is still learning.',
		books: ['Hooked', "AI Product Manager's Handbook"],
	},
	{
		id: 'code',
		tab: 'Code',
		label: 'Code',
		title: 'Code that stays cheap to change.',
		body: 'SOLID, clear seams and a domain free of frameworks. Not every codebase needs all of it.',
		books: ['Adaptive Code via C#', 'C# in Depth'],
	},
	{
		id: 'team',
		tab: 'Team',
		label: 'Team',
		title: 'Making the next engineer faster.',
		body: "Design reviews, kind code reviews and CI that catches what people shouldn't have to.",
		books: ['Looks Good to Me'],
	},
];
