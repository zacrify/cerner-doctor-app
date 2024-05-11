import pkceChallenge from 'pkce-challenge';
import prisma from '$lib';
import type { Auth, RefreshToken, Patient } from '@prisma/client';
import { calculateAge } from '../config';
import { redirect } from '@sveltejs/kit';
import { access } from 'fs';

export const generateCodeChallenge = async () => {
	const challenge = await pkceChallenge();
	const authExist = await checkAuthIDExist(1);
	if (!authExist) {
		await prisma.auth.create({
			data: {
				id: 1,
				code_verifier: challenge.code_verifier
			}
		});
	} else {
		await prisma.auth.update({
			where: { id: 1 },
			data: { code_verifier: challenge.code_verifier }
		});
	}
	return challenge.code_challenge;
};

export async function checkAuthIDExist(myid: number) {
	const exist = await prisma.auth.count({
		where: {
			id: myid
		}
	});
	return exist;
}

export async function createAuthTokenUrl(AuthUrl: string, TokenUrl: string) {
	const authExist = await checkAuthIDExist(1);
	if (!authExist) {
		await prisma.auth.create({
			data: {
				id: 1,
				auth_url: AuthUrl,
				token_url: TokenUrl
			} as Auth
		});
	} else {
		await prisma.auth.update({
			where: { id: 1 },
			data: { auth_url: AuthUrl, token_url: TokenUrl } as Auth
		});
	}
}

export const generatedRedirectUrl = (
	auth_url: string,
	fhir_endpoint: string,
	launch: string,
	CLIENT_ID: string,
	SCOPE: string,
	Redirect_URI: string,
	codeChallenge: string
) => {
	console.log('before new URL:', auth_url);
	const authorizationUrl = new URL(auth_url);
	console.log('after new URL');
	authorizationUrl.searchParams.set('response_type', 'code');
	authorizationUrl.searchParams.set('client_id', CLIENT_ID);
	authorizationUrl.searchParams.set('redirect_uri', Redirect_URI);
	authorizationUrl.searchParams.set('scope', SCOPE);
	// authorizationUrl.searchParams.set('state', '123456');
	authorizationUrl.searchParams.set('aud', fhir_endpoint);
	authorizationUrl.searchParams.set('launch', launch);
	authorizationUrl.searchParams.set('code_challenge', codeChallenge);
	authorizationUrl.searchParams.set('code_challenge_method', 'S256');

	return authorizationUrl.href;
};

export async function createCode(code: string) {
	const authExist = await checkAuthIDExist(1);
	console.log('authExist&code:', authExist);
	if (!authExist) {
		await prisma.auth.create({
			data: {
				id: 1,
				code: code
			} as Auth
		});
	} else {
		await prisma.auth.update({
			where: { id: 1 },
			data: { code: code } as Auth
		});
	}
}

export async function getAuthTokenUrl(fhir_endpoint: string) {
	//todo get auth url & token url from fhir wellknown
	const WELLKNOWN = '/.well-known/smart-configuration';

	// const response  = await prisma.auth.findUnique({ where: { id: 1 },select: {fhir_endpoint: true} });
	// const fhirEndPoint = response?.fhir_endpoint;
	const wellKnownUrl = fhir_endpoint + WELLKNOWN;
	const wellKnownResponse = await fetch(wellKnownUrl);
	const wellKnownJson = await wellKnownResponse.json();
	await createAuthTokenUrl(wellKnownJson.authorization_endpoint, wellKnownJson.token_endpoint);
	// const data = await prisma.auth.findUnique({ where: { id: 1 }, select: { auth_url: true }});
	// console.log('auth-url updated:',data?.auth_url)
}

export async function getAuthRedirect() {
	//todo redirect to auth url
	const CLIENT_ID = '0db43914-bcb0-478a-91b5-19f90cc056a9';
	const SCOPE =
		'openid fhirUser launch patient/Patient.read user/Observation.read user/Observation.write offline_access';
	const Redirect_URI = 'http://localhost:5173/auth';
	const auth = await prisma.auth.findUnique({ where: { id: 1 } });

	const codeChallenge = await generateCodeChallenge();
	const redirectUrl = generatedRedirectUrl(
		auth?.auth_url,
		auth?.fhir_endpoint,
		auth?.launch,
		CLIENT_ID,
		SCOPE,
		Redirect_URI,
		codeChallenge
	);
	return redirectUrl;
}

export async function createFhirEndpoint(iss: string, launch: string) {
	const authExist = await checkAuthIDExist(1);
	console.log('authExist&iss:', authExist);
	if (!authExist) {
		await prisma.auth.create({
			data: {
				id: 1,
				fhir_endpoint: iss,
				launch: launch
			} as Auth
		});
	} else {
		await prisma.auth.update({
			where: { id: 1 },
			data: {
				fhir_endpoint: iss,
				launch: launch
			} as Auth
		});
	}
}

