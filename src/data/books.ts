// Technical books on my shelf, newest first. `favourite` books get a featured
// card on the home page.

export interface Book {
	title: string;
	author?: string;
	year: number; // year I picked it up
	topic: 'C#' | 'JavaScript' | 'Web' | 'Systems' | 'Product' | 'Practice' | 'Python' | 'Maths';
	favourite?: string; // why it matters, shown on the featured card
}

export const books: Book[] = [
	{ title: 'Operating Systems: Three Easy Pieces', author: 'Remzi & Andrea Arpaci-Dusseau', year: 2026, topic: 'Systems' },
	{ title: 'Looks Good to Me', author: 'Adrienne Braganza', year: 2025, topic: 'Practice' },
	{ title: "AI Product Manager's Handbook", author: 'Irene Bratsis', year: 2025, topic: 'Product' },
	{ title: 'The Design of Everyday Things', author: 'Don Norman', year: 2024, topic: 'Product' },
	{
		title: 'Hooked',
		author: 'Nir Eyal',
		year: 2024,
		topic: 'Product',
		favourite: 'How to build habit-forming products.',
	},
	{ title: 'React JS: From Basics to Advanced', year: 2023, topic: 'JavaScript' },
	{ title: 'Effective Pandas', author: 'Matt Harrison', year: 2023, topic: 'Python' },
	{ title: 'Head First Python', author: 'Paul Barry', year: 2023, topic: 'Python' },
	{ title: 'C# in Depth', author: 'Jon Skeet', year: 2020, topic: 'C#' },
	{ title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', year: 2016, topic: 'JavaScript' },
	{ title: 'Exam Ref 70-483: Programming in C#', author: 'Wouter de Kort', year: 2015, topic: 'C#' },
	{ title: 'Pro AngularJS', author: 'Adam Freeman', year: 2015, topic: 'JavaScript' },
	{ title: 'Professional JavaScript for Web Developers', author: 'Nicholas C. Zakas', year: 2015, topic: 'JavaScript' },
	{
		title: 'Adaptive Code via C#',
		author: 'Gary McLean Hall',
		year: 2015,
		topic: 'C#',
		favourite: 'Agile coding with design patterns and SOLID principles.',
	},
	{ title: 'Developing Web Widgets with HTML, CSS, JSON and AJAX', year: 2015, topic: 'Web' },
	{ title: 'Data Structures and Algorithms with JavaScript', author: 'Michael McMillan', year: 2015, topic: 'JavaScript' },
	{ title: 'Sets, Logic and Maths for Computing', author: 'David Makinson', year: 2014, topic: 'Maths' },
	{ title: 'Professional C# 5.0 and .NET 4.5.1', author: 'Christian Nagel et al.', year: 2014, topic: 'C#' },
	{ title: 'Programming in HTML5 with JavaScript and CSS3', author: 'Glenn Johnson', year: 2014, topic: 'Web' },
	{ title: 'C# Design Pattern Essentials', author: 'Tony Bevis', year: 2014, topic: 'C#' },
];
