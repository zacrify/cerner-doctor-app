<script lang="ts">
import { onMount } from 'svelte';

let cookies;
let patientId: string;
</script>


<!-- <div class="container h-full mx-auto flex justify-center border-solid border-2 border-sky-500">
	<div class="space-y-5 m-5 overflow-auto">
		<h1 class="h1">CERNER</h1>
		<div >
            <form class="shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
		</div>
		</div>
</div> -->






  