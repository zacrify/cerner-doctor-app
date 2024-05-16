<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	import type { Observation, Bundle, BundleEntry, ListEntry } from 'fhir/r4.js';
	// export let vsData: Observation[] = data.vsData.entry ;
	export let data;
	let observations: Observation[] = data.vsData.entry;
</script>

<div class="container h-full mx-auto flex justify-center">
	<!-- <div class="space-y-5 m-5 overflow-auto">
		<h1 class="h1">CERNER</h1>
		<div >
            <form class="shadow-md rounded px-8 pt-6 pb-8 mb-4" method="POST" action='?/submitvs'>
                <label class="block text-white-700 text-sm font-bold mb-2" for="temperature">Temperature (°C):</label>
                <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id="temperature" step="0.1" required>
                <span><label class="block text-white-700 text-sm font-bold mb-2" for="sbp">Systolic BP (mmHg):</label>
                    <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id="sbp" step="1" required></span>
                <span><label class="block text-white-700 text-sm font-bold mb-2" for="dbp">Diastolic BP (mmHg):</label>
                    <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id="dbp" step="1" required></span>
                <label class="block text-white-700 text-sm font-bold mb-2" for='pr'>Pulse Rate (bpm):</label>
                <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id='pr' step='1' required>
                <label class="block text-white-700 text-sm font-bold mb-2" for='rr'>Respiratory Rate (bpm):</label>
                <input class="shadow appearance-none border rounded w-200 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" id='rr' step='1' required>
                <button class="btn variant-filled" type="submit">Submit</button>
              </form>
		</div>
		</div> -->
	<div class="table-container">
		<div class='w-30'>

			<form class="form m-4 mr-20" method="POST" action="?/submitvs">
				<p>Temperature</p>
				<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
					<div class="input-group-shim">Temp</div>
					<input type="temp" id="temp" name="temp" placeholder="37.0" />
					<button class="variant-filled-secondary">Submit</button>
				</div>


			</form>
		</div>

		<!-- Native Table Element -->
		<table class="table table-hover m-4">
			<thead>
				<tr>
					<th>No.</th>
					<th>Date</th>
					<th>Observation</th>
					<th>Value</th>
				</tr>
			</thead>
			<tbody>
				{#each observations as observation, i}
					{#if observation.resource.component}
						<tr>
							<td>{i + 1}</td>
							<td>{observation.resource.effectiveDateTime}</td>
							<td>{observation.resource.code.text} </td>
							<td>{observation.resource.component?.[0]?.valueQuantity?.value}/{observation.resource.component?.[1]?.valueQuantity?.value}</td>
						</tr>
					{:else}
						<tr>
							<td>{i + 1}</td>
							<td>{observation.resource.effectiveDateTime}</td>
							<td>{observation.resource.code.text} </td>
							<td>{observation.resource.valueQuantity?.value}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
			<!-- <tfoot>
				<tr>
					<th colspan="3">Calculated Total Weight</th>
					<td>{totalWeight}</td>
				</tr>
			</tfoot> -->
		</table>
	</div>
	
</div>
