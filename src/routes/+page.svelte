<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	import type { Observation, Bundle, BundleEntry, ListEntry } from 'fhir/r4.js';
	// export let vsData: Observation[] = data.vsData.entry ;
	export let data;
	let observations: Observation[] = data.vsData.entry;
</script>

<div class="container h-full mx-auto flex justify-center">
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
		</table>
	</div>
	
</div>
