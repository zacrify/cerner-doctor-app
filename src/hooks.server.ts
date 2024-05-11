import type { Handle, HandleFetch, HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { parseFormData } from 'parse-nested-form-data';
// export const handle: Handle = async ({ event, resolve }) => {
// //  return new Response('Hello from the Hooks!');
// // if (event.url.pathname.startsWith('/auth')) {
// //     const session = event.cookies.get('session');
// //     return new Response(`Hello from the Hooks! ${session}`);
// // }
//     event.locals.auth = 'Hello from the Hooks! Auth'
//     return resolve(event);
// }

// export const handle: Handle = async ({ event, resolve }) => {
//     const locale = event.cookies.get('locale');
//     // const locale = 'th';
//     console.log('locale:',locale);
//     event.locals.locale = locale;
//     return resolve(event, {
//         transformPageChunk: ( {html} ) => 
//             html.replace('%lang%',locale)
//         ,
//     });
// }

const perFormance: Handle = async ({ event, resolve }) => {
    let start = performance.now();
    const response = await resolve(event);
    let end = performance.now();
    let responsTime = end - start;
    console.log('responsTime:',responsTime.toFixed(2));
    return response;
}

const parseForm: Handle = async ({ event, resolve }) => {
    console.log('parseForm run');
    if (event.request.method === 'POST') {
        const formData = await event.request.formData();
        const data = parseFormData(formData);
        event.locals.formData = data;
        console.log('+hook handle bf Parse:',formData);
        console.log('+hook handle after Parse:',data);
    }
    return resolve(event);
}

export const handleError: HandleServerError = async ({ error, event }) => {
    console.error('error:',error);
    return { message: `${error} Pleae reopen from cerner again`};
}

export const handle = sequence(perFormance,parseForm);

// export const handleFetch: HandleFetch = async ({ request, fetch }) => {
//     if (request.url.startsWith('http')) {
//         const url = request.url.replace('http','https');
//         request = new Request(url, request);
//         console.log(request.url);
//     }
//     return fetch(request);
// }