const fader = document.querySelectorAll(".fade");

const options = {
	threshold: 0.5
};

const appearOnScroll = new IntersectionObserver((entries, observer) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			entry.target.classList.add("appear");
			observer.unobserve(entry.target);
		}
	});
}, options);

fader.forEach((fader) => {
	appearOnScroll.observe(fader);
});

const menu = document.querySelector(".menu");

menu.addEventListener("click", (e) => {
	const navbar = document.querySelector(".navbar-list");
	navbar.classList.toggle("open");
});
