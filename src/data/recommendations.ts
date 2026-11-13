// LinkedIn recommendations, copied word for word from
// https://www.linkedin.com/in/imumamaheswaran/details/recommendations/
//
// `pull` is an exact excerpt from `text`, shown large. `tags` are short labels
// for what the letter talks about. `relation` follows LinkedIn's wording:
// senior (they were senior to / managed Uma), peer, or junior (reported to Uma).

export type Relation = 'senior' | 'peer' | 'junior';

export interface Recommendation {
	name: string;
	role: string;
	linkedin: string;
	date: string; // YYYY-MM-DD, as shown on LinkedIn
	relation: Relation;
	relationNote: string;
	org?: string;
	pull: string;
	tags: [string, string, string];
	text: string[];
}

export const RELATIONS: Record<Relation, { en: string }> = {
	senior: { en: 'Senior' },
	peer: { en: 'Peer' },
	junior: { en: 'Team' },
};

export const recommendations: Recommendation[] = [
	{
		name: 'Stawan Kadepurkar',
		role: 'Co-Founder & CEO, Provus Inc',
		linkedin: 'https://www.linkedin.com/in/stawan/',
		date: '2026-09-17',
		relation: 'senior',
		relationNote: "Stawan was senior to Uma but didn't manage him directly.",
		org: 'Provus',
		pull: 'Uma is a strong technical leader who combines deep architectural expertise with a very hands-on approach to execution.',
		tags: ['Ownership', 'Architecture', 'Dependable'],
		text: [
			'I’ve had the pleasure of working with Umamaheswaran at Provus over the last few years. Uma is a strong technical leader who combines deep architectural expertise with a very hands-on approach to execution.',
			'What I valued most about working with Uma was his ownership and dependability. He could be trusted with complex technical challenges, bring structure and sound judgment to them, and stay closely engaged through delivery. He has a strong ability to translate business and product requirements into scalable technical solutions while keeping execution practical.',
			'Uma is thoughtful, disciplined, and someone teams can genuinely depend on. I greatly enjoyed working with him and would recommend him to any organization looking for a strong, hands-on technology leader who can architect, build, and deliver.',
		],
	},
	{
		name: 'Nikhil Tayal',
		role: 'VP, Head of India · GCC Leader',
		linkedin: 'https://www.linkedin.com/in/nikhiltayal/',
		date: '2026-09-04',
		relation: 'senior',
		relationNote: 'Nikhil managed Uma directly, across Kovai.co, Conga and Provus.',
		org: 'Provus',
		pull: 'Having managed Uma across three companies, I can recommend him with confidence.',
		tags: ['Growth', 'Ownership', 'Mentorship'],
		text: [
			'I have had the opportunity to manage Umamaheswaran across three organizations - Kovai.co, Conga, and currently at Provus. Over past years, I have seen him grow from a Technical Lead into a Principal Software Engineer and now a Technical Architect.',
			'At Kovai.co, Uma led the development of Atomic Scope and contributed to Document360. At Conga, he worked on customer incentive management applications, strengthened engineering practices, created reusable components, and mentored other engineers. At Provus, he has architected and built CPQ Express while also contributing to Provus Enterprise Quoting.',
			'Across every organization, Uma has demonstrated strong ownership, hands-on technical depth, and an ability to translate complex business requirements into scalable and maintainable products. He moves comfortably between architecture, implementation, engineering standards, and team mentorship.',
			'Having managed Uma across three companies, I can recommend him with confidence. He is dependable, adaptable, and committed to delivering quality and I would gladly work with him again.',
		],
	},
	{
		name: 'Mariselvam Mariappan',
		role: 'Full Stack Engineer · AWS Certified Solutions Architect',
		linkedin: 'https://www.linkedin.com/in/mariselvam-m/',
		date: '2025-03-05',
		relation: 'junior',
		relationNote: 'Mariselvam reported to Uma directly.',
		org: 'Definitive Healthcare',
		pull: 'What truly sets him apart is how he seamlessly connects technical solutions with business needs while creating a positive and collaborative team environment.',
		tags: ['Leadership', 'Business sense', 'Mentoring'],
		text: [
			"I had the privilege of working under Umamaheswaran and witnessed firsthand his technical expertise, strategic thinking, and ability to tackle complex challenges. What truly sets him apart is how he seamlessly connects technical solutions with business needs while creating a positive and collaborative team environment. He is always approachable, ready to mentor, and offers guidance that helps the team grow and succeed. His problem-solving approach, combined with his dedication to the team's success, makes him a great leader. I am grateful to have had the opportunity to work with him and highly recommend him to any organization looking for a leader who values both results and his team.",
		],
	},
	{
		name: 'Chintan Jani',
		role: 'Revenue Lifecycle SME · ex-Product Owner, Conga',
		linkedin: 'https://www.linkedin.com/in/imchintanjani/',
		date: '2023-11-24',
		relation: 'peer',
		relationNote: 'Chintan worked with Uma, on a different team.',
		org: 'Conga',
		pull: 'He is one of the most well-rounded Software Engineers I have come across with a perfect blend of technical prowess and managerial acumen.',
		tags: ['Well-rounded', 'Team player', 'Curiosity'],
		text: [
			'Umamaheswaran Manivannan played an instrumental role in design and development of multiple modules at Conga but his core module was Data Sync. He is one of the most well-rounded Software Engineers I have come across with a perfect blend of technical prowess and managerial acumen. A great team player, a pragmatic developer and a fun person to work with. His passion towards new technologies and market trends is very inspiring. He is always willing to share his learnings and makes the work a very collaborative experience. He will be an asset to any team he joins.',
		],
	},
	{
		name: 'Archana Sukumaran',
		role: 'Senior Software Engineer, QA',
		linkedin: 'https://www.linkedin.com/in/archana-sukumaran/',
		date: '2019-10-23',
		relation: 'junior',
		relationNote: 'Archana reported to Uma directly.',
		org: 'Kovai.co',
		pull: 'Umamaheswaran constantly amazed me with his technical knowledge and brilliant approaches to solving problems.',
		tags: ['Problem solving', 'Approachable', 'Leadership'],
		text: [
			'It was a pleasure to work together with Umamaheswaran, who was an outstanding technical lead. He understands complex matters even when outside of his direct area of expertise. Umamaheswaran constantly amazed me with his technical knowledge and brilliant approaches to solving problems. As a technical lead, he helped and supports me for testing. We can always approach him for any doubts or help in the work. He used to help everyone without any hesitation. Very positive attitude towards work. He is an absolutely exceptional individual. His abilities in leadership are amazing.',
		],
	},
	{
		name: 'Pandiyan Murugan',
		role: 'Manager, Engineering & Services · 3x Microsoft MVP',
		linkedin: 'https://www.linkedin.com/in/pandiyan-murugan/',
		date: '2019-10-21',
		relation: 'peer',
		relationNote: 'Pandiyan worked with Uma on the same team.',
		org: 'Lightcast',
		pull: 'I wish every developer should get a senior person like Uma.',
		tags: ['C# depth', 'Craft', 'Teaching'],
		text: [
			'Umamaheswaran is one of the most inspiring team mate I worked till date.',
			'He is the C# guru. His skill set is not limited only to C#. He can do everything inside an application.',
			'I wish every developer should get a senior person like Uma.',
			'He never tolerate himself to do bad practice to a application at any cost.',
			'He never spoon feed anything to anyone. He let everyone to learn themselves and guide in an excellent way. Good luck.',
		],
	},
	{
		name: 'Suhas Parameshwara',
		role: 'Senior Full Stack Engineer',
		linkedin: 'https://www.linkedin.com/in/suhas-parameshwara/',
		date: '2019-10-19',
		relation: 'junior',
		relationNote: 'Suhas reported to Uma directly.',
		org: 'Kovai.co',
		pull: 'He was more like a friend and a great motivator.',
		tags: ['Best practices', 'Motivation', 'Curiosity'],
		text: [
			'I think seniors are very much important whenever you start your career in your respective domain. I got an awesome chance to work with Uma, where he thought me and guided me through all the best practices in coding and also being a senior software engineer, he was more like a friend and a great motivator.',
			'He is more dynamic and tries to solve the problems in a best way and also he keeps on researching new things.',
			'I wish we would do some great products in the future!Cheers!',
		],
	},
	{
		name: 'HariHaran Subramanian',
		role: 'Senior Software Engineer · 2x Microsoft Certified',
		linkedin: 'https://www.linkedin.com/in/hari-haransubramanian/',
		date: '2019-10-19',
		relation: 'junior',
		relationNote: 'HariHaran reported to Uma directly.',
		org: 'Kovai.co',
		pull: 'Little by little, day by day he made everyone better just by his presence.',
		tags: ['Craft', 'Attention to detail', 'Inspiration'],
		text: [
			"I started my career by working on Uma's team. Uma's work always inspire others to do more, learn more. Whatever work he does, he always do it in a perfect way. Even building a small feature on application, he puts his deep thoughts on that on perfecting it. Little by little, day by day he made everyone better just by his presence. I loved my journey working with him.",
		],
	},
];
