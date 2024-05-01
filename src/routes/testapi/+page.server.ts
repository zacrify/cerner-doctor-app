import { error } from '@sveltejs/kit';
import axios from 'axios';
/** @type {import('./$types').PageServerLoad} */ 
export async function load({ params }) {
	// const post = await getPostFromDatabase(params.slug);
    const post = await axios.get('https://dummyjson.com/products');
    console.log(post.data.products[0]);
	if (post) {
		return post.data.products[0];
	}
	error(404, 'Not found');
}
