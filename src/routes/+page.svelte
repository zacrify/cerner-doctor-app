<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">

import type { Observation, Bundle, BundleEntry, ListEntry } from 'fhir/r4.js';

// export let vsData: Observation[] = data.vsData.entry ;
export let data;
let observations: Observation[] = data.vsData.entry;
</script>




<div class="container h-full mx-auto flex justify-center border-solid border-2 border-sky-500">
	<div class="space-y-5 m-5">
		<h1 class="h1">CERNER</h1>
		<p>Patients list</p>
		<div>
			<ul>
				{#each observations as observation, i}
					{#if observation.resource.component}
					<li>{i + 1}. {observation.resource.effectiveDateTime}: {observation.resource.code.text} {observation.resource.component?.[0]?.valueQuantity?.value}/{observation.resource.component?.[1]?.valueQuantity?.value}</li>
					{:else}
					  <li>{i + 1}. {observation.resource.effectiveDateTime}: {observation.resource.code.text} {observation.resource.valueQuantity?.value}</li>
					 {/if}
				{/each}
			  </ul>
		</div>

	</div>
</div>


