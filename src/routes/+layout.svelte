<script lang="ts">
	import '../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	import { AppBar, AppRail, AppRailTile, AppRailAnchor } from '@skeletonlabs/skeleton';
	let currentTile: number = 0;


	import type { Patient } from 'fhir/r4';
	import { calculateAge } from '../config';
	import prisma from '$lib';

	let need_patient_banner: boolean = false;
	

	let form;
	export let data;

	need_patient_banner = data.needBanner;
	// let patient: Patient | undefined = undefined;
	// let patientData = { name: '', birthDate: '', age: null, id: '', gender: '' };
	// let appBarContent: string = '';
	// async function fetchPatient() {
	// 	try {
	// 		const auth = await prisma.auth.findUnique({
	// 			where: {
	// 				id: 1
	// 			},
	// 			select : {
	// 				access_token: true,
	// 				fhir_endpoint: true,
	// 				patient_id: true
	// 			}
	// 		});
	// 		const response = await fetch(
	// 			`${auth.fhir_endpoint}/Patient/${auth?.patient_id}`,
	// 			{
	// 				method: 'GET',
	// 				headers: {
	// 					Authorization: `Bearer ${auth.access_token}`
	// 				}
	// 			}
	// 		);
	// 		// const response = await axios.get(
	// 		// 	`${localStorage.getItem('fhir_endpoint')}/Patient/${localStorage.getItem('patient')}`,
	// 		// 	{
	// 		// 		headers: {
	// 		// 			Authorization: `Bearer ${localStorage.getItem('access_token')}`
	// 		// 		}
	// 		// 	}
	// 		// );
	// 		// patient = response.data;
	// 		patient = await response.json();
	// 		console.log(patient);
	// 		patientData = {
	// 			name: patient?.name?.[0]?.text || '',
	// 			birthDate: patient?.birthDate || '',
	// 			age: calculateAge(patient?.birthDate) || '',
	// 			id: patient?.identifier?.values || '',
	// 			gender: patient?.gender || ''
	// 		};
	// 		appBarContent = `${patientData.name}, age: ${patientData.age} yr, sex: ${patientData.gender}`;
	// 		// localStorage.setItem('patient', JSON.stringify(patient));
	// 		// console.log(patient);
	// 	} catch (error) {
	// 		console.error('Error fetching patient:', error);
	// 	}
	// }
</script>

<div class="flex h-screen">
	<AppRail class="hidden md:flex flex-col w-64">
		<svelte:fragment slot="lead">
			<AppRailAnchor href="/">(icon)</AppRailAnchor>
		</svelte:fragment>
		<!-- --- -->
		<AppRailTile bind:group={currentTile} name="tile-1" value={0} title="tile-1">
			<svelte:fragment slot="lead">
				<AppRailAnchor href="/">Main</AppRailAnchor></svelte:fragment
			>
		</AppRailTile>

		<AppRailTile bind:group={currentTile} name="tile-2" value={1} title="tile-2">
			<svelte:fragment slot="lead">
				<AppRailAnchor href="/display">display</AppRailAnchor>
			</svelte:fragment>
		</AppRailTile>
		<AppRailTile bind:group={currentTile} name="tile-3" value={2} title="tile-3">
			<svelte:fragment slot="lead">
				<AppRailAnchor href="/testapi">test api</AppRailAnchor>
			</svelte:fragment>
		</AppRailTile>
		<!-- --- -->
		<svelte:fragment slot="trail">
			<AppRailAnchor href="/" target="_blank" title="Account">(icon)</AppRailAnchor>
		</svelte:fragment>
	</AppRail>

	<div class="w-full">
		{#if need_patient_banner}
			<AppBar>
				<form method='POST' bind:this={form} action="?/selectpatient">
					<select class="select" size="1" name="patient" bind:value={data.patient_id} on:change={() => form.requestSubmit()}>
						{#each data.patients as patient (patient.patient_id)}
						  <option value={patient.patient_id}>{patient.Name} DOB:{patient.DOB} Gender:{patient.Sex}</option>
						{/each}		
					</select>		
				</form>
			</AppBar>
		{/if}
		<slot />
	</div>
</div>
