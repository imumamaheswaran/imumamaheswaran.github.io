// Site-wide settings. Change these to update the header, footer and RSS feed.

export const SITE_TITLE = 'Umamaheswaran';
export const SITE_DESCRIPTION =
	'Personal notes on software architecture, .NET, React and AI, from 15 years of building things. Kept by a Technical Architect, engineering manager and Taekwondo black belt.';

export const SOCIAL_LINKS = [
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/imumamaheswaran/' },
	{ label: 'X', href: 'https://x.com/imumamaheswaran' },
];

// Email, split so it isn't sitting whole in the page source for scrapers.
// The Email component joins it in the browser.
export const EMAIL = { user: 'umamaheswaran1', domain: 'gmail.com' };
