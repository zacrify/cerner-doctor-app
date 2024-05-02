<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">

//###########

export let data;


// addAuth();
</script>




<div class="container h-full mx-auto flex justify-center border-solid border-2 border-sky-500">
	<div class="space-y-5 m-5">
		<h1 class="h1">CERNER</h1>
		<p>Patients list</p>
		<div>
			<h1>{data.url}</h1>
			<!-- <button on:click={addAuth} class="btn variant-filled">Add Auth</button> -->
			<ul>
				{#each data.post as record,i}
					<li>{i+1}. token:{record.access_token} fhir:{record.fhir_endpoint} code:{record.code} launch:{record.launch}</li>
				{/each}
			</ul>

			<!-- <pre>{JSON.stringify(data)}</pre> -->
		</div>

	</div>
</div>

