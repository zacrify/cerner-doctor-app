// import type { Auth } from '@prisma/client';
import prisma from '$lib/index';
import {
	checkAuthIDExist,
	generateCodeChallenge,
	createAuthTokenUrl,
	generatedRedirectUrl,
	createCode,
	getAuthRedirect,
	getAuthTokenUrl,
	createFhirEndpoint,
	exchangeAuthorizationCodeForToken,
	refreshNewToken,
	fetchPatient,
	getNewToken,
	getExpiredToken,
	getNeedBanner
} from './utils';
import { redirect } from '@sveltejs/kit';

async function updateAuth(url) {
	const auth = await prisma.auth.findUnique({ where: { id: 1 } });
	const access_token = auth?.access_token;
	const access_token_expiredAt = auth?.access_token_expiredAt;
	const refresh_token = auth?.refresh_token;
	const token_url = auth?.token_url;
	const now = Math.round(new Date().getTime() / 1000);
	console.log('now:', now);
	console.log('expiredAt:', access_token_expiredAt);
	if (access_token && refresh_token) {
		if (now > access_token_expiredAt) {
			console.log('old token: ', access_token);
			await refreshNewToken(token_url, refresh_token);
			// console.log(`refreshed token, now: ${now} expiredAt: ${access_token_expiredAt}`)
			const data = await prisma.auth.findUnique({
				where: { id: 1 },
				select: { access_token: true, access_token_expiredAt: true }
			});
			console.log(
				`refreshed token: ${data?.access_token} expiredAt: ${data?.access_token_expiredAt}`
			);
			// redirect(302,'/display');
		} else {
			console.log('token still valid');
			redirect(302, '/display');
		}
	} else {
		const iss = url.searchParams.get('iss') || '';
		const launch = url.searchParams.get('launch') || '';
		const code = url.searchParams.get('code') || '';
		if (iss) {
			await createFhirEndpoint(iss, launch);
			await getAuthTokenUrl(iss);
			const redirectUrl = await getAuthRedirect();
			redirect(302, redirectUrl);
		}
		if (code) {
			await createCode(code);
			const auth = await prisma.auth.findUnique({
				where: { id: 1 },
				select: { token_url: true, code_verifier: true }
			});
			const token_url = auth?.token_url;
			const code_verifier = auth?.code_verifier;
			await exchangeAuthorizationCodeForToken(code, code_verifier, token_url);
			const data = await prisma.auth.findUnique({
				where: { id: 1 },
				select: { access_token: true, access_token_expiredAt: true }
			});
			console.log('access_token:', data?.access_token_expiredAt);
			// redirect(302,'/display');
		}
	}
}

// export async function load({ url }) {
// 	console.log('start from here');

// 	if (url.pathname === '/refreshtoken' || url.pathname === '/auth') {
// 		return;
// 	  }

// 	const auth = await prisma.auth.findUnique({
// 		where: { id: 1 },
// 		select: { access_token: true, access_token_expiredAt: true }
// 	});
// 	const now = Math.round(new Date().getTime() / 1000);
// 	const access_token = auth?.access_token;
// 	if (!access_token) {
// 		console.log('no token');
// 		await getNewToken(url);
// 		console.log('get new token');
// 		// const patientData = await fetchPatient();
// 		return {
// 			patient: await fetchPatient()
// 		};
// 	} else {
// 		if (now <= auth.access_token_expiredAt) {
// 			console.log('token still valid');
// 			console.log('now:', now);
// 			console.log('expiredAt:', auth.access_token_expiredAt);
// 			return {
// 				patient: await fetchPatient()
// 			};
// 		} else {
// 			console.log('now:', now);
// 			console.log('redirect to refresh token');
// 			redirect(302, '/refreshtoken');
// 		}
// 	}
// }

export async function load({ url }) {
	if (url.pathname === '/refreshtoken' || url.pathname === '/auth') {
		return;
	}
	const data = await getExpiredToken();
	console.log( `now: ${data.now} expiredAt: ${data.access_token_expiredAt}`);

	if (data.now > data.access_token_expiredAt) {
		console.log('expired token');
		redirect(302, '/refreshtoken');
	} else {
		console.log('valid token');
		const needBanner = await getNeedBanner();
		return {
			patient: await fetchPatient(),
			needBanner: needBanner
		};
	}

}
