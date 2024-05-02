<script lang="ts">
	import axios from 'axios';
	import { onMount } from 'svelte';
    import { formatDateTime, postObservationTemp, postObservationBP, postObservationPR, postObservationRR } from '../../config';

	onMount(async () => {
		await fetchVSWithToken();
	});

	let sourceData: any = {
		patient: { name: '', birthDate: '', age: null, id: '', gender: '' },
		vitalsign: { bp: [], temp: [], weight: [], pr: [], rr: [], os: [], all: [] },
		med: [],
		lab: []
	};
	let vsData: any = [];
    let temperature: number|'' = 37.2;
    let sbp: number|'' = 120;
    let dbp: number|'' = 80;
    let pr: number|'' = 80;
    let rr: number|'' = 20;
    let loading: boolean = false;
	async function fetchVSWithToken() {
		try {
			const response = await axios.get(`${localStorage.getItem('fhir_endpoint')}/Observation`, {
				params: {
					// Add your query parameters here
					patient: `${localStorage.getItem('patient')}`,
					category: 'vital-signs'
				},
				headers: {
					Authorization: `Bearer ${localStorage.getItem('access_token')}`,
					Accept: 'application/json'
				}
			});
			console.log('VitalSign Data:', response.data);
			const filteredData = response.data.entry.filter(
				(entry) => entry.resource.resourceType !== 'OperationOutcome'
			);
			vsData = filteredData;
			console.log('VitalSign Data:', filteredData);
			// localStorage.setItem('responseVitalSign', JSON.stringify(filteredData));
			filteredData.forEach((element: any) => {
				if (element.resource.code.text === 'Blood Pressure') {
					sourceData.vitalsign.bp = [
						...sourceData.vitalsign.bp,
						{
							DateTime: element.resource?.effectiveDateTime,
							BP: `${element.resource?.component?.[0]?.valueQuantity?.value}/${element.resource?.component?.[1]?.valueQuantity?.value}`
						}
					];
				}
			});
			filteredData.forEach((element: any) => {
				if (
					element.resource.code.text === 'Temperature Oral' ||
					element.resource.code.text === 'Temperature Core'
				) {
					sourceData.vitalsign.temp = [
						...sourceData.vitalsign.temp,
						{
							DateTime: element.resource?.effectiveDateTime,
							Temperature: element.resource?.valueQuantity?.value,
							temp_Unit: element.resource?.valueQuantity?.unit
						}
					];
				}
			});
			filteredData.forEach((element: any) => {
				if (element.resource.code.text === 'Weight Measured') {
					sourceData.vitalsign.weight = [
						...sourceData.vitalsign.weight,
						{
							DateTime: element.resource?.effectiveDateTime,
							Weight: element.resource?.valueQuantity?.value,
							wt_Unit: element.resource?.valueQuantity?.unit
						}
					];
				}
			});
			filteredData.forEach((element: any) => {
				if (
					element.resource.code.text === 'Pulse Sitting' ||
					element.resource.code.text === 'Peripheral Pulse Rate' ||
					element.resource.code.text === 'Heart Rate Monitored'
				) {
					sourceData.vitalsign.pr = [
						...sourceData.vitalsign.pr,
						{
							DateTime: element.resource?.effectiveDateTime,
							Pulse: element.resource?.valueQuantity?.value
						}
					];
				}
			});
			filteredData.forEach((element: any) => {
				if (element.resource.code.text === 'Respiratory Rate') {
					sourceData.vitalsign.rr = [
						...sourceData.vitalsign.rr,
						{
							DateTime: element.resource?.effectiveDateTime,
							RR: element.resource?.valueQuantity?.value
						}
					];
				}
			});
			filteredData.forEach((element: any) => {
				if (element.resource.code.text === 'Oxygen Saturation') {
					sourceData.vitalsign.os = [
						...sourceData.vitalsign.os,
						{
							DateTime: element.resource?.effectiveDateTime,
							Osat: element.resource?.valueQuantity?.value
						}
					];
				}
			});
			sourceData.vitalsign.all = combineArrays(
				sourceData.vitalsign.bp,
				sourceData.vitalsign.temp,
				sourceData.vitalsign.weight,
				sourceData.vitalsign.pr,
				sourceData.vitalsign.rr,
				sourceData.vitalsign.os
			);
			console.log('VitalSign Data:', sourceData.vitalsign.all);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}

	function combineArrays(...arrays: any[]) {
		let combined: any = [];

		arrays.forEach((array) => {
			array.forEach((obj) => {
				let existing = combined.find((item) => item.DateTime === obj.DateTime);
				if (existing) {
					Object.assign(existing, obj);
				} else {
					combined.push({ ...obj });
				}
			});
		});

		return combined;
	}

    async function handleSubmitTemp() {
        console.log(temperature)
        loading = true;
        await postObservationTemp(localStorage.getItem('fhir_endpoint'),localStorage.getItem('access_token'),localStorage.getItem('patient'),temperature);
        await postObservationBP(localStorage.getItem('fhir_endpoint'),localStorage.getItem('access_token'),localStorage.getItem('patient'),sbp,dbp);
        await postObservationPR(localStorage.getItem('fhir_endpoint'),localStorage.getItem('access_token'),localStorage.getItem('patient'),pr);
        await postObservationRR(localStorage.getItem('fhir_endpoint'),localStorage.getItem('access_token'),localStorage.getItem('patient'),rr);
        await fetchVSWithToken();
        temperature = '';
        sbp = '';
        dbp = '';
        pr = '';
        rr = '';
        loading = false;
    }
    async function handleDeleteObs(event: any) {
        console.log(event.target.id);
        await axios.delete(`${localStorage.getItem('fhir_endpoint')}/Observation/${event.target.id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                Accept: 'application/json'
            }
        });
        await fetchVSWithToken();
    }
</script>

<div class="container h-full mx-auto flex justify-center border-solid border-2 border-sky-500">
	<div class="space-y-5 m-5 overflow-auto">
		<h1 class="h1">CERNER</h1>
		<div >
            <form on:submit={handleSubmitTemp} class="shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <label class="block text-white-700 text-sm font-bold mb-2" for="temperature">Temperature (°C):</label>
                <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id="temperature" bind:value={temperature} step="0.1" required>
                <span><label class="block text-white-700 text-sm font-bold mb-2" for="sbp">Systolic BP (mmHg):</label>
                    <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id="sbp" bind:value={sbp} step="1" required></span>
                <span><label class="block text-white-700 text-sm font-bold mb-2" for="dbp">Diastolic BP (mmHg):</label>
                    <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id="dbp" bind:value={dbp} step="1" required></span>
                <label class="block text-white-700 text-sm font-bold mb-2" for='pr'>Pulse Rate (bpm):</label>
                <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id='pr' bind:value={pr} step='1' required>
                <label class="block text-white-700 text-sm font-bold mb-2" for='rr'>Respiratory Rate (bpm):</label>
                <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id='rr' bind:value={rr} step='1' required>
                <button class="btn variant-filled" type="submit">{loading?'Submitting...':'Submit'}</button>
              </form>
            <div class="table-container">  
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Code</th>
                        <th>Value</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#each vsData as entry, i}
                        <tr>
                            <td>{i}</td>
                            <td>{formatDateTime(entry.resource?.effectiveDateTime)}</td>
                            <td>{entry.resource.code.text}</td>
                            <td>{entry.resource?.valueQuantity?.value || `${entry.resource?.component?.[0]?.valueQuantity?.value}/${entry.resource?.component?.[1]?.valueQuantity?.value}`}</td>
                            <td><button id={entry.resource.id} class="btn variant-filled" on:click={handleDeleteObs}>Delete</button></td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            </div>

			<!-- {sourceData.vitalsign.all.map((item: any) => (
                <div>
                    <p>{item.DateTime}</p>
                    <p>{item.BP}</p>
                    <p>{item.Temperature}</p>
                    <p>{item.Weight}</p>
                    <p>{item.Pulse}</p>
                </div>
            ))
            } -->
		</div>
	</div>
</div>
