<script lang="ts">
	import '../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	import { AppBar, AppRail, AppRailTile, AppRailAnchor } from '@skeletonlabs/skeleton';
	let currentTile: number = 0;

	import { onMount } from 'svelte';
	import axios from 'axios';
	import pkceChallenge from 'pkce-challenge';
	import type { Patient } from 'fhir/r4';
	import { calculateAge } from '../config';

	const WELLKNOWN = '.well-known/smart-configuration';
	const CLIENT_ID = '0db43914-bcb0-478a-91b5-19f90cc056a9';
	const Redirect_URI = 'http://localhost:5173';
	const SCOPE =
		'openid fhirUser launch patient/Patient.read user/Observation.read user/Observation.write';
	let iss = '';
	let launch = '';
	let code = '';

	let authorization_endpoint = '';
	let token_endpoint = '';
	let need_patient_banner: boolean = false;

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		console.log('url', urlParams);
		iss = urlParams.get('iss') || '';

		launch = urlParams.get('launch') || '';
		code = urlParams.get('code') || '';
		if (iss) {
			try {
				localStorage.setItem('fhir_endpoint', iss);
				const response = await axios.get(`${iss}/${WELLKNOWN}`);
				authorization_endpoint = response.data.authorization_endpoint;
				token_endpoint = response.data.token_endpoint;
				localStorage.setItem('token_endpoint', token_endpoint);
				const codeChallenge = await generateCodeChallenge();
				const redirectUrl = generatedRedirectUrl(codeChallenge);
				window.location.href = redirectUrl;
			} catch (error) {
				console.error(error);
			}
		}
		if (code) {
			// try {
			await exchangeAuthorizationCodeForToken(code, localStorage.getItem('CODE_VERIFIER') || '');
			if (localStorage.getItem('access_token')) {
				await fetchPatient();
			}
			// 	console.log(response.data);
			// } catch (error) {
			// 	console.error(error);
		}
	});

	const generateCodeChallenge = async () => {
		const challenge = await pkceChallenge();
		localStorage.setItem('CODE_VERIFIER', challenge.code_verifier);
		return challenge.code_challenge;
	};

	const generatedRedirectUrl = (codeChallenge: string) => {
		const authorizationUrl = new URL(authorization_endpoint);
		authorizationUrl.searchParams.set('response_type', 'code');
		authorizationUrl.searchParams.set('client_id', CLIENT_ID);
		authorizationUrl.searchParams.set('redirect_uri', Redirect_URI);
		authorizationUrl.searchParams.set('scope', SCOPE);
		// authorizationUrl.searchParams.set('state', '123456');
		authorizationUrl.searchParams.set('aud', iss);
		authorizationUrl.searchParams.set('launch', launch);
		authorizationUrl.searchParams.set('code_challenge', codeChallenge);
		authorizationUrl.searchParams.set('code_challenge_method', 'S256');

		return authorizationUrl.href;
	};

	async function exchangeAuthorizationCodeForToken(
		authorizationCode: string,
		codeVerifier: string
	) {
		const form = new URLSearchParams();
		form.set('grant_type', 'authorization_code');
		// form.set('content-type', 'application/x-www-form-urlencoded');
		form.set('code', authorizationCode);
		form.set('client_id', CLIENT_ID);
		form.set('redirect_uri', Redirect_URI);
		form.set('code_verifier', codeVerifier);
		const tokenGeneratedAt: Number = Math.round(new Date().getTime() / 1000);
		try {
			for (var pair of form.entries()) {
				console.log(pair[0] + ', ' + pair[1]);
			}
			const response = await axios.post(localStorage.getItem('token_endpoint'), form, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
			// localStorage.setItem('patient', response.data.patient);
			localStorage.setItem('access_token', response.data.access_token);

			localStorage.setItem(
				'tokenExpired',
				JSON.stringify({ generated: tokenGeneratedAt, expiredin: response.data.expires_in })
			);

			localStorage.setItem('patient', response.data.patient);
			localStorage.setItem('user', response.data.user);
			localStorage.setItem('encounter', response.data.encounter);
			localStorage.removeItem('CODE_VERIFIER');
			need_patient_banner = response.data.need_patient_banner;
			// await fetchData();
		} catch (error) {
			console.error('Error exchanging authorization code for token:', error);
		}
	}
	let patient: Patient | undefined = undefined;
	let patientData = { name: '', birthDate: '', age: null, id: '', gender: '' };
	let appBarContent: string = '';
	async function fetchPatient() {
		try {
			const response = await axios.get(
				`${localStorage.getItem('fhir_endpoint')}/Patient/${localStorage.getItem('patient')}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('access_token')}`
					}
				}
			);
			patient = response.data;
			patientData = {
				name: patient?.name?.[0]?.text || '',
				birthDate: patient?.birthDate || '',
				age: calculateAge(patient?.birthDate) || '',
				id: patient?.identifier?.values || '',
				gender: patient?.gender || ''
			};
			appBarContent = `${patientData.name}, age: ${patientData.age} yr, sex: ${patientData.gender}`;
			// localStorage.setItem('patient', JSON.stringify(patient));
			// console.log(patient);
		} catch (error) {
			console.error('Error fetching patient:', error);
		}
	}
</script>

<div class="flex h-screen">
	<AppRail class="hidden md:flex flex-col w-64">
		<svelte:fragment slot="lead">
			<AppRailAnchor href="/">(icon)</AppRailAnchor>
		</svelte:fragment>
		<!-- --- -->
		<AppRailTile bind:group={currentTile} name="tile-1" value={0} title="tile-1">
			<svelte:fragment slot="lead">
				<AppRailAnchor href="/slug1">Slug</AppRailAnchor></svelte:fragment
			>
		</AppRailTile>

		<AppRailTile href="/display" bind:group={currentTile} name="tile-2" value={1} title="tile-2">
			<svelte:fragment slot="lead">
				<AppRailAnchor href="/display">display</AppRailAnchor>
			</svelte:fragment>
		</AppRailTile>
		<AppRailTile bind:group={currentTile} name="tile-3" value={2} title="tile-3">
			<svelte:fragment slot="lead">(icon)</svelte:fragment>
			<span>Tile 3</span>
		</AppRailTile>
		<!-- --- -->
		<svelte:fragment slot="trail">
			<AppRailAnchor href="/" target="_blank" title="Account">(icon)</AppRailAnchor>
		</svelte:fragment>
	</AppRail>

	<div class="w-full">
		{#if need_patient_banner}
			<AppBar>{appBarContent}</AppBar>
		{/if}
		<slot />
	</div>
</div>
