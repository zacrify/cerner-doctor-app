import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const posts = [
		{
			slug: 'sveltekit',
			content: `
			 <h1>Hello></h1>
			 <p>This cum from server</p>
			`,	 
		},
	]
	console.log('get request');
		return json(posts)
};