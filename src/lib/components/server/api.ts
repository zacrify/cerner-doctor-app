
import type { State } from '@vincjo/datatables/remote';

export const reload = async (state: State) => {
	console.log(`${getParams(state)}`)
	const response = await fetch(`https://jsonplaceholder.typicode.com/todos?${getParams(state)}`);
	return response.json();
};

const getParams = (state: State) => {
	const { pageNumber, rowsPerPage, sort, filters, search, patient_id } = state;

	let params = `_page=${pageNumber}`;

	if (patient_id) {
		params += `&_id=${patient_id}`;
	}
	if (rowsPerPage) {
		params += `&_limit=${rowsPerPage}`;
	}
	if (sort) {
		params += `&_sort=${sort.orderBy}&_order=${sort.direction}`;
	}
	if (filters) {
		params += filters.map(({ filterBy, value }) => `&${filterBy}=${value}`).join();
	}
	if (search) {
		params += `&q=${search}`;
	}
	return params;
};
    