export async function exchangeAuthorizationCodeForToken(
	code: string,
	codeVerifier: string,
	token_endpoint: string
) {
	const CLIENT_ID = '0db43914-bcb0-478a-91b5-19f90cc056a9';
	const Redirect_URI = 'http://localhost:5173/auth';
	const form = new URLSearchParams();
	form.set('grant_type', 'authorization_code');
	form.set('code', code);
	form.set('client_id', CLIENT_ID);
	form.set('redirect_uri', Redirect_URI);
	form.set('code_verifier', codeVerifier);
	const tokenGeneratedAt = Math.round(new Date().getTime() / 1000);

	try {
		for (const pair of form.entries()) {
			console.log(pair[0] + ', ' + pair[1]);
		}

		const response = await fetch(token_endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: form
		});

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		const responseData = await response.json();
		await prisma.auth.update({
			where: { id: 1 },
			data: {
				access_token: responseData.access_token,
				access_token_expiredAt: tokenGeneratedAt + 15,
				// + responseData.expires_in,
				need_patient_banner: responseData.need_patient_banner,
				patient_id: responseData.patient,
				refresh_token: responseData.refresh_token,
				user_id: responseData.user,
				encounter_id: responseData.encounter
			} as Auth
		});
		
	} catch (error) {
		console.error('Error exchanging authorization code for token:', error);
	}
}

export async function refreshNewToken() {
	const auth = await prisma.auth.findUnique({
		where: { id: 1 },
		select: { token_url: true, refresh_token: true }
	});
	const token_url = auth?.token_url;
	const refresh_token = auth?.refresh_token;
	if (token_url && refresh_token) {
		//fetch new token
		const form = new URLSearchParams();
		form.set('grant_type', 'refresh_token');
		form.set('refresh_token', refresh_token);
		const tokenGeneratedAt = Math.round(new Date().getTime() / 1000);

		try {
			const response = await fetch(token_url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Accept: 'application/json'
					// 'Content-Length': '75',
					// 'Connection': 'close'
				},
				body: form
			});
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const responseData = await response.json();
			await prisma.auth.update({
				where: { id: 1 },
				data: {
					access_token: responseData.access_token,
					access_token_expiredAt: tokenGeneratedAt + 15,
					// + responseData.expires_in,
					patient_id: responseData.patient,
				} as Auth
			});
			return response;
		} catch (error) {
			// console.error('Error refreshing token:', error);
			await prisma.auth.delete({ where: { id: 1 } });
			throw new Error('Error refreshing token:');
		}
	} else {
		//redirect to get new token
	}
}

export async function fetchPatient() {
	try {
		const auth = await prisma.auth.findUnique({
			where: {
				id: 1
			},
			select: {
				access_token: true,
				fhir_endpoint: true,
				patient_id: true
			}
		});
		const response = await fetch(`${auth?.fhir_endpoint}/Patient/${auth?.patient_id}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${auth?.access_token}`,
				Accept: 'application/json'
			}
		});
		if (!response.ok) {
			redirect(302, '/refreshtoken');
		}
		const patient = await response.json();
		const patientData = {
			name: patient?.name?.[0]?.text || '',
			birthDate: patient?.birthDate || '',
			age: calculateAge(patient?.birthDate) || '',
			id: patient?.identifier?.values || '',
			gender: patient?.gender || ''
		};
		const appBarContent = `${patientData.name}, age: ${patientData.age} yr, sex: ${patientData.gender}`;
		// localStorage.setItem('patient', JSON.stringify(patient));
		console.log(appBarContent);
		return appBarContent;
	} catch (error) {
		console.error('Error fetching patient:', error);
		//direct to refreshToken() to get new token
		redirect(302, '/refreshtoken');
	}
}

export async function getNewToken(url) {
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
		console.log('ready to fetch patient');
	}
}

export async function getExpiredToken() {
	const auth = await prisma.auth.findUnique({
		where: { id: 1 },
		select: { access_token_expiredAt: true }
	});
	const now = Math.round(new Date().getTime() / 1000);
	const access_token_expiredAt = auth?.access_token_expiredAt;
	return { now:now, access_token_expiredAt:access_token_expiredAt };
}

export async function getNeedBanner() {
	const auth = await prisma.auth.findUnique({
		where: { id: 1 },
		select: { need_patient_banner: true }
	});
	const need_patient_banner = auth?.need_patient_banner;
	return need_patient_banner;
}


// export async function findPrismaData(table: string,column: string, value: string) {
// 	let exists = await prisma[table].count({
// 		where: {
// 			[column]: value
// 		}
// 	});
// 	return exists;
// }


interface PrismaTables {
	[key: string]: {
	  count: (args: { where: { [key: string]: any } }) => Promise<number>;
	};
  }
  
  export async function findPrismaData(table: keyof PrismaTables, column: string, value: string) {
	let exists = await (prisma as unknown as PrismaTables)[table].count({
	  where: {
		[column]: value,
	  },
	});
	return exists;
  }