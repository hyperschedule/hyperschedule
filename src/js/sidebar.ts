const overlay = document.getElementById("sidebar-overlay")!;
const showBtn = document.getElementById("sidebar-open")!;
const backBtn = document.getElementById("sidebar-close")!;
const sidebar = document.getElementById("selected-courses-column")!;
const results = document.getElementById("course-search-results")!;

const hide = () => {
  overlay.classList.remove("show");
  sidebar.classList.remove("show");
  results.classList.remove("inactive");
};

showBtn.addEventListener("click", () => {
  overlay.classList.add("show");
  sidebar.classList.add("show");
  results.classList.add("inactive");
});

overlay.addEventListener("click", hide);
backBtn.addEventListener("click", hide);
