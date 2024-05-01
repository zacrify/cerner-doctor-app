<script lang="ts">
    import { page } from '$app/stores';
    export let data;
</script>

<pre>
    {JSON.stringify($page, null, 2)}
    <h1>{data.title}</h1>
<div>{@html data.content}</div>
</pre>