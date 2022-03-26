window.addEventListener("load", function() {
	let calendarHolder = document.getElementById("calendar");
	let calendarText = document.getElementById("calendarText");
	const currentDate = new Date();
	const months = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
	calendarText.innerText = currentDate.toLocaleString("default", { month: "long" });
	for (let i = 0; i < months; ++i) {
		let dateBox = document.createElement("div");
		dateBox.classList.add("datebox");
		dateBox.innerText = "" + (i + 1);
		if (i + 1 === currentDate.getDate())
			dateBox.classList.add("currentDate");

		calendarHolder.appendChild(dateBox);
	}
});