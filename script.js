// MyBlog demo application. Data is stored only in this browser.
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

let users = read("myblog_users", []);
let blogs = read("myblog_blogs", [
  { id: 1, title: "Welcome to MyBlog", category: "Getting Started", content: "This is a sample story. Register to write and publish your own blog posts.", author: "MyBlog Team", email: "" },
  { id: 2, title: "Why learn web development?", category: "Technology", content: "HTML creates structure, CSS adds design, and JavaScript makes a website interactive.", author: "MyBlog Team", email: "" }
]);
let currentUser = read("myblog_current_user", null);

function saveData() {
  localStorage.setItem("myblog_users", JSON.stringify(users));
  localStorage.setItem("myblog_blogs", JSON.stringify(blogs));
}

function showPage(page) {
  if ((page === "dashboard" || page === "create") && !currentUser) {
    alert("Please login first.");
    page = "login";
  }
  document.querySelectorAll(".page").forEach(section => section.classList.add("hidden"));
  document.getElementById(page).classList.remove("hidden");
  if (page === "home") displayBlogs();
  if (page === "dashboard") displayDashboard();
  window.scrollTo(0, 0);
}

function makeCard(blog, canDelete = false) {
  const card = document.createElement("article");
  card.className = "blog-card";
  const category = document.createElement("span");
  category.className = "category";
  category.textContent = blog.category;
  const title = document.createElement("h3");
  title.textContent = blog.title;
  const content = document.createElement("p");
  content.textContent = blog.content;
  const author = document.createElement("span");
  author.className = "author";
  author.textContent = "Written by " + blog.author;
  card.append(category, title, content, author);
  if (canDelete) {
    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.style.marginTop = "16px";
    remove.addEventListener("click", () => deleteBlog(blog.id));
    card.appendChild(remove);
  }
  return card;
}

function displayBlogs() {
  const list = document.getElementById("blogList");
  list.replaceChildren();
  blogs.forEach(blog => list.appendChild(makeCard(blog)));
}

function displayDashboard() {
  document.getElementById("welcomeUser").textContent = "Welcome, " + currentUser.name + ". Here are your posts.";
  const list = document.getElementById("myBlogs");
  list.replaceChildren();
  const mine = blogs.filter(blog => blog.email === currentUser.email);
  if (!mine.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "You have not published any blogs yet.";
    list.appendChild(empty);
  }
  mine.forEach(blog => list.appendChild(makeCard(blog, true)));
}

document.getElementById("registerForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;
  if (password.length < 6) return alert("Password must contain at least 6 characters.");
  if (users.some(user => user.email === email)) return alert("This email is already registered.");
  users.push({ name, email, password });
  saveData();
  alert("Account created. You can now login.");
  event.target.reset();
  showPage("login");
});

document.getElementById("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const user = users.find(item => item.email === email && item.password === password);
  if (!user) return alert("Email or password is incorrect. Please register first if you do not have an account.");
  currentUser = { name: user.name, email: user.email };
  localStorage.setItem("myblog_current_user", JSON.stringify(currentUser));
  event.target.reset();
  alert("Login successful.");
  showPage("dashboard");
});

document.getElementById("blogForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!currentUser) return showPage("login");
  const title = document.getElementById("blogTitle").value.trim();
  const category = document.getElementById("blogCategory").value.trim();
  const content = document.getElementById("blogContent").value.trim();
  blogs.unshift({ id: Date.now(), title, category, content, author: currentUser.name, email: currentUser.email });
  saveData();
  event.target.reset();
  alert("Your blog has been published.");
  showPage("dashboard");
});

function deleteBlog(id) {
  if (!confirm("Delete this blog post?")) return;
  blogs = blogs.filter(blog => blog.id !== id);
  saveData();
  displayDashboard();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("myblog_current_user");
  alert("You have logged out.");
  showPage("home");
}

saveData();
displayBlogs();
showPage("home");
